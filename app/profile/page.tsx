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

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerGender, setPartnerGender] = useState("neutral");
  const [personalityType, setPersonalityType] = useState("romantic");
  const [intensityLevel, setIntensityLevel] = useState("medium");

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setName(data.name ?? "");
          setPartnerName(data.partnerName ?? "Vinculo");
          setPartnerGender(data.partnerGender ?? "neutral");
          setPersonalityType(data.personalityType ?? "romantic");
          setIntensityLevel(data.intensityLevel ?? "medium");
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          partnerName: partnerName.trim() || "Vinculo",
          partnerGender,
          personalityType,
          intensityLevel,
        }),
      });
      if (res.ok) router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0B0B0F]">
        <p className="text-zinc-500">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12 bg-[#0B0B0F]">
      <div className="max-w-md mx-auto">
        <Link href="/chat" className="text-zinc-500 text-sm hover:text-white mb-6 inline-block">
          ← Volver al chat
        </Link>
        <h1 className="text-xl font-light mb-8">Mi perfil</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Tu nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-zinc-800 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Nombre del compañero</label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="w-full rounded-xl bg-zinc-800 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Género</label>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setPartnerGender(g.value)}
                  className={`px-4 py-2 rounded-xl text-sm ${
                    partnerGender === g.value ? "bg-white text-[#0B0B0F]" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Personalidad</label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPersonalityType(p.value)}
                  className={`px-4 py-2 rounded-xl text-sm ${
                    personalityType === p.value ? "bg-white text-[#0B0B0F]" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Intensidad</label>
            <div className="flex flex-wrap gap-2">
              {INTENSITIES.map((i) => (
                <button
                  key={i.value}
                  type="button"
                  onClick={() => setIntensityLevel(i.value)}
                  className={`px-4 py-2 rounded-xl text-sm ${
                    intensityLevel === i.value ? "bg-white text-[#0B0B0F]" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-white text-[#0B0B0F] font-medium hover:bg-zinc-200 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
    </main>
  );
}
