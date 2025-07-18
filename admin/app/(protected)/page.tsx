'use client'

import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-8">
      <div className="relative">
        <Image
          src="/clixxx-logo.svg"
          alt="Clixxx Logo"
          width={200}
          height={80}
          priority
        />
      </div>
      <div className="relative">
        <Image
          src="/woman.png"
          alt="women"
          width={300}
          height={600}
          priority
        />
      </div>
    </div>
  )
} 