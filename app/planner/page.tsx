"use client";

import { useState } from "react";
import Link from "next/link";

interface DirectionsResult {
  summary: string;
  distance: string;
  duration: string;
  steps: { instruction: string; distance: string }[];
}

export default function PlannerPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<DirectionsResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setResult(null);

    const params = new URLSearchParams({ origin, destination });
    const res = await fetch(`/api/directions?${params}`);
    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "Failed to fetch directions.");
      return;
    }

    setStatus("idle");
    setResult(data);
  }

  return (
    <main className="flex flex-col min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold tracking-tight">
          RoutSkies
        </Link>
        <span className="text-sm text-gray-400">Route Planner</span>
      </nav>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Sidebar */}
        <aside className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-gray-100 p-6 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Plan your route</h1>
            <p className="text-gray-500 text-sm mt-1">
              Enter your start and end points to see weather along the way.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Origin
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Austin, TX"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Destination
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nashville, TN"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-black text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Fetching route…" : "Get Route + Weather"}
            </button>
          </form>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
                <p className="font-semibold text-sm">{result.summary}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>{result.distance}</span>
                  <span>{result.duration}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Steps
                </p>
                <ol className="flex flex-col gap-2">
                  {result.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="text-gray-400 shrink-0 w-5">{i + 1}.</span>
                      <span className="flex-1">
                        <span
                          dangerouslySetInnerHTML={{ __html: step.instruction }}
                        />
                        <span className="text-gray-400 ml-2 text-xs">
                          {step.distance}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </aside>

        {/* Map placeholder */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-12 text-center">
          {result ? (
            <div className="flex flex-col gap-3">
              <p className="text-5xl">🗺️</p>
              <p className="font-medium">Route loaded</p>
              <p className="text-sm text-gray-500">
                Map integration coming soon. Weather waypoints will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-5xl">🌤️</p>
              <p className="font-medium text-gray-700">
                Your route + weather will appear here
              </p>
              <p className="text-sm text-gray-400">
                Enter an origin and destination to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
