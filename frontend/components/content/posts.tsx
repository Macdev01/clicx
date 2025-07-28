"use client"

import { useMemo, useState } from "react"

import { useToast } from "@/shared/hooks/use-toast"
import { type Post } from "@/shared/types/post"
import { Heart, Link, Loader2, MessageCircle, Play, Share } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { useSearch } from "@/contexts/search-context"

import { PostViewer } from "./post-viewer"

interface PostsProps {
  posts: Post[]
}

export function Posts({ posts }: PostsProps) {
  const { toast } = useToast()
  const [loadingStates, setLoadingStates] = useState<{ [id: string]: boolean }>({})
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const { searchTerm } = useSearch()

  // Filter posts based on search term - live filtering (author name, nickname, and tags)
  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts

    const searchLower = searchTerm.toLowerCase()
    return posts.filter(
      (post) =>
        post.name.toLowerCase().includes(searchLower) ||
        post.nickname.toLowerCase().includes(searchLower) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    )
  }, [searchTerm, posts])

  const handleSubscribe = async (postId: string) => {
    // Set loading state for this specific post
    setLoadingStates((prev) => ({ ...prev, [postId]: true }))

    // Simulate 2-second delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Reset loading state
    setLoadingStates((prev) => ({ ...prev, [postId]: false }))

    // Show success message
    toast({
      description: "Payment Successful",
      duration: 1000,
    })
  }

  const handlePlayClick = (post: Post) => {
    setSelectedPost(post)
  }

  const handleCloseViewer = () => {
    setSelectedPost(null)
  }

  return (
    <>
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <Card
            key={post.id}
            className="mx-auto max-w-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="p-6">
              {/* Header with avatar, name, and timestamp */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border-2 border-sky-100">
                    <AvatarImage
                      src={post.avatar || "/placeholder.svg"}
                      alt={post.name}
                      crossOrigin="anonymous"
                    />
                    <AvatarFallback className="bg-sky-50 text-sky-600">
                      {post.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{post.name}</h3>
                    <span className="text-sm text-gray-500">{post.nickname}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{post.timestamp}</p>
              </div>

              {/* Video placeholder */}
              <div
                className="relative mb-4 cursor-pointer overflow-hidden rounded-lg bg-sky-50"
                onClick={() => handlePlayClick(post)}
              >
                <img
                  src={post.videoPoster || "/placeholder.svg"}
                  alt="Post video"
                  className="h-64 w-full object-cover"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-sky-400 p-4 shadow-lg transition-colors hover:bg-sky-500">
                    <Play className="h-6 w-6 fill-white text-white" />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-sky-100 text-xs text-sky-700 hover:bg-sky-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action buttons */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-gray-500 transition-colors hover:text-red-500">
                    <Heart className="h-5 w-5" />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 transition-colors hover:text-sky-500">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{post.comments}</span>
                  </button>
                  <button
                    className="flex items-center space-x-2 text-gray-500 transition-colors hover:text-green-600"
                    onClick={() => {
                      toast({
                        description: "Video was copied to my content",
                        duration: 1000,
                      })
                    }}
                  >
                    <Share className="h-5 w-5" />
                    <span className="text-sm font-medium">{post.shares}</span>
                  </button>
                </div>
                <button
                  className="flex items-center space-x-2 text-gray-500 transition-colors hover:text-sky-500"
                  onClick={() => {
                    toast({
                      description: "Link copied to clipboard",
                      duration: 1000,
                    })
                  }}
                >
                  <Link className="h-5 w-5" />
                  <span className="text-sm font-medium">Share Link</span>
                </button>
              </div>

              {/* Story */}
              <p className="mb-4 text-sm leading-relaxed text-gray-700">{post.story}</p>

              {/* Subscribe button */}
              <Button
                className="w-full bg-sky-400 text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loadingStates[post.id.toString()]}
                onClick={() => handleSubscribe(post.id.toString())}
              >
                {loadingStates[post.id.toString()] ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}

        {filteredPosts.length === 0 && searchTerm && (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500">No posts found matching "{searchTerm}"</p>
            <p className="mt-2 text-sm text-gray-400">
              Try searching for author names, nicknames, or tags like "3D", "Animation", "AI".
            </p>
          </div>
        )}
      </div>
      <PostViewer post={selectedPost} onClose={handleCloseViewer} />
    </>
  )
}
