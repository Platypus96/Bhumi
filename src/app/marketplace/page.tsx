"use client";
import { AllProperties } from "@/components/all-properties";
import { Store } from "lucide-react";

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
        <div className="text-left">
            <h1 className="text-4xl font-bold tracking-tight text-primary font-headline flex items-center">
               <div className="bg-primary/10 text-primary p-3 rounded-xl mr-4">
                  <Store className="h-8 w-8" />
              </div>
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
