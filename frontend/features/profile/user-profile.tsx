"use client"

import { type Video } from "@/shared/types/video"

import { AccountInfoCard } from "./components/account-info-card"
import { ProfileInfoCard } from "./components/profile-info-card"
import { SupportLegalCard } from "./components/support-legal-card"
import { VideoGrid } from "./components/video-grid"

interface UserProfileProps {
  userVideos: Video[]
}

export function UserProfile({ userVideos }: UserProfileProps) {
  return (
    <div className="bg-background">
      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ProfileInfoCard />
          </div>

          <div className="space-y-6">
            <AccountInfoCard />
            <SupportLegalCard />
          </div>
        </div>

        <VideoGrid videos={userVideos} />
      </main>
    </div>
  )
}
