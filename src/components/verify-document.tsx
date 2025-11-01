"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert, CheckCircle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Property } from "@/lib/types";
import { downloadAndVerify } from "@/hooks/use-ipfs";

interface VerifyDocumentProps {
    property: Property;
}

export function VerifyDocument({ property }: VerifyDocumentProps) {
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async () => {
        setVerificationStatus('verifying');
        setError(null);
        try {
            // This is a placeholder for fetching hash from contract. In a real app,
            // you'd call a contract getter `getProperty(parcelId)` to get the canonical hash.
            const { ipfsProofCid } = property; 
            const onChainHash = '0x...'; // You would fetch this from the smart contract

            // For this example, we assume `downloadAndVerify` needs the on-chain hash.
            // Since the provided contract doesn't store the hash, we'll simulate.
            // In a real scenario, the contract would store the hash, or you'd trust the CID.
            console.warn("Verification is simulated. Contract does not store SHA256 hash.");
            
            // Simulate verification since the provided contract does not store the hash.
            // In a full implementation, you would re-compute the hash of the file from `ipfsProofCid`
            // and compare it to a hash stored on-chain.
            await new Promise(res => setTimeout(res, 1500));
            const isAuthentic = Math.random() > 0.1; // 90% success rate for demo

            setVerificationStatus(isAuthentic ? 'verified' : 'failed');
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
              <p className="text-sm text-muted-foreground mb-4">Verify the integrity of the property document by fetching it from IPFS.</p>
              <div className="space-y-2 text-sm break-all mb-4">
                <p><strong>IPFS Proof CID:</strong> <a href={`https://ipfs.io/ipfs/${property.ipfsProofCid}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{property.ipfsProofCid}</a></p>
                {property.pointerCid && <p><strong>IPFS Pointer CID:</strong> <a href={`https://ipfs.io/ipfs/${property.pointerCid}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{property.pointerCid}</a></p>}
              </div>
              <Button onClick={handleVerify} disabled={verificationStatus === 'verifying'}>
                {verificationStatus === 'verifying' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {verificationStatus === 'idle' && 'Verify Document Integrity'}
                {verificationStatus === 'verifying' && 'Verifying...'}
                {verificationStatus === 'verified' && 'Re-Verify'}
                {verificationStatus === 'failed' && 'Try Again'}
              </Button>
              {verificationStatus === 'verified' && <Alert className="mt-4 border-green-500 text-green-700"><CheckCircle className="h-4 w-4 text-green-500" /><AlertTitle>✅ Document Verified</AlertTitle><AlertDescription>The document from IPFS is considered authentic (simulation). </AlertDescription></Alert>}
              {verificationStatus === 'failed' && <Alert variant="destructive" className="mt-4"><ShieldAlert className="h-4 w-4" /><AlertTitle>❌ Verification Failed</AlertTitle><AlertDescription>{error || 'The document may have been tampered with.'}</AlertDescription></Alert>}
            </CardContent>
        </Card>
    );
}
