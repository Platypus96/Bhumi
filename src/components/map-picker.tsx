
"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for missing Leaflet markers
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Interface for the component props
interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  center: [number, number] | null;
  zoom: number;
}

const MapPicker = ({ onLocationSelect, center, zoom }: MapPickerProps) => {
  // Create refs for the map container and the map instance
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Ensure this code runs only in the browser and the container is available
    if (!isClient || !mapContainerRef.current) return;

    // THE GUARD CLAUSE: If the map instance already exists, do nothing.
    if (mapInstanceRef.current) return;
    
    // --- Map Initialization ---
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    const tileUrl = `https://maps.geoapify.com/v1/tile/osm-bright-grey/{z}/{x}/{y}.png?apiKey=${apiKey}`;
    const attribution = '&copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

    // Initialize the map on the container ref
    mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true, // Ensure zoom controls are enabled
    }).setView(center || [20.5937, 78.9629], zoom); // Default view over India

    // Add the tile layer
    L.tileLayer(tileUrl, { attribution }).addTo(mapInstanceRef.current);

    // --- Event Handling ---
    mapInstanceRef.current.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      // Update marker position or create it if it doesn't exist
      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng);
      } else {
        markerRef.current = L.marker(e.latlng).addTo(mapInstanceRef.current!);
      }
      
      onLocationSelect(lat, lng);
    });

    // --- Cleanup Function ---
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, onLocationSelect]);

  // Effect to update map view when center or zoom props change
  useEffect(() => {
    if (mapInstanceRef.current && center) {
        mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom])

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: '100%', height: '100%', zIndex: 1 }} 
      className="rounded-lg"
    />
  );
};

export default MapPicker;
