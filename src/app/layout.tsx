import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ModalProviders from "@/components/providers/modal-providets";
import { Toaster } from "@/components/ui/sonner";
import JotaiProvider from "@/components/providers/jotai-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Slack clone",
  description: "Slack clone ui home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ConvexClientProvider>
            <JotaiProvider>
              <Toaster />
              <ModalProviders />
              {children}
            </JotaiProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
