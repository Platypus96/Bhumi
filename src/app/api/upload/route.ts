
import { NextResponse } from 'next/server';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export async function POST(request: Request) {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    return NextResponse.json(
      { status: 'error', message: 'Pinata API keys are not configured.' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { status: 'error', message: 'No file found in the request.' },
        { status: 400 }
      );
    }
    
    // Create a new FormData instance for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file, file.name);

    const response = await fetch(PINATA_API_URL, {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
      },
      body: pinataFormData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to upload to Pinata: ${errorData}`);
    }

    const result = await response.json();
    const cid = result.IpfsHash;
    
    return NextResponse.json({
      status: 'success',
      cid: cid,
      ipfs_url: `https://gateway.pinata.cloud/ipfs/${cid}`
    });

  } catch (e: any) {
    console.error('Upload API Error:', e);
    return NextResponse.json(
      { status: 'error', message: e.message || 'An unknown error occurred during upload.' },
      { status: 500 }
    );
  }
}
