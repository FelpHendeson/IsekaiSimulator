import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "isekaiSimulator",
  description: "RPG isekai com escolhas, turnos, treino e tempo dinamico.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
