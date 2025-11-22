'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

// Fix for default icon issue with webpack
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});


interface LeafletMapProps {
  onPolygonComplete?: (layer: L.Polygon | L.Rectangle) => void;
  initialData?: string; // Pass GeoJSON string
  readOnly?: boolean;
  center?: [number, number];
  zoom?: number;
}

const tileLayers = {
    street: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles © Esri',
    },
};

export default function LeafletMap({ onPolygonComplete, initialData, readOnly = false, center = [20.5937, 78.9629], zoom = 5 }: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [currentLayer, setCurrentLayer] = useState<'street' | 'satellite'>('street');

  useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: !readOnly, // Only show zoom if interactive
    });
    
    tileLayerRef.current = L.tileLayer(tileLayers[currentLayer].url, {
      attribution: tileLayers[currentLayer].attribution
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;
    mapInstanceRef.current = map;

    if (!readOnly) {
      const drawControl = new (L.Control as any).Draw({
        draw: {
          polygon: true,
          marker: false,
          circle: false,
          circlemarker: false,
          rectangle: true,
          polyline: false,
        },
        edit: {
          featureGroup: drawnItems,
          remove: true,
        },
      });
      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer;
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);
        
        if (onPolygonComplete) {
          onPolygonComplete(layer);
        }
      });
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

   useEffect(() => {
    if (mapInstanceRef.current && !initialData) {
        mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom, initialData]);


  useEffect(() => {
    if (!mapInstanceRef.current || !drawnItemsRef.current || !initialData) return;

    try {
        const geojson = JSON.parse(initialData);
        const feature = L.geoJSON(geojson, {
            style: { color: '#3388ff' }
        });
        
        drawnItemsRef.current.clearLayers();
        drawnItemsRef.current.addLayer(feature);
        
        const bounds = feature.getBounds();
        if(bounds.isValid()) {
            mapInstanceRef.current.fitBounds(bounds);
        }
    } catch(e) {
        console.error("Error parsing initial polygon data", e);
    }

  }, [initialData]);

  useEffect(() => {
    if (tileLayerRef.current) {
        tileLayerRef.current.setUrl(tileLayers[currentLayer].url);
        tileLayerRef.current.options.attribution = tileLayers[currentLayer].attribution;
        // @ts-ignore
        tileLayerRef.current.redraw();
    }
  }, [currentLayer]);


  return (
    <div ref={mapContainerRef} style={{ height: '100%', width: '100%', borderRadius: 'inherit', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 401, display: 'flex', gap: '4px' }}>
            <button 
                onClick={() => setCurrentLayer('street')} 
                className={`px-3 py-1 text-sm rounded ${currentLayer === 'street' ? 'bg-primary text-white' : 'bg-white text-black'}`}>
                Street
            </button>
            <button 
                onClick={() => setCurrentLayer('satellite')}
                className={`px-3 py-1 text-sm rounded ${currentLayer === 'satellite' ? 'bg-primary text-white' : 'bg-white text-black'}`}>
                Satellite
            </button>
        </div>
    </div>
  );
}
