interface PostLoadingProps {
  authLoading: boolean
  isLoading: boolean
  error: Error | null
  posts: any
}

export function PostsLoading({ authLoading, isLoading, error, posts }: PostLoadingProps) {
  if (authLoading || isLoading) {
    return (
      <div className="container py-12">
        <div className="flex min-h-[200px] items-center justify-center">
          <p>Loading posts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="flex min-h-[200px] items-center justify-center">
          <p>Error loading posts</p>
        </div>
      </div>
    )
  }

  if (!posts?.length) {
    return (
      <div className="container py-12">
        <div className="flex min-h-[200px] items-center justify-center">
          <p>No posts available</p>
        </div>
      </div>
    )
  }

  return null
}
