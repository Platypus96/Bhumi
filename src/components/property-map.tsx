
"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/lib/types';
import ReactDOMServer from 'react-dom/server';
import { Button } from './ui/button';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import Image from 'next/image';

// Fix for default icon issue with webpack
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});


interface PropertiesMapProps {
  properties: Property[];
}

const MiniPropertyCard = ({ property }: { property: Property }) => (
    <div className="w-64">
        <Card className="shadow-none border-0">
             <CardHeader className="p-0">
                 <div className="relative aspect-video">
                    <Image src={property.imageUrl} alt={property.title} fill className="object-cover rounded-t-lg" />
                 </div>
             </CardHeader>
             <CardContent className="p-3">
                 <h3 className="font-bold text-base line-clamp-1">{property.title}</h3>
                 <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>
             </CardContent>
             <CardFooter className="p-3 pt-0">
                 <Button asChild size="sm" className="w-full">
                     <Link href={`/property/${property.parcelId}`}>
                         View Details <ExternalLink className="ml-2 h-4 w-4"/>
                     </Link>
                 </Button>
             </CardFooter>
        </Card>
    </div>
)

const getStyle = (property: Property) => {
    if (property.forSale) {
        return { color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.3 }; // Red
    }
    if (property.status === 'verified') {
        return { color: '#22c55e', weight: 2, fillColor: '#22c55e', fillOpacity: 0.3 }; // Green
    }
    if (property.status === 'rejected') {
        return { color: '#a855f7', weight: 2, fillColor: '#a855f7', fillOpacity: 0.3 }; // Purple
    }
    return { color: '#f59e0b', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.3 }; // Amber for pending
};


const PropertiesMap = ({ properties }: PropertiesMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapInstanceRef.current) return; // Already initialized

    if (mapContainerRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629], // Default to India
        zoom: 5,
      });

      L.tileLayer(
        `https://maps.geoapify.com/v1/tile/osm-bright-grey/{z}/{x}/{y}.png?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`,
        {
          attribution: '&copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        }
      ).addTo(mapInstanceRef.current);
    }
     return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && properties) {
        // Clear existing layers (except the tile layer)
        map.eachLayer(layer => {
            if (layer instanceof L.Marker || layer instanceof L.GeoJSON) {
                map.removeLayer(layer);
            }
        });
        
        const layers: L.Layer[] = [];

        properties.forEach(prop => {
            let layer: L.Layer | null = null;
            if (prop.polygon) {
                try {
                    const geoJson = JSON.parse(prop.polygon);
                    layer = L.geoJSON(geoJson, { style: getStyle(prop) });
                } catch (e) {
                    console.error("Failed to parse polygon", e);
                }
            } else if (prop.latitude && prop.longitude) {
                layer = L.marker([prop.latitude, prop.longitude]);
            }
            
            if (layer) {
                const popupContent = ReactDOMServer.renderToString(<MiniPropertyCard property={prop} />);
                layer.bindPopup(popupContent);
                layer.addTo(map);
                layers.push(layer);
            }
        });
        
        if (layers.length > 0) {
            const group = new L.FeatureGroup(layers);
            map.fitBounds(group.getBounds().pad(0.1));
        } else {
             // If no properties, default view
            map.setView([20.5937, 78.9629], 5);
        }
    }
  }, [properties]);

  return (
    <div className="rounded-xl overflow-hidden shadow-lg h-[600px] border">
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

export default PropertiesMap;
