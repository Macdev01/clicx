export interface Model {
  id: string
  name: string
  description: string
  image: string
  downloads: number
  rating: number
  views: number
  avatar: string
  authorName: string
  authorNick: string
  isVerified: boolean
  isOnline: boolean
  likes: number
}

export interface ModelVideo {
  id: number
  title: string
  thumbnail: string
  duration: string
  isPaid: boolean
  views: number
  tags: string[]
}

export interface ModelDetail {
  id: string
  name: string
  description: string
  longDescription: string
  image: string
  downloads: number
  rating: number
  views: number
  author: string
  version: string
  size: string
  tags: string[]
  license: string
  createdAt: string
  avatar: string
  authorName: string
  authorNick: string
  text: string
  videos: ModelVideo[]
}
