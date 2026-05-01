import type { Metadata, Viewport } from "next"
import { DM_Mono, Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Civic Sense",
  description: "SF street issue tracker and reporting",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CivicSense",
  },
}

export const viewport: Viewport = {
  themeColor: "#FF4C00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${dmMono.variable} ${inter.variable}`}
      style={{ height: "100%" }}
    >
      <body style={{ height: "100%", margin: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
