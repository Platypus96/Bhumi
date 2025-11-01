"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWeb3 } from "@/hooks/use-web3";
import { createSubmission } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileUp, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useIPFS } from "@/hooks/use-ipfs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(10, "Description is required."),
  area: z.string().min(1, "Area is required."),
  image: z.any().refine(files => files?.length == 1, "Property image is required."),
  document: z.any().refine(files => files?.length == 1, "Proof document is required."),
});

export default function AddPropertyPage() {
  const { account } = useWeb3();
  const { toast } = useToast();
  const router = useRouter();
  const { uploadFile: uploadToIpfs, isUploading: isIpfsUploading } = useIPFS();
  // For now, we use the same IPFS hook for storage upload as a placeholder.
  const { uploadFile: uploadToStorage, isUploading: isStorageUploading } = useIPFS();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      area: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!account) {
        toast({ variant: "destructive", title: "Wallet not connected" });
        return;
    }

    setIsSubmitting(true);
    
    try {
      const imageFile = values.image[0] as File;
      const documentFile = values.document[0] as File;

      // In a real app, this would use a Firebase Storage hook.
      toast({ description: "Uploading image to storage..." });
      const imageUploadResult = await uploadToStorage(imageFile);
      if (!imageUploadResult) throw new Error("Image upload failed.");
      
      toast({ description: "Uploading proof to IPFS..." });
      const documentUploadResult = await uploadToIpfs(documentFile);
      if (!documentUploadResult) throw new Error("IPFS upload failed.");

      const submissionId = await createSubmission({
        owner: account,
        title: values.title,
        description: values.description,
        area: values.area,
        // The CID from useIPFS is a full gateway URL, which works for imageUrl
        imageUrl: imageUploadResult.cid, 
        proofCID: documentUploadResult.cid,
      });

      toast({
        title: "Submission Received!",
        description: `Your property is pending registrar approval. Submission ID: ${submissionId.substring(0,10)}...`,
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
                <AlertDescription>Please connect your wallet to submit a property.</AlertDescription>
            </Alert>
        </div>
    );
  }

  const isUploading = isIpfsUploading || isStorageUploading;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
    <Card>
      <CardHeader>
        <CardTitle>Submit New Property</CardTitle>
        <CardDescription>
          Fill in the details below to submit a new property for registration. It will be reviewed by the registrar.
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
                  <FormLabel>Description</FormLabel>
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
                  <FormDescription>This image will be publicly visible.</FormDescription>
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
            <Button type="submit" className="w-full" disabled={isSubmitting || isUploading}>
              {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Uploading files..." : "Submit for Approval"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    </div>
  );
}
