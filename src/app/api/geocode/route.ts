import { NextResponse } from 'next/server';

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

export async function POST(request: Request) {
  if (!GEOAPIFY_API_KEY) {
    return NextResponse.json(
      { error: 'Geocoding API key not configured.' },
      { status: 500 }
    );
  }

  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Search query is required.' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch geocoding data', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return the first valid result's coordinates
    if (data.features && data.features.length > 0) {
      const { lat, lon } = data.features[0].properties;
      return NextResponse.json({ lat, lon });
    } else {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

  } catch (e: any) {
    console.error('Geocode API Error:', e);
    return NextResponse.json(
      { error: e.message || 'An unknown error occurred during geocoding.' },
      { status: 500 }
    );
  }
}
