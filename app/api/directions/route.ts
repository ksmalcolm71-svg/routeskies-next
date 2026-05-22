import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");

  if (!origin || !destination) {
    return Response.json(
      { error: "origin and destination query params are required" },
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

  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK") {
    return Response.json(
      { error: data.error_message ?? `Directions API error: ${data.status}` },
      { status: 400 }
    );
  }

  const route = data.routes[0];
  const leg = route.legs[0];

  return Response.json({
    summary: route.summary,
    distance: leg.distance.text,
    duration: leg.duration.text,
    steps: leg.steps.map((step: { html_instructions: string; distance: { text: string } }) => ({
      instruction: step.html_instructions,
      distance: step.distance.text,
    })),
    polyline: route.overview_polyline.points,
    bounds: route.bounds,
  });
}
