import type { Metadata } from "next";
import { Inter, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { LoaderProvider } from "@/lib/LoaderContext";
import { RouteTransitionHandler } from '@/components/RouteTransitionHandler';

// Initialize real-time features
import '@/lib/startup';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "EV Bunker - Electric Vehicle Charging Stations",
  description: "Find, book, and pay for EV charging stations seamlessly with EV Bunker. Revolutionizing the electric vehicle charging experience.",
  icons: {
    icon: "/assets/favicon.ico",
    shortcut: "/assets/favicon.ico",
    apple: "/assets/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${roboto.variable} antialiased`}
      >
        <SessionProvider>
          <LoaderProvider>
            <RouteTransitionHandler />
            {children}
          </LoaderProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
