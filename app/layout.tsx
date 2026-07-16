import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { LenisProvider } from '@/components/layout/LenisProvider'
import './globals.css'

// ── Fonts ─────────────────────────────────────────────────────────────────────

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

// ── Metadata ──────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  themeColor: '#04020e',
}

export const metadata: Metadata = {
  title: 'LoveCraft AI — Cinematic Love Experiences',
  description:
    'Transform your photos, music and memories into a cinematic love experience — a short romantic film that lives in a browser tab, forever.',
  keywords: ['love website generator', 'romantic website', 'anniversary gift', 'couple website'],
  authors: [{ name: 'LoveCraft AI' }],
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'LoveCraft AI — Cinematic Love Experiences',
    description:
      'Create a stunning cinematic love website from your photos, music and memories.',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'LoveCraft AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LoveCraft AI',
    description: 'Cinematic love websites, crafted from your memories.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

// ── Root layout ───────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        {/* Accessibility: skip-to-content link */}
        <a href="#generator" className="skip-link">
          Skip to main content
        </a>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
