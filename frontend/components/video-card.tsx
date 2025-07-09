import { type Video } from "@/shared/types/video"
import { Download, Lock, Play } from "lucide-react"

interface VideoCardProps {
  video: Video
  showDownload?: boolean
  imageHeight?: string
  onVideoClick?: (video: Video) => void
}

export function VideoCard({
  video,
  showDownload = false,
  imageHeight = "h-32",
  onVideoClick,
}: VideoCardProps) {
  const handleClick = () => {
    onVideoClick?.(video)
  }

  return (
    <div
      className="relative cursor-pointer overflow-hidden rounded-lg bg-sky-50 transition-shadow hover:shadow-md"
      onClick={handleClick}
    >
      <div className="relative">
        <img
          src={video.thumbnail || "/placeholder.svg"}
          alt={video.title}
          className={`${imageHeight} w-full object-cover ${video.isPaid ? "blur-sm" : ""}`}
          crossOrigin="anonymous"
        />

        {/* Play/Lock button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-sky-400 p-3 shadow-lg transition-colors hover:bg-sky-500">
            {video.isPaid ? (
              <Lock className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 fill-white text-white" />
            )}
          </div>
        </div>

        {/* Duration */}
        <div className="absolute right-2 top-2 rounded bg-black bg-opacity-75 px-2 py-1 text-xs text-white">
          {video.duration}
        </div>

        {/* Paid badge */}
        {video.isPaid && (
          <div className="absolute left-2 top-2 rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
            PAID
          </div>
        )}

        {/* Download button */}
        {showDownload && !video.isPaid && (
          <button
            className="absolute bottom-2 right-2 rounded-full bg-sky-400 p-2 shadow-lg transition-colors hover:bg-sky-500"
            onClick={(e) => {
              e.stopPropagation()
              // Handle download logic here
            }}
          >
            <Download className="h-4 w-4 text-white" />
          </button>
        )}
      </div>

      {/* Video info (optional) */}
      <div className="p-3">
        <h4 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900">{video.title}</h4>
        <p className="mb-1 text-xs text-gray-500">by {video.author}</p>
        <p className="text-xs text-gray-500">{video.views.toLocaleString()} views</p>
      </div>
    </div>
  )
}
