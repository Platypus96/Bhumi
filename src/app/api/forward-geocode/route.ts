import { NextResponse } from 'next/server';

const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request: Request) {
  if (!GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: 'Google API key not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is missing' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${GEOCODING_API_URL}?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_message || `Geocoding API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return NextResponse.json({ lat: location.lat, lng: location.lng });
    } else {
      return NextResponse.json(
        { error: data.error_message || 'Location not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Geocoding API Error:", error);
    return NextResponse.json(
      { error: 'Failed to fetch coordinates', details: error.message },
      { status: 500 }
    );
  }
}
