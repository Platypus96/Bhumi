
"use client";

import dynamic from 'next/dynamic';

// Dynamically import the MapPicker component
// ssr: false prevents "window is not defined" error
// loading: shows a skeleton while the heavy map JS loads
const MapPicker = dynamic(() => import('./map-picker'), { 
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-500">
      Loading Map...
    </div>
  )
});

interface DynamicMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function DynamicMap({ onLocationSelect }: DynamicMapProps) {
  return <MapPicker onLocationSelect={onLocationSelect} />;
}
