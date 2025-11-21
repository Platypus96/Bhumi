
"use client";

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

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  onPolygonCreated: (polygon: any) => void;
  center: [number, number] | null;
  zoom: number;
}

const MapPicker = ({ onLocationSelect, onPolygonCreated, center, zoom }: MapPickerProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Guard clause: If the map instance already exists, do nothing.
    if (mapInstanceRef.current) {
        // If center or zoom props change, update the existing map's view
        if (center) {
            mapInstanceRef.current.setView(center, zoom);
        }
        return;
    }

    // Initialize the map only if it doesn't exist and the container is available
    if (mapContainerRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: center || [20.5937, 78.9629],
        zoom: zoom,
      });

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      ).addTo(mapInstanceRef.current);

      const drawnItems = new L.FeatureGroup();
      mapInstanceRef.current.addLayer(drawnItems);
      
      const drawControl = new (L.Control as any).Draw({
        edit: {
          featureGroup: drawnItems,
        },
        draw: {
          polygon: true,
          marker: true,
          circle: false,
          rectangle: false,
          polyline: false,
          circlemarker: false,
        },
      });

      mapInstanceRef.current.addControl(drawControl);

      mapInstanceRef.current.on(L.Draw.Event.CREATED, (e) => {
        const layer = e.layer;
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);

        if (layer instanceof L.Marker) {
          const { lat, lng } = layer.getLatLng();
          onLocationSelect(lat, lng);
        } else if (layer instanceof L.Polygon) {
          const geoJson = layer.toGeoJSON();
          onPolygonCreated(geoJson);
          const center = layer.getBounds().getCenter();
          onLocationSelect(center.lat, center.lng);
        }
      });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, onLocationSelect, onPolygonCreated]);

  return (
    <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 1 }} className="rounded-lg" />
  );
};

export default MapPicker;
