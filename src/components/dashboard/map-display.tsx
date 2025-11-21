
"use client";

import dynamic from "next/dynamic";
import { Property } from "@/lib/types";
import { useState } from "react";
import { Button } from "../ui/button";

const PropertiesMap = dynamic(() => import("@/components/property-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center"><p>Loading Map...</p></div>
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

interface MapDisplayProps {
  properties: Property[];
  selectedProperty: Property | null;
}

export function MapDisplay({ properties, selectedProperty }: MapDisplayProps) {
  const [activeLayer, setActiveLayer] = useState<TileLayerKey>("street");

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 right-4 z-[1001] bg-background/80 backdrop-blur-sm rounded-lg p-1 space-x-1">
        <Button 
            size="sm" 
            variant={activeLayer === 'street' ? 'secondary' : 'ghost'}
            onClick={() => setActiveLayer('street')}
        >
            Street
        </Button>
        <Button 
            size="sm" 
            variant={activeLayer === 'satellite' ? 'secondary' : 'ghost'}
            onClick={() => setActiveLayer('satellite')}
        >
            Satellite
        </Button>
      </div>

      <PropertiesMap
        properties={properties}
        selectedProperty={selectedProperty}
        tileLayer={TILE_LAYERS[activeLayer]}
        className="h-full w-full rounded-b-lg"
      />
    </div>
  );
}
