'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import type { Property } from '@/lib/types';
import { Square, MapPin } from 'lucide-react';
import { formatEther } from 'ethers';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();
  const [ethPrice, setEthPrice] = useState<number | null>(null);

  useEffect(() => {
    // Fetch ETH price
    const fetchEthPrice = async () => {
      try {
        const response = await fetch('/api/eth-price');
        if (!response.ok) {
          throw new Error('Failed to fetch price from server');
        }
        const data = await response.json();
        setEthPrice(data.usd);
      } catch (error) {
        console.error("Could not fetch ETH price", error);
      }
    };
    fetchEthPrice();
  }, []);

  const handleCardClick = () => {
    router.push(`/property/${property.parcelId}`);
  };

  const priceInUsd = ethPrice && property.price ? (parseFloat(formatEther(property.price)) * ethPrice).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }) : null;

  const StatusBadge = () => {
    const statusConfig = {
      verified: {
        text: 'Verified',
        className: 'bg-white/80 text-green-800 backdrop-blur-sm shadow-sm',
      },
      rejected: {
        text: 'Rejected',
        className: 'bg-white/80 text-red-800 backdrop-blur-sm shadow-sm',
      },
      unverified: {
        text: 'Pending',
        className: 'bg-white/80 text-amber-800 backdrop-blur-sm shadow-sm',
      },
    };

    const config = statusConfig[property.status || 'unverified'];

    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
          config.className
        )}
      >
        {config.text}
      </div>
    );
  };

  return (
    <div onClick={handleCardClick} className="h-full cursor-pointer group">
        <Card className="h-full flex flex-col overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-card border">
            {/* Image */}
            <div className="aspect-[16/10] w-full relative">
                <Image src={property.imageUrl} alt={property.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105"/>
                <div className="absolute top-3 left-3">
                    <StatusBadge />
                </div>
            </div>

            <div className="p-3 bg-card flex-grow flex flex-col">
                
                {/* Title */}
                <p className="font-bold text-base text-foreground truncate group-hover:text-primary">{property.title}</p>
                
                {/* Location */}
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0"/>
                  <span className="truncate">{property.location}</span>
                </div>

                {/* Price and Area */}
                <div className="mt-3 pt-3 border-t flex items-end justify-between">
                    <div>
                        {property.forSale && property.price ? (
                            <>
                                <p className="text-lg font-bold text-foreground">{priceInUsd}</p>
                                <p className="text-xs font-medium text-muted-foreground -mt-1">{formatEther(property.price)} ETH</p>
                            </>
                        ) : (
                            <p className="text-sm font-semibold text-muted-foreground">Not for Sale</p>
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-md bg-secondary text-xs">
                        <Square className="h-3 w-3 text-muted-foreground" />
                        <span className="whitespace-nowrap font-medium">{property.area}</span>
                    </div>
                </div>
            </div>
        </Card>
    </div>
  );
}
