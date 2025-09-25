import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/widgets";
import Providers from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Finote - 나의 첫 번째 자산관리 앱노트",
  description: "Supabase와 Next.js로 만들어보는 자산관리 앱노트"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-[52px]`}
      >
        <Providers>
          <Navbar />
          <div className="h-screen bg-slate-950">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
