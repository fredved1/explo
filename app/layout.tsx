import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Familieweekend Exloo 2025 | Veddertjes & Antonisse",
  description: "🌳 Het is bijna zover! Een onvergetelijk weekend samen in de Drentse bossen. Welness villa's, activiteiten en familietijd van 20-23 juni 2025.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  manifest: "/manifest.json",
  themeColor: "#00573c",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Familieweekend Exloo",
  },
  openGraph: {
    title: "Familieweekend Exloo 2025 🌳",
    description: "Het is bijna zover! Een onvergetelijk weekend samen in de Drentse bossen. Wellness villa's, activiteiten en familietijd ✨",
    type: "website",
    url: "https://familieweekend-exloo.vercel.app",
    siteName: "Familieweekend Exloo",
    images: [
      {
        url: "/family-photo.jpg",
        width: 1200,
        height: 630,
        alt: "Veddertjes & Antonisse Familieweekend Exloo 2025",
      },
    ],
    locale: "nl_NL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Familieweekend Exloo 2025 🌳",
    description: "Het is bijna zover! Een onvergetelijk weekend samen in de Drentse bossen. Wellness villa's, activiteiten en familietijd ✨",
    images: ["/family-photo.jpg"],
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl" className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased bg-white text-gray-900 min-h-screen`}>
        <div className="max-w-md mx-auto">{children}</div>
      </body>
    </html>
  )
}
