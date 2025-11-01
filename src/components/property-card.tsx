import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/lib/types';
import { Fingerprint, Tag, CheckCircle, MapPin, RulerSquare } from 'lucide-react';
import { formatEther } from 'ethers';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/property/${property.parcelId}`} className="block group">
      <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl border hover:border-primary">
        <CardHeader className="p-0">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={property.imageUrl}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {property.forSale && (
              <Badge variant="destructive" className="absolute top-3 right-3 text-sm">
                For Sale
              </Badge>
            )}
            <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-5 space-y-3">
          <CardTitle className="text-xl font-bold mb-1 truncate">{property.title}</CardTitle>
           <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{property.description}</p>
          <div className="text-sm text-muted-foreground space-y-2 pt-2 border-t">
             <div className="flex items-center">
              <RulerSquare className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
              <span className="font-medium text-foreground/80">{property.area}</span>
            </div>
             <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
              <span className="truncate">{property.location}</span>
            </div>
            <div className="flex items-center">
              <Fingerprint className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
              <span className="truncate font-mono text-xs">ID: {property.parcelId}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center bg-secondary/30">
           <Badge variant={property.verified ? 'default' : 'secondary'} className={property.verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
            {property.verified ? (
                <>
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Verified
                </>
            ) : 'Unverified'}
          </Badge>
          {property.forSale && property.price && (
            <div className="font-bold text-primary flex items-center text-lg">
                <Tag className="h-4 w-4 mr-1.5"/>
                {formatEther(property.price)} ETH
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
