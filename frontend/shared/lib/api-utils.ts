import { API_CONSTANTS, ERROR_MESSAGES, HTTP_STATUS } from "./constants"

// ==============================================================================
// Types
// ==============================================================================

export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
  details?: Record<string, any>
}

export interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  body?: BodyInit | null
}

// ==============================================================================
// HTTP Client Class
// ==============================================================================

export class HttpClient {
  private baseURL: string
  private defaultConfig: RequestConfig

  constructor(baseURL = API_CONSTANTS.BASE_URL) {
    this.baseURL = baseURL
    this.defaultConfig = {
      timeout: API_CONSTANTS.TIMEOUT,
      retries: API_CONSTANTS.RETRY_ATTEMPTS,
      retryDelay: API_CONSTANTS.RETRY_DELAY,
      headers: {
        "Content-Type": "application/json",
      },
    }
  }

  protected async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const mergedConfig = { ...this.defaultConfig, ...config }

    // Add auth token if available
    const authToken = await this.getAuthToken()
    if (authToken) {
      mergedConfig.headers = {
        ...mergedConfig.headers,
        Authorization: `Bearer ${authToken}`,
      }
    }

    let lastError: Error
    const maxRetries = mergedConfig.retries || 0

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), mergedConfig.timeout)

        const response = await fetch(url, {
          ...mergedConfig,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw await this.handleErrorResponse(response)
        }

        const data = await response.json()
        return this.transformResponse<T>(data)
      } catch (error) {
        lastError = error as Error

        // Don't retry on certain errors
        if (this.shouldNotRetry(error as Error) || attempt === maxRetries) {
          throw this.transformError(lastError)
        }

        // Wait before retrying
        await this.delay(mergedConfig.retryDelay || 1000)
      }
    }

    throw this.transformError(lastError!)
  }

  private async getAuthToken(): Promise<string | null> {
    // In a real app, this would get the token from localStorage, cookies, or Firebase
    if (typeof window !== "undefined") {
      try {
        // Try to get Firebase auth token
        const { getAuth } = await import("firebase/auth")
        const auth = getAuth()
        const user = auth.currentUser

        if (user) {
          return await user.getIdToken()
        }
      } catch (error) {
        console.warn("Failed to get auth token:", error)
      }
    }

    return null
  }

  private async handleErrorResponse(response: Response): Promise<ApiError> {
    try {
      const errorData = await response.json()
      return {
        error: errorData.error || "API Error",
        message: errorData.message || ERROR_MESSAGES.GENERIC,
        statusCode: response.status,
        details: errorData.details,
      }
    } catch {
      return {
        error: "HTTP Error",
        message: this.getStatusMessage(response.status),
        statusCode: response.status,
      }
    }
  }

  private transformResponse<T>(data: any): ApiResponse<T> {
    // Handle different response formats
    if (data && typeof data === "object") {
      // If response already has the expected format
      if ("success" in data && "data" in data) {
        return data as ApiResponse<T>
      }

      // If response is just the data
      return {
        data: data as T,
        success: true,
      }
    }

    // Fallback for primitive responses
    return {
      data: data as T,
      success: true,
    }
  }

  private transformError(error: Error): ApiError {
    if (error.name === "AbortError") {
      return {
        error: "Timeout",
        message: "Request timed out. Please try again.",
        statusCode: 408,
      }
    }

    if (this.isApiError(error)) {
      return error as ApiError
    }

    return {
      error: "Network Error",
      message: ERROR_MESSAGES.NETWORK,
      statusCode: 0,
    }
  }

  private isApiError(error: any): error is ApiError {
    return (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      "message" in error &&
      "error" in error
    )
  }

  private shouldNotRetry(error: Error): boolean {
    if (this.isApiError(error)) {
      const statusCode = error.statusCode
      // Don't retry on client errors (4xx) except for some specific cases
      return statusCode >= 400 && statusCode < 500 && statusCode !== 408 && statusCode !== 429
    }
    return false
  }

  private getStatusMessage(status: number): string {
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.UNAUTHORIZED
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.FORBIDDEN
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        return ERROR_MESSAGES.VALIDATION
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.SERVER
      default:
        return ERROR_MESSAGES.GENERIC
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Public HTTP methods
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "GET" })
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : null,
    })
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : null,
    })
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : null,
    })
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" })
  }

  // File upload method
  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const uploadConfig = { ...config }
    // Remove Content-Type header to let browser set it with boundary
    const headers = { ...(uploadConfig.headers as Record<string, string>) }
    delete headers["Content-Type"]
    uploadConfig.headers = headers

    return this.request<T>(endpoint, {
      ...uploadConfig,
      method: "POST",
      body: formData,
    })
  }
}

// ==============================================================================
// Default HTTP Client Instance
// ==============================================================================

export const httpClient = new HttpClient()

// ==============================================================================
// Utility Functions
// ==============================================================================

export function isApiError(error: any): error is ApiError {
  return (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    "message" in error &&
    "error" in error
  )
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return ERROR_MESSAGES.GENERIC
}

export function isNetworkError(error: unknown): boolean {
  return isApiError(error) && error.statusCode === 0
}

export function isAuthError(error: unknown): boolean {
  return isApiError(error) && (error.statusCode === 401 || error.statusCode === 403)
}

export function isServerError(error: unknown): boolean {
  return isApiError(error) && error.statusCode >= 500
}

export function isClientError(error: unknown): boolean {
  return isApiError(error) && error.statusCode >= 400 && error.statusCode < 500
}

// ==============================================================================
// Request/Response Interceptors
// ==============================================================================

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
export type ResponseInterceptor<T> = (
  response: ApiResponse<T>
) => ApiResponse<T> | Promise<ApiResponse<T>>
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor<any>[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor)
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor)
      if (index > -1) {
        this.requestInterceptors.splice(index, 1)
      }
    }
  }

  addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>) {
    this.responseInterceptors.push(interceptor)
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor)
      if (index > -1) {
        this.responseInterceptors.splice(index, 1)
      }
    }
  }

  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor)
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor)
      if (index > -1) {
        this.errorInterceptors.splice(index, 1)
      }
    }
  }

  async processRequest(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig)
    }
    return processedConfig
  }

  async processResponse<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let processedResponse = response
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse)
    }
    return processedResponse
  }

  async processError(error: ApiError): Promise<ApiError> {
    let processedError = error
    for (const interceptor of this.errorInterceptors) {
      processedError = await interceptor(processedError)
    }
    return processedError
  }
}

// ==============================================================================
// Enhanced HTTP Client with Interceptors
// ==============================================================================

export class EnhancedHttpClient extends HttpClient {
  public interceptors = new InterceptorManager()

  protected override async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const processedConfig = await this.interceptors.processRequest(config)
      const response = await super.request<T>(endpoint, processedConfig)
      return await this.interceptors.processResponse(response)
    } catch (error) {
      const processedError = await this.interceptors.processError(error as ApiError)
      throw processedError
    }
  }
}

// ==============================================================================
// Exports
// ==============================================================================

export const enhancedHttpClient = new EnhancedHttpClient()

// Add common interceptors
enhancedHttpClient.interceptors.addRequestInterceptor((config) => {
  // Add common request headers or processing
  return config
})

enhancedHttpClient.interceptors.addErrorInterceptor((error) => {
  // Log errors in development
  if (process.env['NODE_ENV'] === "development") {
    console.error("API Error:", error)
  }

  // Handle auth errors globally
  if (isAuthError(error)) {
    // Redirect to login or trigger auth refresh
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth-error", { detail: error }))
    }
  }

  return error
})
