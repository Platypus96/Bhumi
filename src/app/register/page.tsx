"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWeb3 } from "@/hooks/use-web3";
import { registerProperty } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const formSchema = z.object({
  ownerName: z.string().min(2, "Owner name must be at least 2 characters."),
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address."),
  propertyAddress: z.string().min(5, "Property address is required."),
  document: z.any().refine(files => files?.length == 1, "Document is required."),
});

export default function RegisterPropertyPage() {
  const { isRegistrar, account } = useWeb3();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerName: "",
      ownerAddress: "",
      propertyAddress: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate document processing
    const documentHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const documentCID = `Qm${[...Array(44)].map(() => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 62))).join('')}`;
    
    // Pick a random placeholder image
    const randomImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];

    try {
      await registerProperty({
        ownerName: values.ownerName,
        ownerAddress: values.ownerAddress,
        propertyAddress: values.propertyAddress,
        documentCID,
        documentHash,
        imageUrl: randomImage.imageUrl,
        imageHint: randomImage.imageHint,
      });

      toast({
        title: "Property Registered!",
        description: `Successfully registered property at ${values.propertyAddress}.`,
      });
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Could not register the property. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!account) {
     return (
        <div className="container mx-auto px-4 py-8 text-center">
            <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>Please connect your wallet to access this page.</AlertDescription>
            </Alert>
        </div>
    );
  }

  if (!isRegistrar) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <Alert variant="destructive" className="max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>Only the registrar can register new properties.</AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Register New Property</CardTitle>
          <CardDescription>
            Fill in the details below to add a new property to the ledger.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="propertyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123 Meadow Lane, Greenfield" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Owner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Alice Johnson" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Owner Wallet Address</FormLabel>
                    <FormControl>
                      <Input placeholder="0x..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Document</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="file" className="pl-10" {...form.register("document")} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Property
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
