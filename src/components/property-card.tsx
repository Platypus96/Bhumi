import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/lib/types';
import { Fingerprint, Tag, CheckCircle, MapPin, Square } from 'lucide-react';
import { formatEther } from 'ethers';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/property/${property.parcelId}`} className="block group">
      <Card className="h-full flex flex-col overflow-hidden rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/60 transition-all duration-300 bg-card backdrop-blur-sm">
        {/* Image Section */}
        <CardHeader className="p-0 relative">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={property.imageUrl}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            {property.forSale && (
              <Badge
                variant="destructive"
                className="absolute top-3 right-3 text-xs font-semibold shadow-md backdrop-blur-sm bg-red-500/80"
              >
                For Sale
              </Badge>
            )}
            <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          </div>
        </CardHeader>

        {/* Content Section */}
        <CardContent className="flex-grow p-5 space-y-3">
          <CardTitle className="text-lg sm:text-xl font-semibold tracking-tight text-foreground line-clamp-1">
            {property.title}
          </CardTitle>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[40px]">
            {property.description}
          </p>

          <div className="text-sm text-muted-foreground space-y-2 pt-3 border-t border-border/40">
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-2 text-primary shrink-0" />
              <span className="font-medium text-foreground/90">{property.area}</span>
            </div>

            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>

            <div className="flex items-center">
              <Fingerprint className="h-4 w-4 mr-2 text-primary shrink-0" />
              <span className="truncate font-mono text-xs text-foreground/80">
                ID: {property.parcelId}
              </span>
            </div>
          </div>
        </CardContent>

        {/* Footer Section */}
        <CardFooter className="p-4 pt-0 flex justify-between items-center bg-secondary/20 backdrop-blur-sm">
          <Badge
            variant={property.verified ? 'default' : 'secondary'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${
              property.verified
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
            }`}
          >
            {property.verified ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                Verified
              </>
            ) : (
              'Unverified'
            )}
          </Badge>

          {property.forSale && property.price && (
            <div className="font-semibold text-primary flex items-center text-base sm:text-lg">
              <Tag className="h-4 w-4 mr-1.5" />
              {formatEther(property.price)} ETH
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
