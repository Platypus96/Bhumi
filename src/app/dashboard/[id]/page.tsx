
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPropertyByParcelId } from "@/lib/data";
import type { Property } from "@/lib/types";
import { useFirebase } from "@/firebase/provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { PropertyVerification } from "@/components/dashboard/property-verification";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PropertyVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const { firestore } = useFirebase();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const fetchProperty = useCallback(async () => {
    if (id && firestore) {
      setLoading(true);
      const prop = await getPropertyByParcelId(firestore, id);
      setProperty(prop);
      setLoading(false);
    }
  }, [id, firestore]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-16 w-1/3 mb-4" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Property Not Found</AlertTitle>
          <AlertDescription>
            The property you are looking for does not exist or has been deleted.
          </AlertDescription>
        </Alert>
         <Button variant="outline" asChild className="mt-4">
            <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
         </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
            <Button variant="outline" asChild size="sm">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Dashboard
                </Link>
            </Button>
        </div>
       <PropertyVerification property={property} onUpdate={fetchProperty}/>
    </div>
  );
}

