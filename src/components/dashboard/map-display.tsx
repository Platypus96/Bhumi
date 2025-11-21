
"use client";

import dynamic from "next/dynamic";
import { Property } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { MapPinned } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

const PropertiesMap = dynamic(() => import("@/components/property-map"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted animate-pulse flex items-center justify-center"><p>Loading Map...</p></div>
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
      <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm rounded-lg p-1 space-x-1">
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

      {!selectedProperty && (
        <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 bg-background/90 rounded-2xl shadow-2xl">
            <MapPinned className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Property Selected</h3>
            <p className="mt-1 text-sm text-muted-foreground">Select a property from the list to view its details on the map.</p>
          </div>
        </div>
      )}
    </Card>
  );
}

