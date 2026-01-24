'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import type { Property } from '@/lib/types';
import { Square, BedDouble, Bath } from 'lucide-react';
import { formatEther } from 'ethers';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();
  const [beds, setBeds] = useState(0);
  const [baths, setBaths] = useState(0);
  const [ethPrice, setEthPrice] = useState<number | null>(null);

  useEffect(() => {
    // Generate random beds/baths on client to avoid hydration errors
    setBeds(Math.floor(Math.random() * 4) + 1); // 1 to 4
    setBaths(Math.floor(Math.random() * 2) + 1); // 1 to 2
    
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
        <Card className="h-full flex flex-col overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 bg-card border-none">
            {/* Image */}
            <div className="aspect-[4/3] w-full relative">
                <Image src={property.imageUrl} alt={property.title} fill className="object-cover"/>
                <div className="absolute top-3 left-3 flex gap-2">
                    <StatusBadge />
                </div>
            </div>

            <div className="p-4 bg-card flex-grow flex flex-col">
                {/* Info pills */}
                <div className="grid grid-cols-3 gap-2 border-b pb-3 mb-4">
                    <div className="flex items-center justify-center gap-2 py-2 px-1 rounded-lg bg-secondary text-sm">
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                        {beds > 0 && <span className="font-medium">{beds} Beds</span>}
                    </div>
                    <div className="flex items-center justify-center gap-2 py-2 px-1 rounded-lg bg-secondary text-sm">
                        <Bath className="h-4 w-4 text-muted-foreground" />
                        {baths > 0 && <span className="font-medium">{baths} Baths</span>}
                    </div>
                    <div className="flex items-center justify-center gap-2 py-2 px-1 rounded-lg bg-secondary text-sm">
                        <Square className="h-4 w-4 text-muted-foreground" />
                        <span className="whitespace-nowrap font-medium">{property.area.split(' ')[0]} ft²</span>
                    </div>
                </div>

                {/* Price and Address */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        {property.forSale && property.price ? (
                            <>
                                <p className="text-2xl font-bold text-foreground">{priceInUsd}</p>
                                <p className="text-sm font-medium text-muted-foreground">{formatEther(property.price)} ETH</p>
                            </>
                        ) : (
                            <p className="text-lg font-semibold text-muted-foreground">Not for Sale</p>
                        )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-4 max-w-[60%]">
                        <p className="font-semibold text-base text-foreground truncate">{property.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{property.location}</p>
                    </div>
                </div>
            </div>
        </Card>
    </div>
  );
}
