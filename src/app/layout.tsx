import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { PhoneShell } from "@/components/PhoneShell";

export const metadata: Metadata = {
  title: "FixFirst — Fix what matters first",
  description:
    "A Citizen-style civic app. Turn photos, video and voice into prioritized, severity-weighted infrastructure reports near you.",
};

export const viewport: Viewport = {
  themeColor: "#08090d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreProvider>
          <PhoneShell>{children}</PhoneShell>
        </StoreProvider>
      </body>
    </html>
  );
}
