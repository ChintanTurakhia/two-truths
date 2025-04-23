import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Two Truths and a Lie",
  description: "A fun game to play with your Farcaster friends!",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_HOST || "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content="Two Truths and a Lie" />
        <meta
          property="og:description"
          content="A fun game to play with your Farcaster friends!"
        />
        <meta property="og:image" content="/api/frames/image" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="/api/frames/image" />
        <meta property="fc:frame:post_url" content="/api/frames" />
        <meta property="fc:frame:button:1" content="Sign in with Farcaster" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
