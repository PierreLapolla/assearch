import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assearch — Répertoire National des Associations",
  description: "Recherchez parmi les associations françaises déclarées au RNA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex flex-col">{children}</main>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
