"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ChatBubble } from "@/components/ChatBubble";
import { ChatInput } from "@/components/ChatInput";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  useEffect(() => {
    async function init() {
      if (!supabase) {
        setAuthLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      try {
        const profileRes = await fetch("/api/profile");
        if (!profileRes.ok) {
          setAuthLoading(false);
          return;
        }
        const profileData = await profileRes.json();
        setProfile(profileData);

        if (!profileData.name?.trim()) {
          router.replace("/onboarding");
          return;
        }

        const chatRes = await fetch("/api/chat");
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          if (chatData.messages?.length) {
            setMessages(chatData.messages);
          }
        }
      } catch {
        // ignore
      } finally {
        setAuthLoading(false);
      }
    }
    init();
  }, [router]);

  async function handleSend(message: string) {
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    const fallback = "Lo siento, hubo un error. Intenta de nuevo.";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          userName: profile?.name?.trim() || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      const reply = data?.reply || fallback;
      setMessages((prev) => [...prev, { role: "ai", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: fallback }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase?.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0B0B0F]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-screen max-h-[100dvh] bg-[#0B0B0F]">
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <Link href="/" className="text-zinc-400 text-sm hover:text-white">
          Vinculo
        </Link>
        <div className="flex gap-4">
          <Link href="/profile" className="text-zinc-400 text-sm hover:text-white">
            Perfil
          </Link>
          <Link href="/pricing" className="text-zinc-400 text-sm hover:text-white">
            Premium
          </Link>
          <button onClick={handleLogout} className="text-zinc-400 text-sm hover:text-white">
            Salir
          </button>
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 min-h-0">
        {messages.length === 0 && (
          <p className="text-zinc-500 text-center text-sm px-4 pt-8">
            Escribe algo para comenzar la conversación.
          </p>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} content={m.content} />
        ))}
      </div>
      <ChatInput onSend={handleSend} disabled={loading} />
    </main>
  );
}
