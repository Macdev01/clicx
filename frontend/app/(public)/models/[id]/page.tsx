import { getModelDetail } from "@/shared/services/models"

import { ModelDetail } from "./components/model-detail"

export default async function ModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const model = await getModelDetail(id)
  return <ModelDetail model={model} />
}
