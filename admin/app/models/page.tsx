'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import ModelEditForm from './components/ModelEditForm'
import { modelService, type Model } from '@/services/models'

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingModel, setEditingModel] = useState<Model | null>(null)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const data = await modelService.getModels()
      setModels(data)
      setLoading(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch models')
      setLoading(false)
    }
  }

  const handleEdit = (modelId: number) => {
    const modelToEdit = models.find(model => model.id === modelId)
    if (modelToEdit) {
      setEditingModel(modelToEdit)
    }
  }

  const handleSaveEdit = async (updatedModel: Model) => {
    try {
      const savedModel = await modelService.updateModel(updatedModel.id, {
        user_id: updatedModel.user_id,
        bio: updatedModel.bio,
        banner: updatedModel.banner
      })
      
      const updatedModels = models.map(model => 
        model.id === savedModel.id ? savedModel : model
      )
      setModels(updatedModels)
      setEditingModel(null)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update model')
    }
  }

  const handleDelete = async (modelId: number) => {
    if (!confirm('Are you sure you want to delete this model?')) return

    try {
      await modelService.deleteModel(modelId)
      const updatedModels = models.filter(model => model.id !== modelId)
      setModels(updatedModels)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete model')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Models</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all models in the system.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add model
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
                      Banner
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Bio
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      User ID
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {models.map((model) => (
                    <tr key={model.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {model.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {model.banner && (
                          <div className="relative h-16 w-24">
                            <Image
                              src={model.banner}
                              alt="Model banner"
                              fill
                              className="rounded object-cover"
                            />
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {model.bio.length > 50 ? `${model.bio.substring(0, 50)}...` : model.bio}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {model.user_id}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(model.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(model.id)}
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

      {editingModel && (
        <ModelEditForm
          model={editingModel}
          onSave={handleSaveEdit}
          onCancel={() => setEditingModel(null)}
        />
      )}
    </div>
  )
} 