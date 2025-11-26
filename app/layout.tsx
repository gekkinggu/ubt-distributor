import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UBT Distributor - Sistem Manajemen Distribusi",
  description: "Sistem manajemen distribusi Uterine Balloon Tamponade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
