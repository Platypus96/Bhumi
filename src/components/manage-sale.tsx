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
import { useFirebase } from "@/firebase";

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
  const { markForSale } = useBlockchain(); // Using markForSale now, cancel is implicit in new contract
  const { firestore } = useFirebase();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof listSaleFormSchema>>({
    resolver: zodResolver(listSaleFormSchema),
  });

  async function onListForSale(values: z.infer<typeof listSaleFormSchema>) {
    if (!firestore) return;
    setIsProcessing(true);
    try {
      // 1. Call smart contract
      await markForSale(property.parcelId, values.price);
      
      // 2. Update Firestore
      await listPropertyForSale(firestore, property.parcelId, parseEther(values.price).toString());

      toast({ title: "Property Listed!", description: `Your property is now listed for ${values.price} ETH.` });
      form.reset();
      onSaleStatusChanged();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to list property for sale.' });
    } finally {
      setIsProcessing(false);
    }
  }

  // NOTE: The new contract doesn't seem to have an explicit unlist function.
  // Marking for sale again with price 0 could be a way, but for now we assume
  // listing is permanent until sold. Or owner can't unlist.
  // We will remove the unlisting UI.
  if (property.forSale) {
    return null; // Don't show anything if already for sale, as there's no way to unlist
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
