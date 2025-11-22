
"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

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

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  onPolygonCreated: (polygon: any) => void;
  center: [number, number] | null;
  zoom: number;
  tileLayer?: TileLayer;
}

const MapPicker = ({ onLocationSelect, onPolygonCreated, center, zoom, tileLayer }: MapPickerProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const defaultTileLayer = {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  };
  const currentTileLayer = tileLayer || defaultTileLayer;

  // Effect for map initialization (runs only once)
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: center || [20.5937, 78.9629],
        zoom: zoom,
      });

      tileLayerRef.current = L.tileLayer(
        currentTileLayer.url,
        { attribution: currentTileLayer.attribution }
      ).addTo(mapInstanceRef.current);

      const drawnItems = new L.FeatureGroup();
      mapInstanceRef.current.addLayer(drawnItems);
      
      const drawControl = new (L.Control as any).Draw({
        edit: {
          featureGroup: drawnItems,
        },
        draw: {
          polygon: true,
          marker: true,
          circle: false,
          rectangle: false,
          polyline: false,
          circlemarker: false,
        },
      });

      mapInstanceRef.current.addControl(drawControl);

      mapInstanceRef.current.on(L.Draw.Event.CREATED, (e) => {
        const layer = e.layer;
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);

        if (layer instanceof L.Marker) {
          const { lat, lng } = layer.getLatLng();
          onLocationSelect(lat, lng);
        } else if (layer instanceof L.Polygon) {
          const geoJson = layer.toGeoJSON();
          onPolygonCreated(geoJson);
          const center = layer.getBounds().getCenter();
          onLocationSelect(center.lat, center.lng);
        }
      });
    }

    // Cleanup function: remove map instance on component unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Dependencies for initialization should be empty

  // Effect for updating map view when center or zoom props change
  useEffect(() => {
    if (mapInstanceRef.current && center) {
        mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Effect for updating tile layer
  useEffect(() => {
    if (tileLayerRef.current && currentTileLayer.url !== tileLayerRef.current.getTileUrl?.()) {
      tileLayerRef.current.setUrl(currentTileLayer.url);
      if (mapInstanceRef.current?.attributionControl) {
        // @ts-ignore
        mapInstanceRef.current.attributionControl.setPrefix(currentTileLayer.attribution);
      }
    }
  }, [currentTileLayer]);


  return (
    <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 1 }} className="rounded-lg" />
  );
};

export default MapPicker;
