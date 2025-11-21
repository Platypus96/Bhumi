
"use client";

import dynamic from 'next/dynamic';

// Dynamically import the MapPicker component
// ssr: false prevents "window is not defined" error
// loading: shows a skeleton while the heavy map JS loads
const MapPicker = dynamic(() => import('./map-picker'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-500">
      Loading Map...
    </div>
  )
});

interface DynamicMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  center: [number, number] | null;
  zoom: number;
}

export default function DynamicMap({ onLocationSelect, center, zoom }: DynamicMapProps) {
  return <MapPicker onLocationSelect={onLocationSelect} center={center} zoom={zoom} />;
}
