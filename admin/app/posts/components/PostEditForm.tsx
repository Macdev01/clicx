'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Media {
  id: number
  post_id: string
  type: string
  url: string
  cover: string
  duration: number
  createdAt: string
}

interface User {
  ID: number
  email: string
  nickname: string
  balance: number
  avatarUrl: string
  isAdmin: boolean
}

interface Model {
  id: number
  user_id: number
  bio: string
  banner: string
}

interface Post {
  id: string
  text: string
  isPremium: boolean
  published_time: string
  likes_count: number
  user: User
  model: Model
  media: Media[]
  isPurchased: boolean
}

interface PostEditFormProps {
  post: Post
  onSave: (updatedPost: Post) => Promise<void>
  onCancel: () => void
}

export default function PostEditForm({ post, onSave, onCancel }: PostEditFormProps) {
  const [formData, setFormData] = useState<Post>(post)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      await onSave(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Post</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700">
              Text
            </label>
            <textarea
              name="text"
              id="text"
              value={formData.text}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPremium"
              id="isPremium"
              checked={formData.isPremium}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isPremium" className="ml-2 block text-sm text-gray-900">
              Premium Content
            </label>
          </div>

          {formData.media && formData.media.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Media Preview
              </label>
              <div className="mt-2 space-y-2">
                {formData.media.map((media) => (
                  <div key={media.id} className="relative">
                    {media.type === 'video' && (
                      <div className="relative h-40 w-full">
                        <Image
                          src={media.cover}
                          alt="Video cover"
                          fill
                          className="rounded object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                          {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 