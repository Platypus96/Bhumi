
"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/lib/types';
import ReactDOMServer from 'react-dom/server';
import { Button } from './ui/button';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Fix for default icon issue with webpack
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

interface TileLayer {
    url: string;
    attribution: string;
}

interface PropertiesMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  tileLayer: TileLayer;
  className?: string;
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
                     <Link href={`/property/${property.parcelId}`} target="_blank">
                         View Details <ExternalLink className="ml-2 h-4 w-4"/>
                     </Link>
                 </Button>
             </CardFooter>
        </Card>
    </div>
)

const getStyle = (property: Property, isSelected: boolean) => {
    let style = { color: '#f59e0b', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.2 }; // Amber for pending

    if (property.forSale) {
        style = { color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.2 }; // Red
    } else if (property.status === 'verified') {
        style = { color: '#22c55e', weight: 2, fillColor: '#22c55e', fillOpacity: 0.2 }; // Green
    } else if (property.status === 'rejected') {
        style = { color: '#a855f7', weight: 2, fillColor: '#a855f7', fillOpacity: 0.2 }; // Purple
    }

    if (isSelected) {
        style.weight = 4;
        style.fillOpacity = 0.5;
    }
    
    return style;
};


const PropertiesMap = ({ properties, selectedProperty, tileLayer, className }: PropertiesMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Map<string, L.Layer>>(new Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current, {
            center: [20.5937, 78.9629],
            zoom: 5,
        });
    }

    // Handle tile layer changes
    if (!tileLayerRef.current) {
        tileLayerRef.current = L.tileLayer(tileLayer.url, { attribution: tileLayer.attribution }).addTo(mapInstanceRef.current);
    } else {
        tileLayerRef.current.setUrl(tileLayer.url);
        // Leaflet's setUrl does not update attribution, so we update it manually if needed.
        if (tileLayerRef.current.options.attribution !== tileLayer.attribution) {
            mapInstanceRef.current.attributionControl.removeAttribution(tileLayerRef.current.options.attribution || '');
            mapInstanceRef.current.attributionControl.addAttribution(tileLayer.attribution);
            tileLayerRef.current.options.attribution = tileLayer.attribution;
        }
    }
     
     return () => {
      // Defer removal to unmount only
    };
  }, [tileLayer]);

  useEffect(() => {
    // This effect runs on unmount
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    }
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove layers that are no longer in properties
    layersRef.current.forEach((layer, parcelId) => {
        if (!properties.find(p => p.parcelId === parcelId)) {
            map.removeLayer(layer);
            layersRef.current.delete(parcelId);
        }
    });

    const allLayers: L.Layer[] = [];
    
    properties.forEach(prop => {
        const isSelected = selectedProperty?.parcelId === prop.parcelId;
        const existingLayer = layersRef.current.get(prop.parcelId);

        let layer: L.Layer | null = null;
        if (prop.polygon) {
            try {
                const geoJson = JSON.parse(prop.polygon);
                const style = getStyle(prop, isSelected);

                if (existingLayer && existingLayer instanceof L.GeoJSON) {
                    existingLayer.setStyle(style);
                    layer = existingLayer;
                } else {
                    if (existingLayer) map.removeLayer(existingLayer); // remove old marker if type changed
                    layer = L.geoJSON(geoJson, { style });
                }
            } catch (e) {
                console.error("Failed to parse polygon", e);
            }
        } else if (prop.latitude && prop.longitude) {
             if (existingLayer && existingLayer instanceof L.Marker) {
                layer = existingLayer;
            } else {
                 if (existingLayer) map.removeLayer(existingLayer);
                layer = L.marker([prop.latitude, prop.longitude]);
            }
        }
        
        if (layer) {
             if (!existingLayer) {
                const popupContent = ReactDOMServer.renderToString(<MiniPropertyCard property={prop} />);
                layer.bindPopup(popupContent);
                layer.addTo(map);
                layersRef.current.set(prop.parcelId, layer);
            }
            allLayers.push(layer);
        }
    });
    
    if (selectedProperty) {
      const selectedLayer = layersRef.current.get(selectedProperty.parcelId);
      if (selectedLayer) {
        const bounds = selectedLayer instanceof L.FeatureGroup || selectedLayer instanceof L.GeoJSON ? (selectedLayer as L.FeatureGroup).getBounds() : (selectedLayer as L.Marker).getLatLng();
        if (bounds) {
          map.flyToBounds(bounds instanceof L.LatLngBounds ? bounds.pad(0.1) : L.latLngBounds(bounds, bounds), { duration: 0.8, maxZoom: 16 });
        }
      }
    } else if (allLayers.length > 0) {
        const group = new L.FeatureGroup(allLayers);
        map.fitBounds(group.getBounds().pad(0.1), { animate: true });
    } else {
        map.flyTo([20.5937, 78.9629], 5, { duration: 0.8 });
    }

  }, [properties, selectedProperty]);

  return (
    <div className={cn("rounded-xl overflow-hidden h-[600px] border", className)}>
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

export default PropertiesMap;

    