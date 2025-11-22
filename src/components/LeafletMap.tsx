'use client';

import { useEffect, useRef } from 'react';
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
  onPolygonComplete?: (geojson: string) => void;
  initialData?: string; // Pass GeoJSON string
  readOnly?: boolean;
  center?: [number, number];
  zoom?: number;
}

export default function LeafletMap({ onPolygonComplete, initialData, readOnly = false, center = [20.5937, 78.9629], zoom = 5 }: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current).setView(center, zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
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
          const geojson = layer.toGeoJSON();
          onPolygonComplete(JSON.stringify(geojson));
        }
      });
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

   useEffect(() => {
    if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);


  useEffect(() => {
    if (!mapInstanceRef.current || !drawnItemsRef.current || !initialData) return;

    try {
        const geojson = JSON.parse(initialData);
        const feature = L.geoJSON(geojson, {
            style: { color: '#3388ff' }
        });
        
        drawnItemsRef.current.clearLayers();
        drawnItemsRef.current.addLayer(feature);
        mapInstanceRef.current.fitBounds(feature.getBounds());
    } catch(e) {
        console.error("Error parsing initial polygon data", e);
    }

  }, [initialData]);

  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />;
}
