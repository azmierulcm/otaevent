import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Otaevent",
  description: "Classified event CMS for planners, vendors, and platform owners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-950">{children}</body>
    </html>
  );
}
