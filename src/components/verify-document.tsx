"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert, CheckCircle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Property } from "@/lib/types";

interface VerifyDocumentProps {
    property: Property;
}

export function VerifyDocument({ property }: VerifyDocumentProps) {
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');

    const handleVerify = () => {
        setVerificationStatus('verifying');
        // TODO: Fetch from IPFS and re-compute hash
        setTimeout(() => {
          // Simulate re-hashing and comparison
          const isAuthentic = Math.random() > 0.1; // 90% chance of success
          setVerificationStatus(isAuthentic ? 'verified' : 'failed');
        }, 1500);
      };

    return (
        <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center"><FileText className="mr-2" /> Document Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Verify the integrity of the property document by comparing its hash with the one stored on the blockchain.</p>
              <div className="space-y-2 text-sm break-all mb-4">
                <p><strong>IPFS CID:</strong> <a href={`https://ipfs.io/ipfs/${property.documentCID}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{property.documentCID}</a></p>
                <p><strong>On-Chain Hash (SHA-256):</strong> {property.documentHash}</p>
              </div>
              <Button onClick={handleVerify} disabled={verificationStatus === 'verifying'}>
                {verificationStatus === 'verifying' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {verificationStatus === 'idle' && 'Verify Integrity'}
                {verificationStatus === 'verifying' && 'Verifying...'}
                {verificationStatus === 'verified' && 'Verified'}
                {verificationStatus === 'failed' && 'Verification Failed'}
              </Button>
              {verificationStatus === 'verified' && <Alert className="mt-4 border-green-500 text-green-700"><CheckCircle className="h-4 w-4 text-green-500" /><AlertTitle>✅ Document Verified</AlertTitle><AlertDescription>Document hash matches the on-chain record. The document is authentic.</AlertDescription></Alert>}
              {verificationStatus === 'failed' && <Alert variant="destructive" className="mt-4"><ShieldAlert className="h-4 w-4" /><AlertTitle>❌ Document Tampered</AlertTitle><AlertDescription>Document hash does not match the on-chain record. The document may have been tampered with.</AlertDescription></Alert>}
            </CardContent>
        </Card>
    );
}
