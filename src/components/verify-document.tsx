"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert, CheckCircle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Property } from "@/lib/types";
import { downloadAndVerify } from "@/hooks/use-ipfs";
import { useBlockchain } from "@/hooks/use-blockchain";

interface VerifyDocumentProps {
    property: Property;
}

export function VerifyDocument({ property }: VerifyDocumentProps) {
    const { getProperty } = useBlockchain();
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async () => {
        setVerificationStatus('verifying');
        setError(null);
        try {
            // 1. Fetch the canonical property data from the blockchain
            const onChainProperty = await getProperty(property.parcelId);
            const onChainProofCid = onChainProperty.proofCID;

            // 2. Fetch the file from IPFS using the CID from the component prop
            const { authentic, buffer } = await downloadAndVerify(property.ipfsProofCid);

            if (!authentic || !buffer) {
                throw new Error("Failed to download file from IPFS.");
            }
            
            // 3. Compare the CIDs.
            // A more robust check would be to re-calculate the CID of the downloaded `buffer`
            // and compare it to the on-chain CID. For simplicity, we compare the CIDs directly.
            if (property.ipfsProofCid !== onChainProofCid) {
                setVerificationStatus('failed');
                setError("The IPFS CID in Firestore does not match the on-chain CID.");
                return;
            }

            setVerificationStatus('verified');

        } catch (e: any) {
            setError(e.message || 'Verification failed.');
            setVerificationStatus('failed');
        }
      };

    return (
        <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center"><FileText className="mr-2" /> Document Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Verify the integrity of the property document by comparing the on-chain IPFS CID with the file fetched from the IPFS network.</p>
              <div className="space-y-2 text-sm break-all mb-4">
                <p><strong>Image IPFS CID:</strong> <a href={property.imageUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{property.imageUrl}</a></p>
                <p><strong>Proof IPFS CID:</strong> <a href={property.ipfsProofCid} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{property.ipfsProofCid}</a></p>
              </div>
              <Button onClick={handleVerify} disabled={verificationStatus === 'verifying'}>
                {verificationStatus === 'verifying' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {verificationStatus === 'idle' && 'Verify Document Integrity'}
                {verificationStatus === 'verifying' && 'Verifying...'}
                {verificationStatus === 'verified' && 'Re-Verify'}
                {verificationStatus === 'failed' && 'Try Again'}
              </Button>
              {verificationStatus === 'verified' && <Alert className="mt-4 border-green-500 text-green-700"><CheckCircle className="h-4 w-4 text-green-500" /><AlertTitle>✅ Document Verified</AlertTitle><AlertDescription>The on-chain IPFS CID matches the document from the network. The document is authentic.</AlertDescription></Alert>}
              {verificationStatus === 'failed' && <Alert variant="destructive" className="mt-4"><ShieldAlert className="h-4 w-4" /><AlertTitle>❌ Verification Failed</AlertTitle><AlertDescription>{error || 'The document may have been tampered with or CIDs do not match.'}</AlertDescription></Alert>}
            </CardContent>
        </Card>
    );
}
