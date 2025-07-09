import { MyContent } from "@/features/my-content"
import { getMyVideos } from "@/shared/services/videos"

export default async function MyContentPage() {
  const videos = await getMyVideos()

  return <MyContent videos={videos} />
}
