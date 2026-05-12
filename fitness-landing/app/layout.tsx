import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'Stride - The Future of Health Tracking Today',
  description: 'Experience smarter, real-time wellness insights with seamless tracking — empowering you to take control of your health every day.',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${playfair.variable} font-sans`}>{children}</body>
    </html>
  )
}