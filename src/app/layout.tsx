// src/app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"
import CosmicBackground from '@/components/background/CosmicBackground'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Twoja przepowiednia - Portal Astrologiczny',
  description: 'Portal z horoskopami i wróżbami personalizowanymi przez doświadczonych astrologów',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        {/* Dodanie CosmicBackground tutaj, aby był dostępny na wszystkich stronach */}
        <CosmicBackground />
        {children}
        <Toaster />
      </body>
    </html>
  )
}