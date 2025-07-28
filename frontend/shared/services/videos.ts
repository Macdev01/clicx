import { type Video } from "@/shared/types/video"

export async function getUserVideos(): Promise<Video[]> {
  // Simulate server-side data fetching
  // In a real app, this would fetch from a database or API
  return [
    {
      id: "1",
      title: "My First 3D Character Design",
      thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
      duration: "5:23",
      isPaid: false,
      views: 1234,
      author: "John Doe",
      tags: ["3D", "Character", "Design"],
    },
    {
      id: "2",
      title: "Advanced Modeling Techniques",
      thumbnail:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop",
      duration: "8:45",
      isPaid: true,
      views: 856,
      author: "John Doe",
      tags: ["Modeling", "Advanced", "Techniques"],
    },
    {
      id: "3",
      title: "Beginner's Guide to Animation",
      thumbnail:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=200&fit=crop",
      duration: "12:10",
      isPaid: false,
      views: 2341,
      author: "John Doe",
      tags: ["Animation", "Beginner", "Guide"],
    },
    {
      id: "4",
      title: "Professional Workflow Tips",
      thumbnail:
        "https://images.unsplash.com/photo-1518709268805-bf87f6fdd49e?w=300&h=200&fit=crop",
      duration: "15:30",
      isPaid: true,
      views: 567,
      author: "John Doe",
      tags: ["Workflow", "Professional", "Tips"],
    },
    {
      id: "5",
      title: "Creative Process Behind the Scenes",
      thumbnail:
        "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=300&h=200&fit=crop",
      duration: "7:22",
      isPaid: false,
      views: 1890,
      author: "John Doe",
      tags: ["Creative", "Process", "BTS"],
    },
    {
      id: "6",
      title: "Exclusive Masterclass Series",
      thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
      duration: "25:15",
      isPaid: true,
      views: 423,
      author: "John Doe",
      tags: ["Masterclass", "Exclusive", "Series"],
    },
    {
      id: "7",
      title: "Quick Tips and Tricks",
      thumbnail:
        "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=300&h=200&fit=crop",
      duration: "3:45",
      isPaid: false,
      views: 987,
      author: "John Doe",
      tags: ["Tips", "Tricks", "Quick"],
    },
    {
      id: "8",
      title: "Premium Content Deep Dive",
      thumbnail:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=200&fit=crop",
      duration: "18:42",
      isPaid: true,
      views: 654,
      author: "John Doe",
      tags: ["Premium", "Deep Dive", "Content"],
    },
  ]
}

export async function getMyVideos(): Promise<Video[]> {
  // Simulate server-side data fetching
  // In a real app, this would fetch from a database or API
  return [
    {
      id: "1",
      title: "Introduction to Model Eva",
      thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
      duration: "5:23",
      isPaid: false,
      views: 1234,
      author: "Emma Rodriguez",
      tags: ["AI", "Tutorial", "Beginner"],
    },
    {
      id: "2",
      title: "Advanced Features Demo",
      thumbnail:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop",
      duration: "8:45",
      isPaid: true,
      views: 856,
      author: "Alex Chen",
      tags: ["AI", "Advanced", "Demo", "Features"],
    },
    {
      id: "3",
      title: "Getting Started Tutorial",
      thumbnail:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=200&fit=crop",
      duration: "12:10",
      isPaid: false,
      views: 2341,
      author: "Sarah Johnson",
      tags: ["Tutorial", "Beginner", "Setup"],
    },
    {
      id: "4",
      title: "Pro Tips & Tricks",
      thumbnail:
        "https://images.unsplash.com/photo-1518709268805-bf87f6fdd49e?w=300&h=200&fit=crop",
      duration: "15:30",
      isPaid: true,
      views: 567,
      author: "Marcus Williams",
      tags: ["Pro", "Tips", "Advanced", "Workflow"],
    },
    {
      id: "5",
      title: "Community Showcase",
      thumbnail:
        "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=300&h=200&fit=crop",
      duration: "7:22",
      isPaid: false,
      views: 1890,
      author: "Luna Park",
      tags: ["Community", "Showcase", "Examples"],
    },
    {
      id: "6",
      title: "Exclusive Masterclass",
      thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
      duration: "25:15",
      isPaid: true,
      views: 423,
      author: "David Kim",
      tags: ["Masterclass", "Exclusive", "Advanced"],
    },
    {
      id: "7",
      title: "Creative Workflow Tips",
      thumbnail:
        "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=300&h=200&fit=crop",
      duration: "9:33",
      isPaid: false,
      views: 1567,
      author: "Emma Rodriguez",
      tags: ["Workflow", "Creative", "Tips"],
    },
    {
      id: "8",
      title: "Premium Content Deep Dive",
      thumbnail:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=200&fit=crop",
      duration: "18:42",
      isPaid: true,
      views: 789,
      author: "Alex Chen",
      tags: ["Premium", "Deep Dive", "Advanced"],
    },
  ]
}
