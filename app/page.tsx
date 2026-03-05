import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0B0B0F]">
      <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-3">
        Vinculo
      </h1>
      <p className="text-zinc-400 text-center mb-12 text-lg max-w-sm">
        Una conexión que evoluciona contigo.
      </p>
      <Link
        href="/chat"
        className="rounded-xl bg-white text-[#0B0B0F] px-8 py-3 font-medium hover:bg-zinc-200 transition-colors"
      >
        Comenzar
      </Link>
      <div className="mt-6 flex gap-4">
        <Link href="/login" className="text-zinc-500 text-sm hover:text-white">
          Iniciar sesión
        </Link>
        <Link href="/signup" className="text-zinc-500 text-sm hover:text-white">
          Crear cuenta
        </Link>
      </div>
      <Link href="/pricing" className="mt-4 text-zinc-500 text-sm hover:text-white">
        Ver planes
      </Link>
    </main>
  );
}
