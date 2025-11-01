
import { useState } from 'react';

// The URL for our internal API endpoint
const UPLOAD_API_URL = '/api/upload';

export const useIPFS = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<{ cid: string; } | null> => {
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // We now send the file to our own backend API route
      const response = await fetch(UPLOAD_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message);
      }
      
      // The API returns the full gateway URL
      const gatewayUrl = result.ipfs_url;

      setIsUploading(false);
      return { cid: gatewayUrl };

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
    const gatewayUrl = cid; // The CID is now the full URL.

    try {
        const response = await fetch(gatewayUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch file from IPFS.");
        }

        const fileBuffer = await response.arrayBuffer();
        
        return { authentic: true, buffer: fileBuffer };

    } catch (e) {
        console.error(e);
        return { authentic: false, buffer: null };
    }
}
