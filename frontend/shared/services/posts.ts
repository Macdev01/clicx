import { type Post } from "@/shared/types/post"

const sampleVideoUrl =
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4"

export async function getPosts(): Promise<Post[]> {
  // Simulate server-side data fetching
  // In a real app, this would fetch from a database or API
  return [
    {
      id: "1",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      name: "Emma Rodriguez",
      nickname: "@emma_creates",
      timestamp: "2 hours ago",
      video: sampleVideoUrl,
      videoPoster: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
      story:
        "Just finished my latest 3D character design! This one took me weeks to perfect, but I'm so happy with how the lighting and textures turned out. What do you think? 🎨✨",
      likes: 234,
      comments: 45,
      shares: 12,
      tags: ["3D Design", "Character", "Animation", "Blender", "Tutorial"],
    },
    {
      id: "2",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      name: "Alex Chen",
      nickname: "@alextech",
      timestamp: "4 hours ago",
      video: sampleVideoUrl,
      videoPoster:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
      story:
        "New Smart model training complete! This conversational Smart system can now handle complex reasoning tasks and maintain context across long conversations. The future is here! 🤖💡",
      likes: 567,
      comments: 89,
      shares: 34,
      tags: ["AI", "Machine Learning", "ChatBot", "NLP", "Technology"],
    },
    {
      id: "3",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      name: "Sarah Johnson",
      nickname: "@sarahdesigns",
      timestamp: "6 hours ago",
      video: sampleVideoUrl,
      videoPoster:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
      story:
        "Behind the scenes of my latest architectural visualization project. Using cutting-edge rendering techniques to bring this modern home design to life! 🏠🎬",
      likes: 189,
      comments: 23,
      shares: 8,
      tags: ["Architecture", "Visualization", "Rendering", "Design", "3D"],
    },
    {
      id: "4",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      name: "Marcus Williams",
      nickname: "@marcus_vfx",
      timestamp: "8 hours ago",
      video: sampleVideoUrl,
      videoPoster:
        "https://images.unsplash.com/photo-1518709268805-bf87f6fdd49e?w=600&h=400&fit=crop",
      story:
        "VFX breakdown of my latest sci-fi short film! Spent countless hours perfecting these particle effects and lighting. The magic happens in the details ✨🎥",
      likes: 445,
      comments: 67,
      shares: 28,
      tags: ["VFX", "Film", "Particles", "Lighting", "Sci-Fi"],
    },
    {
      id: "5",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      name: "Luna Park",
      nickname: "@luna_animator",
      timestamp: "12 hours ago",
      video: sampleVideoUrl,
      videoPoster:
        "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=600&h=400&fit=crop",
      story:
        "Character animation study - exploring different walk cycles and personality through movement. Animation is all about bringing life to static models! 🚶‍♀️💫",
      likes: 312,
      comments: 41,
      shares: 19,
      tags: ["Animation", "Character", "Walk Cycle", "Movement", "Study"],
    },
  ]
}
