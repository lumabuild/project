import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { getSession, SessionProvider } from "next-auth/react";
import { auth } from "@/server/auth";
import { TRPCReactProvider } from "@/trpc/react";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LumaBuild Terminal Interface",
  description: "A retro terminal interface for LumaBuild",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en">
      <TRPCReactProvider>
        <SessionProvider session={session}>
          <body className={inter.className}>{children}</body>
        </SessionProvider>
      </TRPCReactProvider>
    </html>
  );
}