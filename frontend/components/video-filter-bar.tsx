import { type Video } from "@/shared/types/video"

import { Button } from "@/components/ui/button"

interface VideoFilterBarProps {
  videos: Video[]
  selectedType: "all" | "free" | "paid"
  onTypeChange: (type: "all" | "free" | "paid") => void
}

export function VideoFilterBar({ videos, selectedType, onTypeChange }: VideoFilterBarProps) {
  const freeCount = videos.filter((v) => !v.isPaid).length
  const paidCount = videos.filter((v) => v.isPaid).length

  return (
    <div className="mb-12 flex justify-center space-x-4">
      <Button
        variant={selectedType === "all" ? "default" : "outline"}
        onClick={() => onTypeChange("all")}
        className={`px-8 py-2 ${
          selectedType === "all"
            ? "bg-sky-400 text-white hover:bg-sky-500"
            : "border-sky-400 text-sky-400 hover:bg-sky-50"
        }`}
      >
        All ({videos.length})
      </Button>
      <Button
        variant={selectedType === "free" ? "default" : "outline"}
        onClick={() => onTypeChange("free")}
        className={`px-8 py-2 ${
          selectedType === "free"
            ? "bg-sky-400 text-white hover:bg-sky-500"
            : "border-sky-400 text-sky-400 hover:bg-sky-50"
        }`}
      >
        Free ({freeCount})
      </Button>
      <Button
        variant={selectedType === "paid" ? "default" : "outline"}
        onClick={() => onTypeChange("paid")}
        className={`px-8 py-2 ${
          selectedType === "paid"
            ? "bg-sky-400 text-white hover:bg-sky-500"
            : "border-sky-400 text-sky-400 hover:bg-sky-50"
        }`}
      >
        Paid ({paidCount})
      </Button>
    </div>
  )
}
