import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CalendarReels — Calendario de Pedidos y Precios de Videos",
  description:
    "Organiza tus pedidos de videos en un calendario interactivo y controla el precio y cobro de cada video creado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
