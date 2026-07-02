import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import LenisProvider from "@/components/providers/lenis-provider";
import AuthProvider from "@/components/providers/auth-provider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import SystemBanner from "@/components/layout/SystemBanner";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Socialties | Premier Influencer Marketing Agency India",
  description: "Authentic storytelling meets data-driven campaign strategy. Partner with top creators to grow your brand with Socialties.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <LenisProvider>
              <SystemBanner />
              <Navbar />
              <main className="flex-grow pt-[72px] md:pt-[88px]">{children}</main>
              <Footer />
              <WhatsAppButton />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" },
                  success: { iconTheme: { primary: "#CCFF00", secondary: "#000" } },
                }}
              />
            </LenisProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
