"use client";

import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus("success");
      setMessage("You're on the list! We'll be in touch.");
      setEmail("");
    } else {
      setStatus("error");
      setMessage(data.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="text-xl font-bold tracking-tight">RoutSkies</span>
        <Link
          href="/planner"
          className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Plan a Route
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center gap-6">
        <h1 className="text-5xl font-bold tracking-tight max-w-2xl leading-tight">
          Know the weather before the road does.
        </h1>
        <p className="text-lg text-gray-500 max-w-xl">
          RoutSkies overlays real-time weather across your entire road trip route
          — hour by hour, mile by mile. No surprises.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link
            href="/planner"
            className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Try the Planner
          </Link>
          <a
            href="#waitlist"
            className="border border-gray-300 px-6 py-3 rounded-xl font-medium hover:border-gray-500 transition-colors"
          >
            Join the Waitlist
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 px-6 py-16 max-w-5xl mx-auto w-full">
        {[
          {
            icon: "🗺️",
            title: "Route-aware weather",
            body: "Weather pulled at waypoints along your route, not just at your destination.",
          },
          {
            icon: "⏱️",
            title: "Time-based forecasts",
            body: "We sync your drive time with forecasts so you know what to expect when you arrive at each point.",
          },
          {
            icon: "⚡",
            title: "Instant lookup",
            body: "Enter an origin and destination and get your full weather-overlaid route in seconds.",
          },
        ].map((f) => (
          <div key={f.title} className="flex flex-col gap-3">
            <span className="text-3xl">{f.icon}</span>
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      {/* Waitlist */}
      <section
        id="waitlist"
        className="flex flex-col items-center gap-6 px-6 py-20 bg-gray-50"
      >
        <h2 className="text-3xl font-bold tracking-tight">Stay in the loop</h2>
        <p className="text-gray-500 max-w-md text-center">
          We&apos;re rolling out new features fast. Drop your email and we&apos;ll let you
          know when big things land.
        </p>

        {status === "success" ? (
          <p className="text-green-600 font-medium">{message}</p>
        ) : (
          <form
            onSubmit={handleWaitlist}
            className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-black text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Joining…" : "Join Waitlist"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-red-500 text-sm">{message}</p>
        )}
      </section>

      <footer className="text-center text-xs text-gray-400 py-6">
        &copy; {new Date().getFullYear()} RoutSkies. All rights reserved.
      </footer>
    </main>
  );
}
