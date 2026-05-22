import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const address = searchParams.get("address");
  const latlng = searchParams.get("latlng");

  if (!address && !latlng) {
    return Response.json(
      { error: "address or latlng query param is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Google Maps API key not configured" },
      { status: 500 }
    );
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  if (address) url.searchParams.set("address", address);
  if (latlng) url.searchParams.set("latlng", latlng);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK") {
    return Response.json(
      { error: data.error_message ?? `Geocoding API error: ${data.status}` },
      { status: 400 }
    );
  }

  const result = data.results[0];

  return Response.json({
    formattedAddress: result.formatted_address,
    location: result.geometry.location,
    placeId: result.place_id,
    types: result.types,
  });
}
