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
  title: "Familieweekend Exloo 2025 | Landal PUUR Exloo",
  description: "Join us voor een onvergetelijk familieweekend in de bossen van Drenthe! 20-23 Juni 2025",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  manifest: "/manifest.json",
  themeColor: "#00573c",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Familieweekend Exloo",
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
