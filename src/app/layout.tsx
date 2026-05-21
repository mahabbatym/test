import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { headers } from "next/headers";

import { AppShell } from "@/components/layout/app-shell";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cherry",
    template: "%s | Cherry",
  },
  description: "Production-ready chess application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathname = headerList.get("x-invoke-path") ?? headerList.get("x-matched-path") ?? "";
  const isGuestPlay = pathname.startsWith("/play/guest");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <AppProviders>
          {isGuestPlay ? children : <AppShell>{children}</AppShell>}
        </AppProviders>
      </body>
    </html>
  );
}
