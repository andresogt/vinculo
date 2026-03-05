import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vinculo",
  description: "Una conexión que evoluciona contigo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#0B0B0F] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
