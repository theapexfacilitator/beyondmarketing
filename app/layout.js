import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'Beyond Marketing — Simplifying Marketing. Connecting Business.',
  description: 'Beyond Marketing is a Business Growth Operating System. We connect marketing, sales, technology, automation and reporting into one simplified ecosystem — so you own your data and understand how you grow.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  )
}
