"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Send } from "lucide-react";
import { initiateTransfer } from "@/lib/data";
import type { Property } from "@/lib/types";

const transferFormSchema = z.object({
  buyerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address."),
});

interface TransferPropertyProps {
  property: Property;
  onTransferInitiated: (updatedProperty: Property) => void;
}

export function TransferProperty({ property, onTransferInitiated }: TransferPropertyProps) {
  const { toast } = useToast();
  const [isTransferring, setIsTransferring] = useState(false);

  const transferForm = useForm<z.infer<typeof transferFormSchema>>({
    resolver: zodResolver(transferFormSchema),
  });

  async function onInitiateTransfer(values: z.infer<typeof transferFormSchema>) {
    if (!property) return;
    setIsTransferring(true);
    try {
      // TODO: Integrate smart contract call
      const updatedProperty = await initiateTransfer(property.id, values.buyerAddress);
      onTransferInitiated(updatedProperty!);
      toast({ title: "Transfer Initiated", description: `Request to transfer to ${values.buyerAddress.substring(0,8)}... sent for registrar approval.` });
      transferForm.reset();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to initiate transfer.' });
    } finally {
      setIsTransferring(false);
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader><CardTitle className="flex items-center"><Send className="mr-2" />Initiate Property Transfer</CardTitle></CardHeader>
      <CardContent>
        <Form {...transferForm}>
          <form onSubmit={transferForm.handleSubmit(onInitiateTransfer)} className="space-y-4">
            <FormField control={transferForm.control} name="buyerAddress" render={({ field }) => (
              <FormItem>
                <FormLabel>Buyer&apos;s Wallet Address</FormLabel>
                <FormControl><Input placeholder="0x..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={isTransferring}>
                {isTransferring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Initiate Transfer
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
