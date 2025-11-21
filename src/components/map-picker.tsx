
"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for missing Leaflet markers
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  onPolygonCreated: (polygon: any) => void;
  center: [number, number] | null;
  zoom: number;
}

const MapPicker = ({ onLocationSelect, onPolygonCreated, center, zoom }: MapPickerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current || mapInstanceRef.current) return;

    // Dynamically import leaflet-draw only on the client-side
    import('leaflet-draw');

    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    const tileUrl = `https://maps.geoapify.com/v1/tile/osm-bright-grey/{z}/{x}/{y}.png?apiKey=${apiKey}`;
    const attribution = '&copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

    mapInstanceRef.current = L.map(mapContainerRef.current).setView(center || [20.5937, 78.9629], zoom);
    L.tileLayer(tileUrl, { attribution }).addTo(mapInstanceRef.current);

    drawnItemsRef.current = new L.FeatureGroup();
    mapInstanceRef.current.addLayer(drawnItemsRef.current);

    const drawControl = new (L.Control as any).Draw({
      edit: {
        featureGroup: drawnItemsRef.current,
      },
      draw: {
        polygon: true,
        marker: true,
        circle: false,
        polyline: false,
        rectangle: false,
        circlemarker: false,
      },
    });
    mapInstanceRef.current.addControl(drawControl);

    mapInstanceRef.current.on(L.Draw.Event.CREATED, (e) => {
      const layer = (e as L.Draw.CreatedEvent).layer;
      
      if (drawnItemsRef.current) {
        drawnItemsRef.current.clearLayers();
        drawnItemsRef.current.addLayer(layer);
      }

      if (layer instanceof L.Marker) {
        const { lat, lng } = layer.getLatLng();
        onLocationSelect(lat, lng);
      } else if ('getLatLngs' in layer && typeof layer.toGeoJSON === 'function') {
        const geoJson = layer.toGeoJSON();
        onPolygonCreated(geoJson);
        // Also set location to the polygon's center
        const center = (layer as L.Polygon).getBounds().getCenter();
        onLocationSelect(center.lat, center.lng);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, onLocationSelect, onPolygonCreated]);

  useEffect(() => {
    if (mapInstanceRef.current && center) {
        mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} className="rounded-lg" />;
};

export default MapPicker;
