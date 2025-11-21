
import { NextResponse } from 'next/server';

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

export async function POST(request: Request) {
  if (!GEOAPIFY_API_KEY) {
    return NextResponse.json(
      { error: 'Places API key not configured.' },
      { status: 500 }
    );
  }

  try {
    const { lat, lon, categories } = await request.json();
    if (!lat || !lon || !categories) {
      return NextResponse.json({ error: 'Latitude, longitude, and categories are required.' }, { status: 400 });
    }

    const categoriesString = categories.join(',');
    const radius = 5000; // 5km radius

    const response = await fetch(
      `https://api.geoapify.com/v2/places?categories=${categoriesString}&filter=circle:${lon},${lat},${radius}&bias=proximity:${lon},${lat}&limit=20&apiKey=${GEOAPIFY_API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch places data', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data.features || []);

  } catch (e: any) {
    console.error('Places API Error:', e);
    return NextResponse.json(
      { error: e.message || 'An unknown error occurred while fetching nearby places.' },
      { status: 500 }
    );
  }
}
