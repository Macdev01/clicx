const firstNames = [
  "Randy",
  "Super Bike",
  "Nuri",
  "Johan",
  "Anna",
  "Chris",
  "John",
  "Jane",
  "Alex",
  "Emily",
]
const lastNames = [
  "Beech",
  "Universe",
  "VetDoctor",
  "Granholm",
  "Smith",
  "Rock",
  "Doe",
  "Jones",
  "Williams",
  "Brown",
]

const getRandomName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  return `${firstName} ${lastName}`
}

export interface Story {
  id: string
  userName: string
  userAvatar: string
  storyImage: string
  videoUrl: string
}

export const getStories = async (): Promise<Story[]> => {
  // In the future, this could fetch from an API
  // For now, return hardcoded data based on the screenshot
  return Promise.resolve(
    Array.from({ length: 6 }, (_, i) => ({
      id: (i + 1).toString(),
      userName: getRandomName(),
      userAvatar: `https://picsum.photos/seed/${i}/150/150`,
      storyImage: `https://picsum.photos/seed/${String.fromCharCode(97 + i)}/300/500`,
      videoUrl: `https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4`,
    }))
  )
}
