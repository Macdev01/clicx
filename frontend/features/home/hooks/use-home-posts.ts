import { useEffect, useState } from "react"

import { usePostsQuery } from "@/shared/api"
import { getPosts } from "@/shared/services/posts"
import { type Post } from "@/shared/types/post"
import { useQuery } from "@tanstack/react-query"

import { useAuth } from "@/contexts/auth-context"

export function useHomePosts() {
  const { loading: isAuthLoading } = useAuth()
  const [mockPosts, setMockPosts] = useState<Post[]>([])
  usePostsQuery()

  // Keep the query setup for later use
  const query = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
    enabled: !!isAuthLoading,
  })

  useEffect(() => {
    // Load mock data
    getPosts().then(setMockPosts)
  }, [])

  return {
    posts: mockPosts,
    ...query,
  }
}
