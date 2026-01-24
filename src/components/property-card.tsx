'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Property } from '@/lib/types';
import { MapPin, Square, CheckCircle, Clock, ShieldX } from 'lucide-react';
import { formatEther } from 'ethers';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/property/${property.parcelId}`);
  };

  const StatusBadge = () => {
    const statusConfig = {
      verified: {
        text: 'Verified',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      rejected: {
        text: 'Rejected',
        icon: ShieldX,
        className: 'bg-red-100 text-red-800 border-red-200',
      },
      unverified: {
        text: 'Pending',
        icon: Clock,
        className: 'bg-amber-100 text-amber-800 border-amber-200',
      },
    };

    const config = statusConfig[property.status || 'unverified'];
    const Icon = config.icon;

    return (
      <div
        className={cn(
          'absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold',
          config.className
        )}
      >
        <Icon className="h-3 w-3" />
        {config.text}
      </div>
    );
  };

  return (
    <div onClick={handleCardClick} className="h-full cursor-pointer group">
        <Card className="h-full flex flex-col overflow-hidden rounded-xl border border-border/50 shadow-md group-hover:shadow-xl group-hover:border-primary/60 transition-all duration-300 bg-card">
        
        <CardHeader className="p-0 relative">
            <div className="aspect-video w-full relative">
                <Image src={property.imageUrl} alt={property.title} fill className="object-cover"/>
                <StatusBadge />
            </div>
        </CardHeader>

        <CardContent className="p-2 flex-grow flex flex-col">
            {/* Price section */}
            {property.forSale && property.price && (
            <div className="mb-0.5">
                <span className="text-lg font-bold text-primary">{formatEther(property.price)} ETH</span>
            </div>
            )}

            {/* Title */}
            <CardTitle className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200 flex-grow">
                {property.title}
            </CardTitle>
            
            {/* Details footer */}
            <div className="mt-auto pt-2 border-t border-border/70 space-y-1 text-xs">
                <div className="flex items-center text-muted-foreground gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                    <span className="line-clamp-1">{property.location}</span>
                </div>
                <div className="flex items-center text-muted-foreground gap-1.5">
                    <Square className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                    <span className="font-medium text-foreground">{property.area}</span>
                </div>
            </div>
        </CardContent>
        </Card>
    </div>
  );
}
