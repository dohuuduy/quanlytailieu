import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quản lý Hồ sơ Tài liệu Doanh nghiệp',
  description: 'Hệ thống quản lý hồ sơ tài liệu tuân thủ các tiêu chuẩn ISO, BRC, SMETA, ASC, HACCP, BAP',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}