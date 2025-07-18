'use client'

import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
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