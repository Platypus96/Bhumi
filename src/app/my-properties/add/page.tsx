
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
import { FileUp, Loader2, AlertCircle, Sparkles, Search } from "lucide-react";
import { useState } from "react";
import { useIPFS } from "@/hooks/use-ipfs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useFirebase } from "@/firebase";
import { useBlockchain } from "@/hooks/use-blockchain";
import { improveDescription } from "@/ai/flows/improve-description-flow";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import('@/components/dynamic-map'), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-muted animate-pulse flex items-center justify-center"><p>Loading Map...</p></div>
});


const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(10, "Description is required."),
  location: z.string().min(3, "Location is required."),
  area: z.string().min(1, "Area is required."),
  image: z.any().refine(files => files?.length == 1, "Property image is required."),
  document: z.any().refine(files => files?.length == 1, "Proof document is required."),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  polygon: z.string().min(1, "Property boundary must be drawn on the map."),
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
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  const [mapCenter, setMapCenter] = useState<[number, number] | null>([20.5937, 78.9629]); // Default to India
  const [mapZoom, setMapZoom] = useState(5);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      area: "",
      polygon: "",
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
  
  const handleGeocode = async () => {
    const location = form.getValues("location");
    if (!location) {
      toast({ variant: "destructive", title: "Location empty", description: "Please enter a location to search." });
      return;
    }
    setIsGeocoding(true);
    try {
      const response = await fetch(`/api/forward-geocode?address=${encodeURIComponent(location)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch coordinates.");
      }
      const data = await response.json();
      if (data.lat && data.lng) {
        setMapCenter([data.lat, data.lng]);
        setMapZoom(15);
        toast({ title: "Location Found", description: "Map has been centered to the searched location." });
      } else {
        throw new Error("Location not found.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Geocoding Error", description: error.message });
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
    form.setValue("location", `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    toast({
      title: "Location Selected",
      description: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    });
  };

  const handlePolygonCreated = (polygon: any) => {
    form.setValue("polygon", JSON.stringify(polygon));
    toast({
      title: "Boundary Drawn",
      description: "Property boundary has been recorded.",
    });
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

      const parcelId = `${account}-${Date.now()}`;

      toast({ description: "Adding property to the blockchain..." });
      const receipt = await addProperty(parcelId, imageUploadResult.cid, documentUploadResult.cid);

      toast({ description: "Saving property details..." });
      await createProperty(firestore, {
        parcelId: parcelId,
        owner: account,
        title: values.title,
        description: values.description,
        location: values.location,
        area: values.area,
        latitude: values.latitude,
        longitude: values.longitude,
        imageUrl: imageUploadResult.cid,
        ipfsProofCid: documentUploadResult.cid,
        polygon: values.polygon,
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
          Fill in the details below and draw the property boundary on the map to register it on the blockchain.
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Property Location</FormLabel>
                        <div className="flex">
                             <Input placeholder="e.g., City, State, Country" {...field} className="rounded-r-none"/>
                             <Button type="button" onClick={handleGeocode} disabled={isGeocoding} className="rounded-l-none">
                                {isGeocoding ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
                             </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Area</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1200 sq. ft." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="polygon"
              render={({ field }) => (
                 <FormItem>
                    <FormLabel>Property Boundary</FormLabel>
                    <div className="border rounded-xl overflow-hidden shadow-lg h-[500px]">
                      <DynamicMap 
                        onLocationSelect={handleLocationSelect} 
                        onPolygonCreated={handlePolygonCreated}
                        center={mapCenter}
                        zoom={mapZoom}
                      />
                    </div>
                    <FormDescription>Use the map tools to draw the property boundary.</FormDescription>
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
            <Button type="submit" className="w-full" disabled={isSubmitting || isUploading || isImproving || isGeocoding}>
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
