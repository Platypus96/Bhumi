
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWeb3 } from "@/hooks/use-web3";
import { createProperty } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileUp, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { useIPFS } from "@/hooks/use-ipfs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useFirebase } from "@/firebase";
import { useBlockchain } from "@/hooks/use-blockchain";
import { improveDescription } from "@/ai/flows/improve-description-flow";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(10, "Description is required."),
  area: z.string().min(1, "Area is required."),
  location: z.string().min(3, "Location is required."),
  image: z.any().refine(files => files?.length == 1, "Property image is required."),
  document: z.any().refine(files => files?.length == 1, "Proof document is required."),
});

export default function AddPropertyPage() {
  const { account } = useWeb3();
  const { toast } = useToast();
  const router = useRouter();
  const { uploadFile: uploadToIpfs, isUploading } = useIPFS();
  const { firestore } = useFirebase();
  const { addProperty } = useBlockchain();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      area: "",
      location: "",
    },
  });

  const handleImproveDescription = async () => {
    const currentDescription = form.getValues("description");
    if (!currentDescription) {
      toast({ variant: "destructive", title: "Description is empty", description: "Please write a brief description first." });
      return;
    }
    setIsImproving(true);
    try {
      const improved = await improveDescription(currentDescription);
      form.setValue("description", improved);
      toast({ title: "Description Improved!", description: "The property description has been enhanced by AI." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "AI Error", description: "Could not improve the description at this time." });
    } finally {
      setIsImproving(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!account) {
        toast({ variant: "destructive", title: "Wallet not connected" });
        return;
    }
    if (!firestore) {
        toast({ variant: "destructive", title: "Database Error", description: "Firestore is not available." });
        return;
    }

    setIsSubmitting(true);
    
    try {
      const imageFile = values.image[0] as File;
      const documentFile = values.document[0] as File;

      toast({ description: "Uploading property image to IPFS..." });
      const imageUploadResult = await uploadToIpfs(imageFile);
      if (!imageUploadResult) throw new Error("Image upload to IPFS failed.");
      
      toast({ description: "Uploading proof document to IPFS..." });
      const documentUploadResult = await uploadToIpfs(documentFile);
      if (!documentUploadResult) throw new Error("Proof upload to IPFS failed.");

      // A unique identifier for the property. Can be anything, but for simplicity,
      // we'll combine owner address and current timestamp.
      const parcelId = `${account}-${Date.now()}`;

      // 1. Add property to the blockchain
      toast({ description: "Adding property to the blockchain..." });
      const receipt = await addProperty(parcelId, imageUploadResult.cid, documentUploadResult.cid);

      // 2. Add property to Firestore
      toast({ description: "Saving property details..." });
      await createProperty(firestore, {
        parcelId: parcelId,
        owner: account,
        title: values.title,
        description: values.description,
        area: values.area,
        location: values.location,
        imageUrl: imageUploadResult.cid,
        ipfsProofCid: documentUploadResult.cid,
      }, receipt.hash);

      toast({
        title: "Property Added!",
        description: `Your new property has been registered on the blockchain with Parcel ID: ${parcelId.substring(0,10)}...`,
      });
      router.push(`/my-properties`);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Could not submit the property. Please try again.",
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
                <AlertDescription>Please connect your wallet to add a property.</AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
    <Card>
      <CardHeader>
        <CardTitle>Add New Property</CardTitle>
        <CardDescription>
          Fill in the details below to register a new property on the blockchain. All documents will be stored on IPFS.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 3 BHK Plot in Greenfield" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Description</FormLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={handleImproveDescription} disabled={isImproving}>
                      {isImproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span className="ml-2">Improve with AI</span>
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea placeholder="A brief description of the property..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2000 sq.ft." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., New York, USA" {...field} />
                  </FormControl>
                  <FormDescription>A Google Maps link or a general address.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Image</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="file" accept="image/*" className="pl-10" {...form.register("image")} />
                    </div>
                  </FormControl>
                  <FormDescription>This image will be uploaded to IPFS and be publicly visible.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proof Document (PDF, PNG, etc.)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="file" className="pl-10" {...form.register("document")} />
                    </div>
                  </FormControl>
                  <FormDescription>This document will be uploaded to IPFS for verification.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting || isUploading || isImproving}>
              {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Uploading to IPFS..." : "Add Property to Blockchain"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    </div>
  );
}
