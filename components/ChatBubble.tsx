interface ChatBubbleProps {
  role: "user" | "ai";
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 px-4`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-lg ${
          isUser
            ? "bg-zinc-700 text-white rounded-br-md"
            : "bg-zinc-800 text-zinc-100 rounded-bl-md"
        }`}
      >
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
