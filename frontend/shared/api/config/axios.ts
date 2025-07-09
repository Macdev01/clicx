import axios from "axios"
import { getAuth } from "firebase/auth"

const API_BASE_URL = process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:8080"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests if available
apiClient.interceptors.request.use(async (config) => {
  try {
    const auth = getAuth()
    const user = auth.currentUser

    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (error) {
    console.error("Error getting auth token:", error)
  }

  return config
})

export default apiClient
