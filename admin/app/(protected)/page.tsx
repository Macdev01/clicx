'use client'

import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-8">
      <div className="relative w-[200px] h-[80px]">
        <Image
          src="/clixxx-logo.svg"
          alt="Clixxx Logo"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      <div className="relative w-[300px] h-[600px]">
        <Image
          src="/fashion-illustration.jpg"
          alt="Fashion Illustration"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
    </div>
  )
} 