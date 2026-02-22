import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  title: "BranchGPT . thinking isnt linear its branched.",
  description: "BranchGPT , a new form of chat interface , with git basaed branching , forking , merging and built using DAG",
  metadataBase: new URL("https://branchgpt.vasudev.live"),
  openGraph: {
    title: "BranchGPT . thinking isnt linear its branched.",
    description: "BranchGPT , a new form of chat interface , with git basaed branching , forking , merging and built using DAG",
    url: "https://branchgpt.vasudev.live",
    siteName: "BranchGPT",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BranchGPT - Thinking isn't linear, it's branched",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BranchGPT . thinking isnt linear its branched.",
    description: "BranchGPT , a new form of chat interface , with git basaed branching , forking , merging and built using DAG",
    site: "@vasu-devs",
    creator: "@vasu-devs",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo.png",
  },
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
