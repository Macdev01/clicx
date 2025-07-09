"use client"

import { Posts } from "@/components/content/posts"
import { Stories } from "@/components/content/stories"

import { useAuth } from "@/contexts/auth-context"

import { useHomePosts } from "./hooks/use-home-posts"
import { isLoadingOrFaild } from "./lib"
import { PostsLoading } from "./posts-loading"

export function HomeContent() {
  const { loading: authLoading } = useAuth()
  const { posts, isLoading, error } = useHomePosts()

  if (isLoadingOrFaild(authLoading, isLoading, error, posts)) {
    return (
      <PostsLoading authLoading={authLoading} isLoading={isLoading} error={error} posts={posts} />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Stories />
      <Posts posts={posts} />
    </div>
  )
}
