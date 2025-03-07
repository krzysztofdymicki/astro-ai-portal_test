// src/app/page.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/sonner"

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
  // W root layout NIE POWINNO być sprawdzania sesji ani przekierowań!
  return (
    <html lang="pl">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}