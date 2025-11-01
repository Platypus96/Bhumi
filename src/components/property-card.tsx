import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/lib/types';
import { Fingerprint, Tag } from 'lucide-react';
import { formatEther } from 'ethers';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/property/${property.parcelId}`} className="block">
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <CardHeader className="p-0">
          <div className="relative aspect-video">
            <Image
              src={property.imageUrl}
              alt={property.title}
              fill
              className="object-cover"
            />
            {property.forSale && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                For Sale
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <CardTitle className="text-lg font-semibold mb-1">{property.title}</CardTitle>
           <CardDescription className="text-sm text-muted-foreground mb-2">{property.area}</CardDescription>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center">
              <Fingerprint className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">ID: {property.parcelId}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
           <Badge variant={property.verified ? 'secondary' : 'destructive'}>
            {property.verified ? 'Verified' : 'Unverified'}
          </Badge>
          {property.forSale && property.price && (
            <div className="font-semibold text-primary flex items-center">
                <Tag className="h-4 w-4 mr-1"/>
                {formatEther(property.price)} ETH
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
