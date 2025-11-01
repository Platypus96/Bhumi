"use client";
import { AllProperties } from "@/components/all-properties";

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">
                Property Marketplace
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Browse and purchase properties verified on the blockchain.
            </p>
        </div>

        <AllProperties showForSaleOnly={true} />
    </div>
  );
}
