import { type Model, type ModelDetail } from "@/shared/types/model"

export async function getModels(): Promise<Model[]> {
  // Simulate server-side data fetching
  // In a real app, this would fetch from a database or API
  return [
    {
      id: "1",
      name: "Model Eva",
      description: "A powerful conversational Smart model trained on diverse datasets",
      image: "/placeholder.svg?height=200&width=300",
      downloads: 1234,
      rating: 4.8,
      views: 5678,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      authorName: "Emma Rodriguez",
      authorNick: "@emma_creates",
      isVerified: true,
      isOnline: true,
      likes: 234,
    },
    {
      id: "2",
      name: "3D Character Model",
      description: "High-quality 3D character suitable for games and animations",
      image: "/placeholder.svg?height=200&width=300",
      downloads: 892,
      rating: 4.6,
      views: 3421,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      authorName: "Alex Chen",
      authorNick: "@alextech",
      isVerified: false,
      isOnline: false,
      likes: 156,
    },
    {
      id: "3",
      name: "Image Generator Pro",
      description: "State-of-the-art image generation model with fine-tuned controls",
      image: "/placeholder.svg?height=200&width=300",
      downloads: 2156,
      rating: 4.9,
      views: 8765,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      authorName: "Sarah Johnson",
      authorNick: "@sarahdesigns",
      isVerified: true,
      isOnline: true,
      likes: 567,
    },
    {
      id: "4",
      name: "Text Analyzer",
      description: "Advanced natural language processing model for text analysis",
      image: "/placeholder.svg?height=200&width=300",
      downloads: 567,
      rating: 4.5,
      views: 2134,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      authorName: "Marcus Williams",
      authorNick: "@marcus_vfx",
      isVerified: true,
      isOnline: false,
      likes: 89,
    },
    {
      id: "5",
      name: "Voice Synthesizer",
      description: "High-quality text-to-speech model with multiple voice options",
      image: "/placeholder.svg?height=200&width=300",
      downloads: 1789,
      rating: 4.7,
      views: 4567,
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      authorName: "Luna Park",
      authorNick: "@luna_animator",
      isVerified: false,
      isOnline: true,
      likes: 312,
    },
    {
      id: "6",
      name: "Code Assistant",
      description: "Smart-powered coding assistant for multiple programming languages",
      image: "/placeholder.svg?height=200&width=300",
      downloads: 3421,
      rating: 4.8,
      views: 9876,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      authorName: "David Kim",
      authorNick: "@davidcodes",
      isVerified: true,
      isOnline: true,
      likes: 445,
    },
  ]
}

export async function getModelDetail(id: string): Promise<ModelDetail> {
  // Simulate server-side data fetching
  // In a real app, this would fetch from a database or API
  const models: Record<string, ModelDetail> = {
    "1": {
      id: "1",
      name: "Model Eva",
      description:
        "A powerful conversational Smart model trained on diverse datasets with advanced reasoning capabilities.",
      longDescription:
        "This state-of-the-art Smart assistant model has been trained on a comprehensive dataset spanning multiple domains including science, technology, literature, and general knowledge. It features advanced reasoning capabilities, contextual understanding, and can assist with a wide variety of tasks from creative writing to technical problem-solving.",
      image: "/placeholder.svg?height=400&width=600",
      downloads: 1234,
      rating: 4.8,
      views: 5678,
      author: "Smart Research Lab",
      version: "2.1.0",
      size: "3.2 GB",
      tags: ["Smart", "Conversational", "Assistant", "NLP"],
      license: "MIT",
      createdAt: "2024-01-15",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      authorName: "Emma Rodriguez",
      authorNick: "@emma_creates",
      text: "Hey everyone! 👋 I'm excited to share my latest Smart model with you all. This conversational assistant has been my passion project for months, and I've fine-tuned it to handle complex reasoning tasks while maintaining natural, engaging conversations. Whether you need help with creative writing, technical problem-solving, or just want to chat about science and technology, this model is designed to be your perfect digital companion. I'd love to hear your feedback and see how you use it in your projects! The development process was incredibly challenging but rewarding. I spent countless hours training and refining the model, testing different approaches, and optimizing performance. The result is something I'm truly proud of and I hope it will be useful for the community. 🤖✨",
      videos: [
        {
          id: 1,
          title: "Introduction to Model Eva",
          thumbnail:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
          duration: "5:23",
          isPaid: false,
          views: 1234,
          tags: ["AI", "Tutorial", "Beginner"],
        },
        {
          id: 2,
          title: "Advanced Features Demo",
          thumbnail:
            "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop",
          duration: "8:45",
          isPaid: true,
          views: 856,
          tags: ["AI", "Advanced", "Demo", "Features"],
        },
      ],
    },
  }

  const model = models[id]
  if (!model) {
    const fallbackModel = models["1"]
    if (!fallbackModel) {
      throw new Error("No models available")
    }
    return fallbackModel
  }
  return model
}
