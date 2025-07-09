"use client"

import { useEffect, useState } from "react"

interface BuildMeta {
  gitHash: string
  gitBranch: string
  buildTime: string
}

export function BuildInfo() {
  const [buildMeta, setBuildMeta] = useState<BuildMeta | null>(null)

  useEffect(() => {
    fetch("/build-meta.json")
      .then((res) => res.json())
      .then((data) => setBuildMeta(data))
      .catch(console.error)
  }, [])

  if (!buildMeta) return null

  return (
    <div className="text-xs text-muted-foreground">
      <span title={`Full hash: ${buildMeta.gitHash}`}>
        {buildMeta.gitBranch}@{buildMeta.gitHash.substring(0, 7)}
      </span>
      <span className="mx-1">•</span>
      <span title={buildMeta.buildTime}>
        Built on {new Date(buildMeta.buildTime).toLocaleDateString()}
      </span>
    </div>
  )
}
