
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Briefcase, School, Bus, AlertCircle, Pin } from 'lucide-react';
import { Badge } from './ui/badge';
import Link from 'next/link';

interface NearbyPlacesProps {
  latitude: number;
  longitude: number;
}

interface Place {
  properties: {
    name: string;
    distance: number;
    categories: string[];
  };
}

const CATEGORIES = {
  education: { icon: School, label: "Schools", color: "bg-blue-100 text-blue-800" },
  healthcare: { icon: Briefcase, label: "Hospitals", color: "bg-red-100 text-red-800" },
  public_transport: { icon: Bus, label: "Transport", color: "bg-yellow-100 text-yellow-800" },
};

type CategoryKey = keyof typeof CATEGORIES;

export function NearbyPlaces({ latitude, longitude }: NearbyPlacesProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: latitude, lon: longitude, categories: Object.keys(CATEGORIES) }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch nearby places');
        }
        const data = await response.json();
        setPlaces(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [latitude, longitude]);

  const categorizedPlaces = useMemo(() => {
    const result: Record<CategoryKey, Place[]> = {
      education: [],
      healthcare: [],
      public_transport: [],
    };

    places.forEach(place => {
      const category = place.properties.categories.find(c => c in CATEGORIES) as CategoryKey | undefined;
      if (category && result[category]) {
        result[category].push(place);
      }
    });

    return result;
  }, [places]);

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Object.keys(CATEGORIES).map(key => (
        <div key={key}>
          <Skeleton className="h-6 w-1/3 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-2xl"><Pin className="mr-3" />Nearby Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          renderSkeleton()
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {(Object.keys(categorizedPlaces) as CategoryKey[]).map(key => (
              categorizedPlaces[key].length > 0 && (
                <div key={key}>
                  <h3 className="flex items-center text-lg font-semibold mb-2">
                    <CATEGORIES[key].icon className="h-5 w-5 mr-2" />
                    {CATEGORIES[key].label}
                  </h3>
                  <ul className="space-y-2">
                    {categorizedPlaces[key].slice(0, 5).map((place, index) => (
                      <li key={index} className="flex justify-between items-center bg-secondary/50 p-2 rounded-md">
                        <span className="text-sm font-medium">{place.properties.name}</span>
                        <Badge variant="outline">
                          {(place.properties.distance / 1000).toFixed(1)} km
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
             <div className="text-center text-xs text-muted-foreground pt-2">
                Powered by <Link href="https://www.geoapify.com/" target="_blank" className="underline">Geoapify</Link>
             </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
