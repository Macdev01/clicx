"use client"

import NextLink from "next/link"

import { type Model } from "@/shared/types/model"
import { Check, Heart, Link } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

import { useShareModel } from "./hooks"

interface ModelCardProps {
  model: Model
}

export function ModelCard({ model }: ModelCardProps) {
  const { handleShareLink } = useShareModel()

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="p-4">
        {/* Author Info Section */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-sky-100">
              <AvatarImage
                src={model.avatar || "/placeholder.svg"}
                alt={model.authorName}
                crossOrigin="anonymous"
              />
              <AvatarFallback className="bg-sky-50 text-sky-600">
                {model.authorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-1">
                <h4 className="text-sm font-semibold text-gray-900">{model.authorName}</h4>
                {model.isVerified && (
                  <div className="rounded-full bg-green-500 p-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">{model.authorNick}</p>
            </div>
          </div>
        </div>

        {/* Online Status */}
        <div className="mb-3 flex items-center space-x-2">
          <div
            className={`h-2 w-2 rounded-full ${model.isOnline ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span className="text-xs text-gray-500">{model.isOnline ? "Online" : "Offline"}</span>
        </div>

        {/* Model Info */}
        <CardTitle className="mb-2 text-base">{model.name}</CardTitle>
        <CardDescription className="mb-4 text-sm">{model.description}</CardDescription>

        {/* Like Section */}
        <div className="mb-4 flex items-center space-x-2">
          <button className="flex items-center space-x-1 text-gray-500 transition-colors hover:text-red-500">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">{model.likes}</span>
          </button>
        </div>

        {/* Bottom Section with Button and Share Link */}
        <div className="flex items-center justify-between">
          <Button asChild className="bg-sky-400 text-white hover:bg-sky-500">
            <NextLink href={`/models/${model.id}`}>View Details</NextLink>
          </Button>
          <button
            className="flex items-center space-x-2 text-gray-500 transition-colors hover:text-sky-500"
            onClick={handleShareLink}
          >
            <Link className="h-5 w-5" />
            <span className="text-sm font-medium">Share Link</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
