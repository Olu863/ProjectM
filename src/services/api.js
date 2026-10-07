/**
 * Base API Client
 * Provides standardized HTTP methods with error handling, request/response interceptors,
 * and support for authentication tokens.
 * 
 * Configuration via environment variables:
 * - VITE_API_URL: Backend API base URL
 * - VITE_API_TIMEOUT: Request timeout in milliseconds
 * - VITE_LOG_REQUESTS: Enable request logging (true/false)
 */

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL || import.meta.env.VITE_API_URL || 'https://localhost:7008/api'
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10)
    this.logRequests = import.meta.env.VITE_LOG_REQUESTS === 'true'
  }

  /**
   * Set authentication token for subsequent requests
   */
  setAuthToken(token) {
    this.authToken = token
    if (token) {
      this.defaultHeaders.Authorization = `Bearer ${token}`
    } else {
      delete this.defaultHeaders.Authorization
    }
  }

  /**
   * Make HTTP request with standardized error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const fetchOptions = {
      method: options.method || 'GET',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    }

    // Remove headers and method from body
    delete fetchOptions.headers
    if (fetchOptions.method === 'GET' || fetchOptions.method === 'HEAD') {
      delete fetchOptions.body
    }

    if (this.logRequests) {
      console.log(`[API] ${fetchOptions.method} ${url}`)
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (this.logRequests) {
          console.error(`[API] ${response.status} Error:`, errorData)
        }
        throw new APIError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData,
        )
      }

      const data = await response.json().catch(() => null)
      if (this.logRequests) {
        console.log(`[API] ${response.status} Success`)
      }
      return { data, status: response.status, ok: true }
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      if (error.name === 'AbortError') {
        const timeoutError = new APIError(
          `Request timeout after ${this.timeout}ms`,
          0,
          { originalError: error }
        )
        if (this.logRequests) {
          console.error(`[API] Timeout:`, error.message)
        }
        throw timeoutError
      }
      if (this.logRequests) {
        console.error(`[API] Network Error:`, error.message)
      }
      throw new APIError(error.message || 'Network error', 0, { originalError: error })
    }
  }

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  post(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  put(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  patch(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}

/**
 * Custom API Error class for consistent error handling
 */
class APIError extends Error {
  constructor(message, status = 0, data = {}) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
  }
}

// Export singleton instance
export const apiClient = new APIClient()
export { APIError }
