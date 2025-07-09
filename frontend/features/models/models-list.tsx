"use client"

import { type Model } from "@/shared/types/model"

import { useModels } from "./hooks"
import { ModelCard } from "./model-card"

interface ModelsListProps {
  models: Model[]
}

export function ModelsList({ models }: ModelsListProps) {
  const { filteredModels } = useModels(models)

  return (
    <main className="px-[1%] py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Explore Models</h1>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </div>
    </main>
  )
}
