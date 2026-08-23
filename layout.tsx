import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import SideNav from '@/components/SideNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Site Reporting Platform',
  description: 'Internal reporting platform for plant/site operations including Permit to Work Register',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="app-shell">
            <SideNav />
            <main className="main-content">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
