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
import { parseEther } from "ethers";

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
  const { listForSale, cancelListing } = useBlockchain();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof listSaleFormSchema>>({
    resolver: zodResolver(listSaleFormSchema),
  });

  async function onListForSale(values: z.infer<typeof listSaleFormSchema>) {
    setIsProcessing(true);
    try {
      // 1. Call smart contract
      await listForSale(property.parcelId, values.price);
      
      // 2. Update Firestore
      await listPropertyForSale(property.parcelId, parseEther(values.price).toString());

      toast({ title: "Property Listed!", description: `Your property is now listed for ${values.price} ETH.` });
      form.reset();
      onSaleStatusChanged();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to list property for sale.' });
    } finally {
      setIsProcessing(false);
    }
  }

  async function onCancelListing() {
    setIsProcessing(true);
    try {
        // 1. Call smart contract
        await cancelListing(property.parcelId);

        // 2. Update Firestore
        await unlistPropertyForSale(property.parcelId);
        
        toast({ title: "Listing Cancelled", description: `Your property has been unlisted.` });
        onSaleStatusChanged();
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to cancel listing.' });
    } finally {
        setIsProcessing(false);
    }
  }


  if (property.forSale) {
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center text-red-600"><XCircle className="mr-2" />Cancel Listing</CardTitle>
                <CardDescription>This property is currently listed for sale. You can cancel the listing here.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="destructive" className="w-full" onClick={onCancelListing} disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cancel Sale
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
