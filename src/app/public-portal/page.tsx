import { VerifyProperty } from "@/components/verify-property";
import { AllProperties } from "@/components/all-properties";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PublicPortalPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div>
        <div className="text-left mb-8 max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-primary font-headline flex items-center">
              Public Verification Portal
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Verify property documents and check authenticity using blockchain technology. Enter a parcel ID below to begin.
            </p>
        </div>

        <VerifyProperty />
      </div>

      <div className="space-y-8 pt-8">
        <h2 className="text-3xl font-bold text-center font-headline">How Verification Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="items-center text-center">
              <div className="text-4xl font-bold text-accent">1</div>
              <CardTitle className="font-headline">Search Property</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">Enter the parcel ID to retrieve property information from the blockchain.</p>
            </CardContent>
          </Card>
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="items-center text-center">
              <div className="text-4xl font-bold text-accent">2</div>
              <CardTitle className="font-headline">Download Document</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">The system retrieves the property document from IPFS using the stored CID.</p>
            </CardContent>
          </Card>
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="items-center text-center">
              <div className="text-4xl font-bold text-accent">3</div>
              <CardTitle className="font-headline">Verify Integrity</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
               <p className="text-muted-foreground">The SHA-256 hash is computed and compared with the on-chain hash to ensure authenticity.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
    </div>
  );
}
