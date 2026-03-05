"use client";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    const text = input?.value?.trim();
    if (text && !disabled) {
      onSend(text);
      input.value = "";
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 p-4 bg-[#0B0B0F] border-t border-zinc-800 safe-area-pb"
    >
      <input
        name="message"
        type="text"
        placeholder="Escribe un mensaje..."
        disabled={disabled}
        className="flex-1 rounded-xl bg-zinc-800 text-white px-4 py-3 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-xl bg-zinc-600 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Enviar
      </button>
    </form>
  );
}
