import { VerifyProperty } from "@/components/verify-property";
import { AllProperties } from "@/components/all-properties";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PublicPortalPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div>
        <div className="text-left mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-accent font-headline flex items-center">
              <div className="bg-accent/10 text-accent p-2 rounded-lg mr-4">
                  <Search className="h-8 w-8" />
              </div>
              Public Verification Portal
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Verify property documents and check authenticity using blockchain technology.
            </p>
        </div>

        <VerifyProperty />
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center">How Verification Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardDescription className="text-primary font-bold text-lg">1</CardDescription>
              <CardTitle>Search Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Enter the parcel ID to retrieve property information from the blockchain</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-primary font-bold text-lg">2</CardDescription>
              <CardTitle>Download Document</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">The system retrieves the property document from IPFS using the stored CID</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-primary font-bold text-lg">3</CardDescription>
              <CardTitle>Verify Integrity</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground">SHA-256 hash is computed and compared with the on-chain hash to ensure authenticity</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
    </div>
  );
}
