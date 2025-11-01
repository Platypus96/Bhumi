import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/lib/types';
import { User, Fingerprint } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const shortOwnerAddress = `${property.ownerAddress.substring(0, 6)}...${property.ownerAddress.substring(property.ownerAddress.length - 4)}`;

  return (
    <Link href={`/property/${property.id}`}>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="p-0">
          <div className="relative aspect-video">
            <Image
              src={property.imageUrl}
              alt={property.propertyAddress}
              data-ai-hint={property.imageHint}
              fill
              className="object-cover rounded-t-lg"
            />
            {property.status === 'Transfer Initiated' && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                Transfer Pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <CardTitle className="text-lg font-semibold mb-2">{property.propertyAddress}</CardTitle>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center">
              <Fingerprint className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>ID: {property.id}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Owner: {shortOwnerAddress}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
           <Badge variant={property.status === 'Registered' ? 'secondary' : 'destructive'}>
            {property.status === 'Registered' ? 'Registered' : 'Transfer Pending'}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
