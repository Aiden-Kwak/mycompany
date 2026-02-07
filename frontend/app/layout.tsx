import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'My Dev Company - AI 자동 애플리케이션 개발 플랫폼',
  description: '코딩 없이 AI가 자동으로 애플리케이션을 개발해드립니다',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="pixel-rendering">
        {children}
      </body>
    </html>
  )
}

// Made with Bob
