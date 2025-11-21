import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const ethPrice = data.ethereum.usd;

    if (!ethPrice) {
        throw new Error('Price not found in CoinGecko response');
    }

    return NextResponse.json({ usd: ethPrice });
  } catch (error: any) {
    console.error("Failed to fetch ETH price:", error);
    return NextResponse.json(
      { error: 'Failed to fetch ETH price', details: error.message },
      { status: 500 }
    );
  }
}
