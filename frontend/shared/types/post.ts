export interface Post {
  id: string
  name: string
  nickname: string
  tags: string[]
  avatar: string
  timestamp: string
  video?: string
  videoPoster: string
  likes: number
  comments: number
  shares: number
  story: string
}

export type PostsResponse = Post[]
