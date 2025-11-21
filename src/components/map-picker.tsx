
"use client";

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for missing Leaflet markers - this should run once when the module is loaded.
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

// Main Component
const MapPicker = ({ onLocationSelect }: MapPickerProps) => {
  const [isClient, setIsClient] = useState(false);

  // This ensures that the component only renders on the client side.
  useEffect(() => {
    setIsClient(true);
  }, []);


  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  const mapStyle = "satellite"; 
  const tileUrl = `https://maps.geoapify.com/v1/tile/${mapStyle}/{z}/{x}/{y}.png?apiKey=${apiKey}`;
  const attribution = '&copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

  // Render a placeholder on the server and during initial client render,
  // then render the actual map once we're sure we are on the client.
  return (
    <div style={{ height: '400px', width: '100%' }}>
      {isClient ? (
        <MapContainer 
          center={[20.5937, 78.9629]} // India
          zoom={5} 
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution={attribution}
            url={tileUrl}
          />
          <LocationMarker onLocationSelect={onLocationSelect} />
        </MapContainer>
      ) : (
         <div className="h-full w-full bg-muted animate-pulse rounded-xl flex items-center justify-center text-muted-foreground">
            Initializing Map...
         </div>
      )}
    </div>
  );
}

export default MapPicker;
