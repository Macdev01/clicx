import axios from 'axios'

// Create an axios instance for internal API calls (Next.js API routes)
export const internalApi = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Create an axios instance for external API calls (backend server)
export const externalApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
}) 