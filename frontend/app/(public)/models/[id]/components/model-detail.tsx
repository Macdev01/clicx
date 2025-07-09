"use client"

import { useMemo, useState } from "react"

import NextLink from "next/link"

import { useToast } from "@/shared/hooks/use-toast"
import { type ModelDetail } from "@/shared/types/model"
import { ArrowLeft, Download, Link, Lock, Play } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { useSearch } from "@/contexts/search-context"

interface ModelDetailProps {
  model: ModelDetail
}

export function ModelDetail({ model }: ModelDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { searchTerm } = useSearch()
  const { toast } = useToast()

  // Filter videos based on search term (by author name and tags) - live filtering
  const filteredVideos = useMemo(() => {
    if (!searchTerm.trim()) return model.videos

    const searchLower = searchTerm.toLowerCase()
    return model.videos.filter(
      (video) =>
        model.authorName.toLowerCase().includes(searchLower) ||
        model.authorNick.toLowerCase().includes(searchLower) ||
        video.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    )
  }, [searchTerm, model.authorName, model.authorNick, model.videos])

  // Function to truncate text to approximately 3 lines (roughly 200 characters)
  const truncateText = (text: string, maxLength = 200) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const displayText = isExpanded ? model.text : truncateText(model.text)

  const handleShareLink = () => {
    toast({
      description: "Link copied to clipboard",
      duration: 1000,
    })
  }

  return (
    <main className="container px-[1%] py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <NextLink href="/models">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Models
          </NextLink>
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="mx-auto max-w-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12 border-2 border-sky-100">
                <AvatarImage
                  src={model.avatar || "/placeholder.svg"}
                  alt={model.authorName}
                  crossOrigin="anonymous"
                />
                <AvatarFallback className="bg-sky-50 text-sky-600">
                  {model.authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{model.authorName}</h3>
                    <span className="text-sm text-gray-500">{model.authorNick}</span>
                  </div>
                  <button
                    className="flex items-center space-x-2 text-gray-500 transition-colors hover:text-sky-500"
                    onClick={handleShareLink}
                  >
                    <Link className="h-5 w-5" />
                    <span className="text-sm font-medium">Share Link</span>
                  </button>
                </div>
                <div>
                  <p className="mb-2 leading-relaxed text-gray-700">{displayText}</p>
                  {model.text.length > 200 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="h-auto p-0 font-medium text-sky-500 hover:text-sky-600"
                    >
                      {isExpanded ? "Show less" : "Show more"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mx-auto max-w-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {model.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mx-auto max-w-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle>Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="relative cursor-pointer overflow-hidden rounded-lg bg-sky-50 transition-shadow hover:shadow-md"
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className={`h-32 w-full object-cover ${video.isPaid ? "blur-sm" : ""}`}
                      crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-sky-400 p-3 shadow-lg transition-colors hover:bg-sky-500">
                        {video.isPaid ? (
                          <Lock className="h-4 w-4 text-white" />
                        ) : (
                          <Play className="h-4 w-4 fill-white text-white" />
                        )}
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 rounded bg-black bg-opacity-75 px-2 py-1 text-xs text-white">
                      {video.duration}
                    </div>
                    {video.isPaid && (
                      <div className="absolute left-2 top-2 rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                        PAID
                      </div>
                    )}
                    {!video.isPaid && (
                      <button className="absolute bottom-2 right-2 rounded-full bg-sky-400 p-2 shadow-lg transition-colors hover:bg-sky-500">
                        <Download className="h-3 w-3 text-white" />
                      </button>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900">
                      {video.title}
                    </h4>
                    <p className="text-xs text-gray-500">{video.views.toLocaleString()} views</p>
                  </div>
                </div>
              ))}
            </div>

            {filteredVideos.length === 0 && searchTerm && (
              <div className="py-8 text-center">
                <p className="text-gray-500">No videos found matching "{searchTerm}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
