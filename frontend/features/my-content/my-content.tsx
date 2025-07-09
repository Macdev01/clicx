"use client"

import { useVideoFilter } from "@/shared/hooks/use-video-filter"
import { type Video } from "@/shared/types/video"

import { VideoCard } from "@/components/video-card"
import { VideoFilterBar } from "@/components/video-filter-bar"

interface MyContentProps {
  videos: Video[]
}

export function MyContent({ videos }: MyContentProps) {
  const { selectedType, setSelectedType, filteredVideos, searchTerm } = useVideoFilter(videos)

  return (
    <main className="container px-[1%] py-8">
      <VideoFilterBar videos={videos} selectedType={selectedType} onTypeChange={setSelectedType} />

      <div className="mx-auto grid max-w-6xl gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredVideos.map((video) => (
          <VideoCard key={video.id} video={video} imageHeight="h-32" />
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">
            {searchTerm
              ? "No content found matching your search."
              : "No content found for the selected filter."}
          </p>
          <p className="mt-2 text-sm text-gray-400">
            {searchTerm
              ? "Try adjusting your search terms or filter options."
              : "Upload some content to get started!"}
          </p>
        </div>
      )}
    </main>
  )
}
