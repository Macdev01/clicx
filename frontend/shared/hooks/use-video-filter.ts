import { useMemo, useState } from "react"

import { type Video } from "@/shared/types/video"

import { useSearch } from "@/contexts/search-context"

export function useVideoFilter(videos: Video[]) {
  const [selectedType, setSelectedType] = useState<"all" | "free" | "paid">("all")
  const { searchTerm } = useSearch()

  const filteredVideos = useMemo(() => {
    let filtered = videos.filter((video) => {
      if (selectedType === "all") return true
      if (selectedType === "free") return !video.isPaid
      if (selectedType === "paid") return video.isPaid
      return true
    })

    // Apply search filter (author name and tags)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (video) =>
          video.author.toLowerCase().includes(searchLower) ||
          video.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }, [videos, selectedType, searchTerm])

  return {
    selectedType,
    setSelectedType,
    filteredVideos,
    searchTerm,
  }
}
