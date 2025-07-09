import { useCallback } from "react"

import { useToast } from "@/shared/hooks/use-toast"
import { type Model } from "@/shared/types/model"

export function useShareModel() {
  const { toast } = useToast()

  const handleShareLink = useCallback(() => {
    toast({
      description: "Link copied to clipboard",
      duration: 1000,
    })
  }, [toast])

  return { handleShareLink }
}

export function useModels(models: Model[]) {
  // For now just return the models as is
  // In the future, we can add filtering, sorting, etc.
  return {
    filteredModels: models,
  }
}
