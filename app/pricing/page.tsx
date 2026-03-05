"use client";

import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
      else alert("Error al iniciar el pago. Intenta de nuevo.");
    } catch {
      alert("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white px-6 py-12">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-zinc-400 text-sm hover:text-white mb-8 inline-block">
          ← Volver
        </Link>
        <h1 className="text-3xl font-light mb-8">Planes</h1>

        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 p-6 bg-zinc-900/50">
            <h2 className="text-lg font-medium mb-2">Gratis</h2>
            <p className="text-zinc-400 text-sm mb-4">
              20 mensajes por día
            </p>
            <Link
              href="/chat"
              className="inline-block rounded-lg bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600"
            >
              Usar gratis
            </Link>
          </div>

          <div className="rounded-xl border border-zinc-600 p-6 bg-zinc-900/50">
            <h2 className="text-lg font-medium mb-2">Premium</h2>
            <p className="text-4xl font-light mb-1">$60 <span className="text-lg text-zinc-400">/año</span></p>
            <p className="text-zinc-400 text-sm mb-4">
              Mensajes ilimitados
            </p>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="rounded-lg bg-white text-[#0B0B0F] px-4 py-2 text-sm font-medium hover:bg-zinc-200 disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Suscribirse"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
