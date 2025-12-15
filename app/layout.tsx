import "./globals.css";
import type { Metadata } from "next";
import HeaderBar from "@/components/HeaderBar";
import FooterBar from "@/components/FooterBar";

export const metadata: Metadata = {
  title: "EPICenter Site",
  description: "EPICenter Shop Site",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* IBM Plex Sans from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/BYU_Block_Y_white.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <HeaderBar />
        <div className="w-full">{children}</div>
        <FooterBar />
      </body>
    </html>
  );
}
