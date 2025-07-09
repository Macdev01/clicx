import { UserProfile } from "@/features/profile"
import { getUserVideos } from "@/shared/services/videos"

export default async function ProfilePage() {
  const userVideos = await getUserVideos()

  return <UserProfile userVideos={userVideos} />
}
