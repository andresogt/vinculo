"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const GENDERS = [
  { value: "feminine", label: "Femenino" },
  { value: "masculine", label: "Masculino" },
  { value: "neutral", label: "Neutral" },
];

const PERSONALITIES = [
  { value: "romantic", label: "Romántico" },
  { value: "passionate", label: "Apasionado" },
  { value: "playful", label: "Juguetón" },
  { value: "deep", label: "Profundo" },
  { value: "mysterious", label: "Misterioso" },
];

const INTENSITIES = [
  { value: "low", label: "Bajo" },
  { value: "medium", label: "Medio" },
  { value: "high", label: "Alto" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [partnerName, setPartnerName] = useState("Vinculo");
  const [partnerGender, setPartnerGender] = useState("neutral");
  const [personalityType, setPersonalityType] = useState("romantic");
  const [intensityLevel, setIntensityLevel] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase no configurado");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          partnerName: partnerName.trim() || "Vinculo",
          partnerGender,
          personalityType,
          intensityLevel,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al guardar");
      }
      router.push("/chat");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function checkProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.name) {
            router.replace("/chat");
          }
        }
      } catch {
        // ignore
      }
    }
    if (supabase && step === 1) checkProfile();
  }, [router, step]);

  if (!supabase) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0B0B0F]">
        <p className="text-zinc-500">Configura Supabase para continuar.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-[#0B0B0F]">
      <h1 className="text-xl font-light mb-8">Configura tu experiencia</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm text-zinc-400">¿Cuál es tu nombre?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
              className="w-full rounded-xl bg-zinc-800 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-sm text-zinc-400">Género de tu compañero</label>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setPartnerGender(g.value)}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    partnerGender === g.value ? "bg-white text-[#0B0B0F]" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label className="block text-sm text-zinc-400">Personalidad</label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPersonalityType(p.value)}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    personalityType === p.value ? "bg-white text-[#0B0B0F]" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <label className="block text-sm text-zinc-400">Nombre de tu compañero</label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Vinculo"
              className="w-full rounded-xl bg-zinc-800 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
            <label className="block text-sm text-zinc-400 mt-4">Intensidad de la relación</label>
            <div className="flex flex-wrap gap-2">
              {INTENSITIES.map((i) => (
                <button
                  key={i.value}
                  type="button"
                  onClick={() => setIntensityLevel(i.value)}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    intensityLevel === i.value ? "bg-white text-[#0B0B0F]" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700"
            >
              Atrás
            </button>
          ) : null}
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !name.trim()}
              className="flex-1 px-6 py-3 rounded-xl bg-white text-[#0B0B0F] font-medium hover:bg-zinc-200 disabled:opacity-50"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl bg-white text-[#0B0B0F] font-medium hover:bg-zinc-200 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Comenzar"}
            </button>
          )}
        </div>
      </form>

      <Link href="/chat" className="mt-8 text-zinc-500 text-sm hover:text-white">
        Omitir por ahora
      </Link>
    </main>
  );
}
