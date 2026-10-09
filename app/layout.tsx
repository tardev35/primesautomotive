import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PROM DRIVE | Car Rental",
  description: "A private collection of performance and ultra-luxury cars, delivered across Bangkok.",
  icons: {
    icon: "/prom-drive-logo.png",
    shortcut: "/prom-drive-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
