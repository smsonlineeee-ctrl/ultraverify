import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "../app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Virtual Number Marketplace",
  description: "Buy virtual numbers for any country.",
};

import ClientLayoutWrapper from "./ClientLayoutWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-gray-50 text-gray-900 min-h-screen"}>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
