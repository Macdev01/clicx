import { useQuery } from "@tanstack/react-query"

import { postsApi } from "./api"

export const postsKeys = {
  all: ["posts"] as const,
  lists: () => [...postsKeys.all, "list"] as const,
  list: (filters: string) => [...postsKeys.lists(), { filters }] as const,
  details: () => [...postsKeys.all, "detail"] as const,
  detail: (id: number) => [...postsKeys.details(), id] as const,
}

export function usePostsQuery() {
  return useQuery({
    queryKey: postsKeys.lists(),
    queryFn: () => postsApi.getPosts(),
  })
}

export function usePostQuery(id: number) {
  return useQuery({
    queryKey: postsKeys.detail(id),
    queryFn: () => postsApi.getPost(id),
  })
}
