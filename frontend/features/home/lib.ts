export function isLoadingOrFaild(
  authLoading: boolean,
  isLoading: boolean,
  error: Error | null,
  posts: any
) {
  if (authLoading || isLoading || error || !posts?.length) {
    return true
  }

  return false
}
