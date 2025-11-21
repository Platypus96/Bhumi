
"use client";

import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

// Fix for default icon issue with webpack
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  onPolygonCreated: (polygon: any) => void;
  center: [number, number] | null;
  zoom: number;
}

const MapPicker = ({ onLocationSelect, onPolygonCreated, center, zoom }: MapPickerProps) => {
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  
  const handleCreated = (e: any) => {
    const layer = e.layer;

    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      featureGroupRef.current.addLayer(layer);
    }
    
    if (layer instanceof L.Marker) {
      const { lat, lng } = layer.getLatLng();
      onLocationSelect(lat, lng);
    } else if (layer instanceof L.Polygon) {
      const geoJson = layer.toGeoJSON();
      onPolygonCreated(geoJson);
      const center = layer.getBounds().getCenter();
      onLocationSelect(center.lat, center.lng);
    }
  };

  return (
    <MapContainer center={center || [20.5937, 78.9629]} zoom={zoom} style={{ height: '100%', width: '100%', zIndex: 1 }} className="rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
        url={`https://maps.geoapify.com/v1/tile/osm-bright-grey/{z}/{x}/{y}.png?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`}
      />
      <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position="topright"
          onCreated={handleCreated}
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            polyline: false,
          }}
          edit={{
            featureGroup: featureGroupRef.current || undefined,
            remove: true,
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
};

export default MapPicker;
