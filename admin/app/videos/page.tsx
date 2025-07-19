'use client'

import { useState, useEffect } from 'react'
import { videoService, type Video } from '@/services/videos'

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const data = await videoService.getVideos()
      setVideos(data)
      setLoading(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch videos')
      setLoading(false)
    }
  }

  const handleEdit = async (videoId: number) => {
    const videoToEdit = videos.find(video => video.id === videoId)
    if (videoToEdit) {
      setEditingVideo(videoToEdit)
      // Implement edit modal/form here
    }
  }

  const handleDelete = async (videoId: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      await videoService.deleteVideo(videoId)
      setVideos(videos.filter(video => video.id !== videoId))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete video')
    }
  }

  const handleUpload = () => {
    // Implement video upload functionality
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Videos</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all videos in the system.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={handleUpload}
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Upload video
          </button>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      ID
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Title
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      User ID
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Model ID
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Duration
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Premium
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Preview
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created At
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {videos.map((video) => (
                    <tr key={video.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {video.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{video.title}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{video.user_id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{video.model_id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {video.isPremium ? '✓' : '✗'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {video.url && (
                          <video className="h-12 w-20 object-cover">
                            <source src={video.url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(video.created_at).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(video.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 