import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Familieweekend Exloo 2025',
  description: 'Familieweekend Veddertjes & Antonisse - 20-23 Juni 2025',
  generator: 'Next.js',
  manifest: '/manifest.json',
  themeColor: '#10b981',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Exloo 2025'
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/api/icon?size=180" />
      </head>
      <body className="overscroll-none">{children}</body>
    </html>
  )
}
