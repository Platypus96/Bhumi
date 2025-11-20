"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, CheckCircle, FileText, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Property } from "@/lib/types";
import { downloadAndVerify } from "@/hooks/use-ipfs";
import { useBlockchain } from "@/hooks/use-blockchain";
import { HashPill } from "./hash-pill";
import Link from "next/link";

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
            const onChainProperty = await getProperty(property.parcelId);
            const onChainProofCid = onChainProperty.proofCID;

            if (property.ipfsProofCid !== onChainProofCid) {
                setVerificationStatus('failed');
                setError("The IPFS CID stored in the database does not match the on-chain CID. The record may have been tampered with.");
                return;
            }

            const { authentic } = await downloadAndVerify(property.ipfsProofCid);
            if (!authentic) {
                 throw new Error("Failed to download or verify file from IPFS.");
            }
            
            setVerificationStatus('verified');

        } catch (e: any) {
            setError(e.message || 'Verification failed.');
            setVerificationStatus('failed');
        }
      };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold flex items-center"><FileText className="mr-2"/>Document Verification</h3>
            <div className="flex flex-col space-y-2 text-sm break-all">
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Property Image</p>
                  <Button asChild variant="outline" size="sm">
                      <Link href={property.imageUrl} target="_blank" rel="noopener noreferrer">
                          View Image <Download className="ml-2 h-4 w-4" />
                      </Link>
                  </Button>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Ownership Proof</p>
                  <Button asChild variant="outline" size="sm">
                     <Link href={property.ipfsProofCid} target="_blank" rel="noopener noreferrer">
                          View Document <Download className="ml-2 h-4 w-4" />
                      </Link>
                  </Button>
                </div>
            </div>

            <Button onClick={handleVerify} disabled={verificationStatus === 'verifying'}>
              {verificationStatus === 'verifying' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {verificationStatus === 'idle' && 'Verify Document Integrity'}
              {verificationStatus === 'verifying' && 'Verifying...'}
              {verificationStatus === 'verified' && 'Re-Verify'}
              {verificationStatus === 'failed' && 'Try Again'}
            </Button>
            
            {verificationStatus === 'verified' && (
                <Alert className="border-green-500 text-green-700 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>Document Verified</AlertTitle>
                    <AlertDescription>The on-chain IPFS CID matches the document from the network. The document is authentic.</AlertDescription>
                </Alert>
            )}
            {verificationStatus === 'failed' && (
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Verification Failed</AlertTitle>
                    <AlertDescription>{error || 'The document may have been tampered with or CIDs do not match.'}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
