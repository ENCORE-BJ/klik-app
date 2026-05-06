import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Simple and stable font setup
const inter = Inter({ 
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Klik Passport | Nairobi Infrastructure",
  description: "Modernizing service economy transactions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}