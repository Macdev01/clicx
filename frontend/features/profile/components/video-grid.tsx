import { useVideoFilter } from "@/shared/hooks/use-video-filter"
import { type Video } from "@/shared/types/video"

import { VideoCard } from "@/components/video-card"
import { VideoFilterBar } from "@/components/video-filter-bar"

interface VideoGridProps {
  videos: Video[]
}

export function VideoGrid({ videos }: VideoGridProps) {
  const { selectedType, setSelectedType, filteredVideos, searchTerm } = useVideoFilter(videos)

  return (
    <div className="mt-8">
      <VideoFilterBar videos={videos} selectedType={selectedType} onTypeChange={setSelectedType} />

      <div className="mx-auto grid max-w-4xl gap-6 pt-4 md:grid-cols-2">
        {filteredVideos.map((video) => (
          <VideoCard key={video.id} video={video} imageHeight="h-48" showDownload />
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">
            {searchTerm
              ? `No ${selectedType} videos found matching "${searchTerm}"`
              : `No ${selectedType} videos found in your content.`}
          </p>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-400">Try searching for a different author name.</p>
          )}
        </div>
      )}
    </div>
  )
}
