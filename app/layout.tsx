import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Melhores do Brasil nas Copas",
  description: "Vote nos maiores jogadores brasileiros em cada Copa do Mundo."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
