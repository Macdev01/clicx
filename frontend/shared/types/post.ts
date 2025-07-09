export interface Post {
  id: number
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
