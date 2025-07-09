"use client"

import { type Story } from "@/shared/services/stories"
import { X } from "lucide-react"

import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface StoryViewerProps {
  story: Story | null
  onClose: () => void
}

export function StoryViewer({ story, onClose }: StoryViewerProps) {
  if (!story) {
    return null
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="h-screen w-screen max-w-full p-0">
        <DialogTitle className="sr-only">{story.userName}'s story</DialogTitle>
        <div className="relative h-full w-full">
          <video src={story.videoUrl} className="h-full w-full object-contain" controls autoPlay />
          <div className="absolute left-4 top-4 flex items-center space-x-2">
            <img
              src={story.userAvatar}
              alt={story.userName}
              className="h-10 w-10 rounded-full border-2 border-white"
            />
            <span className="font-semibold text-white">{story.userName}</span>
          </div>
          <DialogClose className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/75">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
