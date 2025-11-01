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

interface BuyPropertyProps {
    property: Property;
    onPurchase: () => void;
}

export function BuyProperty({ property, onPurchase }: BuyPropertyProps) {
    const { account } = useWeb3();
    const { toast } = useToast();
    const { buyProperty } = useBlockchain();
    const [isBuying, setIsBuying] = useState(false);

    const handleBuy = async () => {
        if (!property.price) return;
        if (!account) {
            toast({ variant: "destructive", title: "Wallet not connected" });
            return;
        }

        setIsBuying(true);
        try {
            // 1. Call smart contract
            const receipt = await buyProperty(property.parcelId, property.price);
            
            // The buyer is the one who initiated the transaction.
            const buyerAddress = account;

            // 2. Update Firestore
            await updatePropertyOwner(property.parcelId, buyerAddress, receipt.hash, property.price);

            toast({
                title: "Purchase Successful!",
                description: `You are now the new owner of ${property.title}.`
            });
            onPurchase();
        } catch (e: any) {
            console.error(e);
            toast({
                variant: "destructive",
                title: "Purchase Failed",
                description: e.reason || e.message || "Could not complete the purchase."
            });
        } finally {
            setIsBuying(false);
        }
    };

    return (
        <Card className="mt-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CardHeader>
                <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                    <ShoppingCart className="mr-2" />Purchase Property
                </CardTitle>
                <CardDescription>You can buy this property and become the new owner.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleBuy} disabled={isBuying || !account} className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white">
                    {isBuying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Buy Now
                </Button>
            </CardContent>
        </Card>
    );
}
