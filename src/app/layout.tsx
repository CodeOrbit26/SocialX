import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SocialX - Engagement Marketplace",
  description: "Earn credits by engaging on social media platforms, and spend them to grow your own channels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#030303] text-zinc-100 selection:bg-purple-600/30 selection:text-purple-200">
        <Providers>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <footer className="border-t border-zinc-900 bg-black/60 py-6 text-center text-xs text-zinc-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              &copy; {new Date().getFullYear()} SocialX. Powered by decentralized user engagement.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
