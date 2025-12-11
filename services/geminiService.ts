import { GoogleGenAI } from "@google/genai";
import { Business } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchBusinessData = async (
  industry: string,
  location: string,
  language: 'vi' | 'en' = 'vi',
  excludeNames: string[] = []
): Promise<Business[]> => {
  try {
    // Ultra-concise exclusion list to save tokens
    const exclusion = excludeNames.length > 0 ? `Excluding: ${JSON.stringify(excludeNames)}.` : "";
    
    // Minimal language instruction
    const langNote = language === 'vi' ? "Values in Vietnamese." : "Values in English.";

    // HIGHLY OPTIMIZED PROMPT: Token Efficient & Max Quantity
    const prompt = `
      List exactly 20 real businesses for category "${industry}" in "${location}".
      Expand search semantically (e.g., "Pet" -> Vet, Shop, Grooming).
      ${exclusion} ${langNote}

      Return a RAW JSON Array. No markdown. No comments.
      Schema:
      [
        {
          "name": "string",
          "address": "string",
          "lat": number,
          "lng": number,
          "rating": number (1-5),
          "reviewCount": number,
          "phone": "string",
          "description": "short string",
          "businessStatus": "OPERATIONAL" | "CLOSED",
          "priceLevel": "$"-"$$$$",
          "types": ["string"],
          "openingHours": ["string"],
          "serviceOptions": {"dineIn":bool,"delivery":bool,"takeout":bool},
          "website": "string"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        // Limit output tokens to prevent cutting off the list, but prompt is short enough now
      },
    });

    const text = response.text || "";
    
    // Clean up text
    let cleanText = text.replace(/```json|```/g, "").trim();

    // Fix potential JSON formatting issues from AI
    const firstBracket = cleanText.indexOf('[');
    if (firstBracket !== -1) {
        cleanText = cleanText.substring(firstBracket);
    }
    const lastBracket = cleanText.lastIndexOf(']');
    if (lastBracket !== -1) {
        cleanText = cleanText.substring(0, lastBracket + 1);
    }

    let parsedData: any[] = [];
    try {
      parsedData = JSON.parse(cleanText);
    } catch (e) {
      console.warn("Parsing failed, attempting repair:", e);
      // Simple repair for truncated JSON
      if (cleanText.trim().startsWith('[')) {
          try {
             parsedData = JSON.parse(cleanText + ']');
          } catch (e2) { return []; }
      } else {
          return [];
      }
    }

    if (!Array.isArray(parsedData)) return [];

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const businesses: Business[] = parsedData.map((item: any) => {
      // Map grounding URI
      const match = groundingChunks.find((chunk: any) => {
         const title = chunk.maps?.title || chunk.web?.title || "";
         return title.toLowerCase().includes(item.name?.toLowerCase());
      });
      const uri = match?.maps?.uri || match?.web?.uri;

      return {
        id: `biz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || "Unknown",
        address: item.address || location,
        lat: item.lat || null,
        lng: item.lng || null,
        rating: Number(item.rating) || 0,
        reviewCount: Number(item.reviewCount) || 0,
        website: item.website || null,
        phone: item.phone || null,
        businessType: industry,
        types: Array.isArray(item.types) ? item.types : [industry],
        description: item.description || "",
        googleMapsUri: uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}`,
        businessStatus: item.businessStatus === 'CLOSED' ? 'CLOSED_TEMPORARILY' : 'OPERATIONAL',
        priceLevel: item.priceLevel || null,
        openingHours: Array.isArray(item.openingHours) ? item.openingHours : [],
        serviceOptions: item.serviceOptions || { dineIn: false, delivery: false, takeout: false },
        photos: [], 
        reviews: []
      };
    });

    return businesses;

  } catch (error: any) {
    console.error(`Error fetching for ${location}:`, error);
    throw error;
  }
};
