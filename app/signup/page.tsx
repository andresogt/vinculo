"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase no configurado");
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0B0B0F]">
      <h1 className="text-2xl font-light mb-6">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl bg-zinc-800 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-600"
        />
        <input
          type="password"
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-xl bg-zinc-800 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-600"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white text-[#0B0B0F] py-3 font-medium hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>
      <p className="mt-6 text-zinc-500 text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-white hover:underline">
          Iniciar sesión
        </Link>
      </p>
      <Link href="/" className="mt-4 text-zinc-500 text-sm hover:text-white">
        ← Volver
      </Link>
    </main>
  );
}
