"use client"

import { usePathname } from "next/navigation"

import { Eye, Heart, Video } from "lucide-react"

// This would typically come from a database or API
const getModelData = (id: string) => {
  const models = {
    "1": {
      name: "Model Eva",
      authorName: "Emma Rodriguez",
      authorNick: "@emma_creates",
      views: 5678,
      likes: 234,
      videos: 12,
    },
    "2": {
      name: "3D Character Model",
      authorName: "Alex Chen",
      authorNick: "@alextech",
      views: 3421,
      likes: 156,
      videos: 8,
    },
    "3": {
      name: "Image Generator Pro",
      authorName: "Sarah Johnson",
      authorNick: "@sarahdesigns",
      views: 8765,
      likes: 567,
      videos: 15,
    },
    "4": {
      name: "Text Analyzer",
      authorName: "Marcus Williams",
      authorNick: "@marcus_vfx",
      views: 2134,
      likes: 89,
      videos: 6,
    },
    "5": {
      name: "Voice Synthesizer",
      authorName: "Luna Park",
      authorNick: "@luna_animator",
      views: 4567,
      likes: 312,
      videos: 10,
    },
    "6": {
      name: "Code Assistant",
      authorName: "David Kim",
      authorNick: "@davidcodes",
      views: 9876,
      likes: 445,
      videos: 18,
    },
  }

  return models[id as keyof typeof models] || models["1"]
}

export function Hero() {
  const pathname = usePathname()

  // Check if we're on a model detail page
  const modelMatch = pathname.match(/^\/models\/(.+)$/)

  if (modelMatch) {
    const modelId = modelMatch[1]
    const model = getModelData(modelId || "")

    return (
      <section className="border-b bg-gradient-to-br from-sky-50 to-cyan-100">
        <div className="container px-6 py-12">
          <div className="flex items-start justify-between">
            {/* Left side - Model name with share icon */}
            <div className="">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                {model.name}
              </h1>
            </div>

            {/* Right side - Stats icons */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Eye className="h-5 w-5" />
                <span className="font-medium">{model.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Heart className="h-5 w-5" />
                <span className="font-medium">{model.likes.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Video className="h-5 w-5" />
                <span className="font-medium">{model.videos}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Default banner for all other pages
  return (
    <section className="border-b bg-gradient-to-br from-sky-50 to-cyan-100">
      <div className="container px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Welcome to Clixxx.me
          </h1>
        </div>
      </div>
    </section>
  )
}
