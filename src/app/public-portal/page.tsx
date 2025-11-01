import { VerifyProperty } from "@/components/verify-property";
import { AllProperties } from "@/components/all-properties";

export default function PublicPortalPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div>
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">
            Public Property Portal
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Search and verify properties on the decentralized ledger.
            </p>
        </div>

        <VerifyProperty />
      </div>

      <AllProperties />
      
    </div>
  );
}
