
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Property } from "@/lib/types";
import { useBlockchain } from "@/hooks/use-blockchain";
import { updatePropertyOwner } from "@/lib/data";
import { useWeb3 } from "@/hooks/use-web3";
import { useFirebase } from "@/firebase/provider";
import { formatEther } from "ethers";

interface BuyPropertyProps {
  property: Property;
  onPurchase: () => void;
}

export function BuyProperty({ property, onPurchase }: BuyPropertyProps) {
  const { account } = useWeb3();
  const { toast } = useToast();
  const { buyProperty } = useBlockchain();
  const { firestore } = useFirebase();
  const [isBuying, setIsBuying] = useState(false);

  const handleBuy = async () => {
    if (!property.price) return;
    if (!account) {
      toast({ variant: "destructive", title: "Wallet not connected" });
      return;
    }
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Database Error",
        description: "Firestore is not available.",
      });
      return;
    }

    setIsBuying(true);
    try {
      // 1. Execute smart contract transaction
      // The contract expects the price in wei, which is already stored.
      // It must be passed as a BigInt.
      const receipt = await buyProperty(property.parcelId, BigInt(property.price));

      // 2. Update Firestore ownership record
      const buyerAddress = account;
      await updatePropertyOwner(
        firestore,
        property.parcelId,
        buyerAddress,
        receipt.hash,
        property.price
      );

      toast({
        title: "🎉 Purchase Successful!",
        description: `You are now the proud owner of ${property.title}.`,
      });
      onPurchase();
    } catch (e: any) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description:
          e.reason || e.message || "An unexpected error occurred during the transaction.",
      });
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <Card className="mt-8 border border-emerald-300/30 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-emerald-950/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-emerald-800 dark:text-emerald-300">
          <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          Purchase Property
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Complete your purchase securely on-chain and claim verified ownership.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-border/40">
          <span className="text-sm font-medium text-muted-foreground">Price</span>
          <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
            {property.price ? `${formatEther(property.price)} ETH` : "—"}
          </span>
        </div>

        <Button
          onClick={handleBuy}
          disabled={isBuying || !account}
          className="w-full relative bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-base font-medium py-5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {isBuying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Transaction...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buy Now
            </>
          )}
        </Button>

        {!account && (
          <p className="text-xs text-center text-muted-foreground pt-1">
            ⚠️ Connect your wallet to continue.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
