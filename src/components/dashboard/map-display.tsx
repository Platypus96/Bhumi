
"use client";

import dynamic from "next/dynamic";
import { Property } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { MapPinned } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

const PropertiesMap = dynamic(() => import("@/components/property-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center"><p>Loading Map...</p></div>
});

const TILE_LAYERS = {
  street: {
    url: `https://maps.geoapify.com/v1/tile/osm-bright-grey/{z}/{x}/{y}.png?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`,
    attribution: '&copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: `https://maps.geoapify.com/v1/tile/satellite/{z}/{x}/{y}.png?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`,
    attribution: '&copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>',
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
    <Card className="h-full shadow-lg relative overflow-hidden">
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
        className="h-full w-full"
      />
    </Card>
  );
}

