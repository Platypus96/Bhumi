
"use client";

import dynamic from 'next/dynamic';

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
  onPolygonCreated: (polygon: any) => void;
  center: [number, number] | null;
  zoom: number;
}

export default function DynamicMap({ onLocationSelect, onPolygonCreated, center, zoom }: DynamicMapProps) {
  return <MapPicker onLocationSelect={onLocationSelect} onPolygonCreated={onPolygonCreated} center={center} zoom={zoom} />;
}
