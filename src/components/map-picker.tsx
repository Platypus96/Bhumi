
"use client";

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for missing Leaflet markers - this now runs only once when the module is loaded
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


// Interface for the props
interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

// Helper component to handle clicks
function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

// Main Component - Changed to a const export
const MapPicker = ({ onLocationSelect }: MapPickerProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  const mapStyle = "satellite"; // or 'hybrid', 'streets', etc.
  const tileUrl = `https://maps.geoapify.com/v1/tile/${mapStyle}/{z}/{x}/{y}.png?apiKey=${apiKey}`;
  const attribution = '&copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

  return (
    <MapContainer 
      center={[20.5937, 78.9629]} // India
      zoom={5} 
      style={{ height: '400px', width: '100%', zIndex: 1 }}
    >
      <TileLayer
        attribution={attribution}
        url={tileUrl}
      />
      <LocationMarker onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
}

export default MapPicker;
