'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import PostEditForm from './components/PostEditForm'
import { postService, type Post } from '@/services/posts'

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const data = await postService.getPosts()
      setPosts(data)
      setLoading(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch posts')
      setLoading(false)
    }
  }

  const handleEdit = (postId: string) => {
    const postToEdit = posts.find(post => post.id === postId)
    if (postToEdit) {
      setEditingPost(postToEdit)
    }
  }

  const handleSaveEdit = async (updatedPost: Post) => {
    try {
      const savedPost = await postService.updatePost(updatedPost.id, {
        text: updatedPost.text,
        isPremium: updatedPost.isPremium,
        media: updatedPost.media?.map(m => ({
          type: m.type,
          url: m.url,
          cover: m.cover,
          duration: m.duration
        }))
      })
      
      const updatedPosts = posts.map(post => 
        post.id === savedPost.id ? savedPost : post
      )
      setPosts(updatedPosts)
      setEditingPost(null)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update post')
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      await postService.deletePost(postId)
      const updatedPosts = posts.filter(post => post.id !== postId)
      setPosts(updatedPosts)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete post')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Posts</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all posts in the system.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add post
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
                      Text
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Author
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Model
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Premium
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Likes
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Media
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Published
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {post.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {post.text.length > 50 ? `${post.text.substring(0, 50)}...` : post.text}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          {post.user.avatarUrl && (
                            <div className="h-8 w-8 flex-shrink-0 mr-3">
                              <Image
                                src={post.user.avatarUrl}
                                alt={`${post.user.name}'s avatar`}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{post.user.name}</div>
                            <div className="text-gray-400">{post.user.nickname}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          {post.model.banner && (
                            <div className="h-8 w-8 flex-shrink-0 mr-3">
                              <Image
                                src={post.model.banner}
                                alt="Model banner"
                                width={32}
                                height={32}
                                className="rounded object-cover"
                              />
                            </div>
                          )}
                          <div className="text-sm">{post.model.bio}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {post.isPremium ? '✓' : '✗'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {post.likes_count}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {post.media && post.media.length > 0 && (
                          <div className="flex items-center">
                            <div className="relative h-8 w-12 mr-2">
                              <Image
                                src={post.media[0].cover}
                                alt="Media preview"
                                fill
                                className="rounded object-cover"
                              />
                            </div>
                            <div className="text-xs text-gray-400">
                              {Math.floor(post.media[0].duration / 60)}:{(post.media[0].duration % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(post.published_time).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(post.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
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

      {editingPost && (
        <PostEditForm
          post={editingPost}
          onSave={handleSaveEdit}
          onCancel={() => setEditingPost(null)}
        />
      )}
    </div>
  )
} 