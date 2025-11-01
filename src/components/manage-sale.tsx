
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Tag, XCircle } from "lucide-react";
import { listPropertyForSale, unlistPropertyForSale } from "@/lib/data";
import { useBlockchain } from "@/hooks/use-blockchain";
import type { Property } from "@/lib/types";
import { formatEther, parseEther } from "ethers";
import { useFirebase } from "@/firebase";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const listSaleFormSchema = z.object({
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Must be a valid positive number",
  }),
});

interface ManageSaleProps {
  property: Property;
  onSaleStatusChanged: () => void;
}

export function ManageSale({ property, onSaleStatusChanged }: ManageSaleProps) {
  const { toast } = useToast();
  const { markForSale } = useBlockchain();
  const { firestore } = useFirebase();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof listSaleFormSchema>>({
    resolver: zodResolver(listSaleFormSchema),
    defaultValues: {
      price: "",
    },
  });

  async function onListForSale(values: z.infer<typeof listSaleFormSchema>) {
    if (!firestore) return;
    setIsProcessing(true);
    try {
      // The contract expects the price in wei
      const priceInWei = parseEther(values.price);
      
      // 1. Call smart contract
      await markForSale(property.parcelId, values.price); // Pass ETH string as per hook update
      
      // 2. Update Firestore
      await listPropertyForSale(firestore, property.parcelId, priceInWei.toString());

      toast({ title: "Property Listed!", description: `Your property is now listed for ${values.price} ETH.` });
      form.reset();
      onSaleStatusChanged();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to list property for sale.' });
    } finally {
      setIsProcessing(false);
    }
  }

  async function onUnlistForSale() {
    if (!firestore) return;
    setIsProcessing(true);
    try {
      // To unlist, we mark it for sale with a price of 0.
      await markForSale(property.parcelId, "0");
      
      // Update firestore
      await unlistPropertyForSale(firestore, property.parcelId);

      toast({ title: "Property Unlisted", description: "Your property has been removed from the marketplace." });
      onSaleStatusChanged();
    } catch (e: any) {
       toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to unlist property.' });
    } finally {
       setIsProcessing(false);
    }
  }

  if (property.forSale) {
    return (
      <Card className="mt-6 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive"><XCircle className="mr-2" />Remove from Marketplace</CardTitle>
          {property.price && <CardDescription>This property is currently listed for {formatEther(property.price)} ETH.</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Unlisting the property will remove it from the public marketplace.</p>
           <Button variant="destructive" className="w-full" onClick={onUnlistForSale} disabled={isProcessing}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Unlist Property
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center"><Tag className="mr-2" />List Property for Sale</CardTitle>
        <CardDescription>Enter a price in ETH to list this property on the marketplace.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onListForSale)} className="space-y-4">
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem>
                <FormLabel>Price (ETH)</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="e.g., 1.5" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                List for Sale
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
