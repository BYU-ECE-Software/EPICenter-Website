import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Health",
  description: "App & DB status overview",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-3xl p-6">{children}</div>
      </body>
    </html>
  );
}
