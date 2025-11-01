import { useState } from 'react';

// This is a placeholder for your actual IPFS upload logic.
// You would typically use a service like Pinata, Infura, or Web3.Storage
// and their respective SDKs.

const IPFS_API_KEY = process.env.NEXT_PUBLIC_IPFS_API_KEY;
const IPFS_API_SECRET = process.env.NEXT_PUBLIC_IPFS_API_SECRET;
const IPFS_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS'; // Example for Pinata

export const useIPFS = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real app, you would have separate hooks/logic for Firebase Storage vs. IPFS
  const uploadFile = async (file: File): Promise<{ cid: string; hash: string } | null> => {
    setIsUploading(true);
    setError(null);

    // 1. Calculate SHA-256 hash locally (optional, as contract does not use it)
    const fileBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const localHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 2. Upload to IPFS service (e.g., Pinata)
    // IMPORTANT: Exposing API keys on the client is insecure. 
    // In a production app, this logic should be handled by a secure backend/serverless function.
    if (!IPFS_API_KEY || !IPFS_API_SECRET) {
        console.warn("IPFS API Key/Secret is not set. Using mock upload for demonstration.");
        // Mock response for demonstration without an API key
        await new Promise(res => setTimeout(res, 1000));
        const mockCid = `Qm${[...Array(44)].map(() => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 62))).join('')}`;
        setIsUploading(false);
        // NOTE: In a real app, the `imageUrl` would come from Firebase Storage, not IPFS.
        // This is a temporary stand-in.
        return { cid: `https://gateway.pinata.cloud/ipfs/${mockCid}`, hash: localHash };
    }
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(IPFS_API_URL, {
        method: 'POST',
        headers: {
          'pinata_api_key': IPFS_API_KEY,
          'pinata_secret_api_key': IPFS_API_SECRET,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to upload to IPFS: ${errorData}`);
      }

      const result = await response.json();
      const cid = result.IpfsHash;
      
      // Returning a gateway URL for direct use in `src` attributes
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

      setIsUploading(false);
      return { cid: gatewayUrl, hash: localHash };

    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unknown error occurred during upload.');
      setIsUploading(false);
      return null;
    }
  };

  return { isUploading, error, uploadFile };
};

export const downloadAndVerify = async (cid: string): Promise<{authentic: boolean, buffer: ArrayBuffer | null}> => {
    // In a real app, use an IPFS gateway
    const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;

    try {
        const response = await fetch(gatewayUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch file from IPFS.");
        }

        const fileBuffer = await response.arrayBuffer();
        
        // Since contract does not store hash, we just return true if download succeeds
        return { authentic: true, buffer: fileBuffer };

    } catch (e) {
        console.error(e);
        return { authentic: false, buffer: null };
    }
}
