
"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from './ui/button';

const MapPicker = dynamic(() => import('./map-picker'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-500">
      Loading Map...
    </div>
  )
});

const TILE_LAYERS = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
     url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
};

type TileLayerKey = keyof typeof TILE_LAYERS;


interface DynamicMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  onPolygonCreated: (polygon: any) => void;
  center: [number, number] | null;
  zoom: number;
}

export default function DynamicMap({ onLocationSelect, onPolygonCreated, center, zoom }: DynamicMapProps) {
  const [activeLayer, setActiveLayer] = useState<TileLayerKey>("street");

  return (
    <div className="relative h-full w-full">
        <div className="absolute top-2 right-2 z-[1001] bg-background/80 backdrop-blur-sm rounded-lg p-1 space-x-1">
            <Button 
                size="sm" 
                variant={activeLayer === 'street' ? 'secondary' : 'ghost'}
                onClick={() => setActiveLayer('street')}
                type="button"
            >
                Street
            </Button>
            <Button 
                size="sm" 
                variant={activeLayer === 'satellite' ? 'secondary' : 'ghost'}
                onClick={() => setActiveLayer('satellite')}
                type="button"
            >
                Satellite
            </Button>
        </div>
        <MapPicker 
            onLocationSelect={onLocationSelect} 
            onPolygonCreated={onPolygonCreated} 
            center={center} 
            zoom={zoom}
            tileLayer={TILE_LAYERS[activeLayer]}
        />
    </div>
  );
}
