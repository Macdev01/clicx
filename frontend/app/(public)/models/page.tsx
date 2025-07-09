import { ModelsList } from "@/features/models"
import { getModels } from "@/shared/services/models"

export default async function ModelsPage() {
  const models = await getModels()

  return <ModelsList models={models} />
}
