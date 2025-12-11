import React, { useRef, useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { Business } from '../types';
import { Star, Loader2, Map as MapIcon, Layers, Activity } from 'lucide-react';
import { createRoot } from 'react-dom/client';

interface Props {
  data: Business[];
}

const BusinessMap: React.FC<Props> = ({ data }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const heatmapLayer = useRef<L.LayerGroup | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // Track previous data to prevent auto-zoom on minor updates
  const prevDataRef = useRef<string>("");

  // Default Center (Ho Chi Minh City)
  const defaultCenter: L.LatLngExpression = [10.7769, 106.7009];

  // Filter valid data
  const validBusinesses = useMemo(() => {
    return data.filter(b => 
      b.lat !== undefined && 
      b.lng !== undefined && 
      !isNaN(b.lat!) && 
      !isNaN(b.lng!) &&
      b.lat !== 0 &&
      b.lng !== 0
    );
  }, [data]);

  // Generate a signature for the current data set
  const dataSignature = useMemo(() => {
      if (validBusinesses.length === 0) return "";
      return validBusinesses.map(b => b.id).join(',');
  }, [validBusinesses]);

  // Initialize Map
  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    try {
      const map = L.map(mapContainer.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false, 
        attributionControl: false, 
        preferCanvas: true, 
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true 
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
        keepBuffer: 3
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

      // Create separate layers
      heatmapLayer.current = L.layerGroup().addTo(map);
      markersLayer.current = L.layerGroup().addTo(map); // Markers on top
      
      mapInstance.current = map;
      
      setTimeout(() => setIsMapLoaded(true), 100);

    } catch (e) {
      console.error("Leaflet init error:", e);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Handle Markers
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;

    if (prevDataRef.current === dataSignature) return;

    const layerGroup = markersLayer.current;
    layerGroup.clearLayers();

    validBusinesses.forEach(biz => {
      const marker = L.circleMarker([biz.lat!, biz.lng!], {
        radius: 6,
        fillColor: '#005993',
        color: '#ffffff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.9,
      });

      const popupDiv = document.createElement('div');
      const root = createRoot(popupDiv);
      root.render(
        <div className="min-w-[200px] font-sans text-left">
            <h3 className="font-bold text-[#005993] text-sm mb-1">{biz.name}</h3>
            <div className="text-xs text-slate-600 mb-2 line-clamp-2">{biz.address}</div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 mb-2">
                    {Number(biz.rating).toFixed(1)} <Star size={12} fill="currentColor" />
                    <span className="text-slate-400 font-normal">({biz.reviewCount} reviews)</span>
            </div>
            {biz.googleMapsUri && (
                <a 
                    href={biz.googleMapsUri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-[#005993] hover:bg-[#004d7a] !text-white text-xs py-1.5 rounded font-bold transition-colors no-underline"
                >
                    Open Map
                </a>
            )}
        </div>
      );

      marker.bindPopup(popupDiv, {
        minWidth: 220,
        maxWidth: 280,
        autoPan: true,
        autoPanPadding: [50, 50]
      });

      // Hover effects
      marker.on('mouseover', function (this: L.CircleMarker) {
        this.setStyle({ radius: 9, fillOpacity: 1, color: '#7ED3F7', weight: 3 });
      });
      marker.on('mouseout', function (this: L.CircleMarker) {
        this.setStyle({ radius: 6, fillOpacity: 0.9, color: '#ffffff', weight: 1.5 });
      });

      marker.addTo(layerGroup);
    });

    // Auto-fit bounds
    if (validBusinesses.length > 0 && prevDataRef.current !== dataSignature) {
      const bounds = L.latLngBounds(validBusinesses.map(b => [b.lat!, b.lng!]));
      if (bounds.isValid()) {
         mapInstance.current.fitBounds(bounds, { 
            padding: [50, 50], 
            maxZoom: 16,
            animate: true,
            duration: 0.5 
         });
      }
    }

    prevDataRef.current = dataSignature;

  }, [validBusinesses, isMapLoaded, dataSignature]);

  // Handle Heatmap / Grid Analysis
  useEffect(() => {
    if (!mapInstance.current || !heatmapLayer.current) return;
    
    const layer = heatmapLayer.current;
    layer.clearLayers();

    if (!showHeatmap || validBusinesses.length === 0) return;

    // 1. Calculate Bounds
    const bounds = L.latLngBounds(validBusinesses.map(b => [b.lat!, b.lng!]));
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();

    // 2. Define Grid Size (e.g., 8x8 grid based on current view aspect)
    const latSpan = north - south;
    const lngSpan = east - west;
    
    if (latSpan === 0 || lngSpan === 0) return;

    const gridSize = 8; // 8x8 grid
    const latStep = latSpan / gridSize;
    const lngStep = lngSpan / gridSize;

    const gridCounts: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
    let maxCount = 0;

    // 3. Count points in each cell
    validBusinesses.forEach(b => {
        const latIdx = Math.min(Math.floor((b.lat! - south) / latStep), gridSize - 1);
        const lngIdx = Math.min(Math.floor((b.lng! - west) / lngStep), gridSize - 1);
        
        if (latIdx >= 0 && lngIdx >= 0) {
            gridCounts[latIdx][lngIdx]++;
            maxCount = Math.max(maxCount, gridCounts[latIdx][lngIdx]);
        }
    });

    // 4. Draw Cells (Circles now)
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const count = gridCounts[i][j];
            if (count === 0) continue;

            const cellSouth = south + (i * latStep);
            const cellWest = west + (j * lngStep);
            
            // Calculate Center of the cell
            const cellCenterLat = cellSouth + (latStep / 2);
            const cellCenterLng = cellWest + (lngStep / 2);

            const intensity = count / maxCount;
            
            // Color Logic:
            let color = '#22c55e'; // Green
            let statusText = 'Potential Gap';
            if (intensity > 0.6) {
                color = '#ef4444'; // Red
                statusText = 'High Competition';
            }
            else if (intensity > 0.3) {
                color = '#eab308'; // Yellow
                statusText = 'Moderate';
            }
            
            // Calculate radius in meters (approx)
            // 1 deg lat = ~111111 meters. 
            // Use slightly less than half width to leave gaps
            const radiusMeters = (Math.min(latStep, lngStep) * 111111) / 2.5; 

            const circle = L.circle([cellCenterLat, cellCenterLng], {
                color: 'transparent',
                fillColor: color,
                fillOpacity: 0.3 + (intensity * 0.4),
                radius: radiusMeters,
                className: 'heatmap-circle'
            });

            // Tooltip for analysis
            circle.bindTooltip(`
                <div class="text-xs font-bold text-slate-800">
                    Density: ${count} businesses<br/>
                    <span style="color:${color}">${statusText}</span>
                </div>
            `, { direction: 'top', opacity: 0.95 });

            circle.addTo(layer);
        }
    }

  }, [showHeatmap, validBusinesses]);

  return (
    // Added z-0 to establish stacking context relative to the page flow, so sticky header z-50 wins.
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-lg relative bg-slate-100 group z-0">
      <div ref={mapContainer} className="w-full h-full z-0" style={{ opacity: isMapLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }} />
      
      {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-[#005993] animate-spin" />
                  <span className="text-xs font-medium text-slate-400">Loading Map...</span>
              </div>
          </div>
      )}
      
      {/* Bottom Info Bar */}
      <div className="absolute bottom-5 left-4 z-[400] bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#005993] shadow-sm flex items-center gap-2 pointer-events-none">
         <span className="w-2 h-2 rounded-full bg-[#005993] animate-pulse"></span>
         {validBusinesses.length} locations found
      </div>

      {/* Heatmap Toggle Control */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow-md border text-xs font-bold transition-all active:scale-95 ${
            showHeatmap 
              ? 'bg-[#005993] text-white border-[#005993]' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {showHeatmap ? <Activity className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          {showHeatmap ? 'Density On' : 'Analyze Area'}
        </button>

        {showHeatmap && (
            <div className="bg-white/95 backdrop-blur border border-slate-200 p-2 rounded-xl shadow-md text-[10px] animate-in slide-in-from-left-2 text-[#005993] font-bold">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-red-500 opacity-60"></span>
                    <span>High Competition</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-60"></span>
                    <span>Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 opacity-60"></span>
                    <span>Potential Gap</span>
                </div>
            </div>
        )}
      </div>
      
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
          padding: 0;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 12px;
          line-height: 1.4;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default BusinessMap;