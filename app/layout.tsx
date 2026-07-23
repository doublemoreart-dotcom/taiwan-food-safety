import type { Metadata } from "next";
import "./globals.css";

/* The App Router root layout is the document shell, so these font links are global. */
/* eslint-disable @next/next/no-page-custom-font */

const siteUrl = "http://dinopeng.com/taiwan-food-safety/";
const socialImageUrl = `${siteUrl}opengraph-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "台灣食安管理流程與權責分工",
  description: "互動理解食品業者、地方政府、中央食藥署、跨部會與司法體系在台灣食安治理中的流程與責任。",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: siteUrl,
    siteName: "台灣食安管理流程與權責分工",
    title: "台灣食安管理流程與權責分工",
    description: "從第一責任到事件分流，快速看懂台灣食安治理與權責協作。",
    images: [
      {
        url: socialImageUrl,
        width: 1731,
        height: 909,
        alt: "台灣食安管理流程與權責分工社群縮圖",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "台灣食安管理流程與權責分工",
    description: "從第一責任到事件分流，快速看懂台灣食安治理與權責協作。",
    images: [socialImageUrl],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=M+PLUS+1:wght@100..900&family=SN+Pro:wght@300..900&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+1:wght@100..900&family=SN+Pro:wght@300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
