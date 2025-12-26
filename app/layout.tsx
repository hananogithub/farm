import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DairyFarm Insight',
  description: 'Dairy and livestock farm management SaaS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}


