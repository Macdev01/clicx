"use client"

import { useEffect, useState } from "react"

import { type Story, getStories } from "@/shared/services/stories"

import { StoryViewer } from "./story-viewer"

export function Stories() {
  const [stories, setStories] = useState<Story[]>([])
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)

  useEffect(() => {
    getStories().then(setStories)
  }, [])

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story)
  }

  const handleCloseViewer = () => {
    setSelectedStory(null)
  }

  if (stories.length === 0) {
    return null
  }

  return (
    <>
      <div className="py-6">
        <div className="relative">
          <div className="flex justify-center">
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="relative h-48 w-28 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg shadow-md"
                  onClick={() => handleStoryClick(story)}
                >
                  <img
                    src={story.storyImage}
                    alt={`Story by ${story.userName}`}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute left-2 top-2">
                    <img
                      src={story.userAvatar}
                      alt={story.userName}
                      className="h-10 w-10 rounded-full border-4 border-sky-400 object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <p className="absolute bottom-2 left-2 right-2 truncate text-sm font-semibold text-white">
                    {story.userName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <StoryViewer story={selectedStory} onClose={handleCloseViewer} />
    </>
  )
}
