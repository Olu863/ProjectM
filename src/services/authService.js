/**
 * Authentication Service
 * Handles login, logout, token management, and user session
 */

import { apiClient } from './api.js'

// Local storage keys
const AUTH_TOKEN_KEY = 'accessToken'
const USER_KEY = 'sla_sentinel_user'
const USER_ROLE_KEY = 'sla_sentinel_user_role'

const getTokenRole = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.role || payload.roles?.[0] || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
  } catch {
    return null
  }
}

const normalizeRole = (role) => {
  const normalizedRole = String(role || '').toLowerCase()
  if (normalizedRole === 'client') return 'client'
  if (['operations', 'serviceops', 'service_ops', 'admin', 'administrator'].includes(normalizedRole)) return 'operations'
  return null
}

export const authService = {
  /**
   * Login for Operations team
   */
  async loginOperations(email, password) {
    try {
      const { data } = await apiClient.post('/users/login', {
        email,
        password,
      })
      const role = normalizeRole(data.user?.role || getTokenRole(data.token))

      if (!data.token || !role) {
        throw new Error('Your account role could not be verified. Please contact an administrator.')
      }

      if (role !== 'operations') {
        throw new Error('Client accounts must sign in through the Client Portal.')
      }

      if (data.token) {
        this.setToken(data.token)
        if (data.user) this.setUser(data.user)
        this.setUserRole(role)
        apiClient.setAuthToken(data.token)
      }

      return { success: true, user: data.user ?? null, token: data.token }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  /**
   * Login for Client
   */
  async loginClient(email, password) {
    try {
      const { data } = await apiClient.post('/users/login', {
        email,
        password,
      })
      const role = normalizeRole(data.user?.role || getTokenRole(data.token))

      if (!data.token || !role) {
        throw new Error('Your account role could not be verified. Please contact an administrator.')
      }

      if (data.token) {
        this.setToken(data.token)
        if (data.user) this.setUser(data.user)
        this.setUserRole(role)
        apiClient.setAuthToken(data.token)
      }

      return { success: true, user: data.user ?? null, token: data.token }
    } catch (error) {
      console.error('Client login failed:', error)
      throw error
    }
  },

  /**
   * Register a new user account.
   */
  async register({ name, email, password, role, company, phone }) {
    try {
      const { data } = await apiClient.post('/users/register', {
        name,
        email,
        password,
        role,
        company,
        phone,
      })

      return data
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  },

  /**
   * Logout and clear session
   */
  logout() {
    this.clearToken()
    this.clearUser()
    this.clearUserRole()
    apiClient.setAuthToken(null)
  },

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      const token = this.getToken()
      if (!token) throw new Error('No token to refresh')

      const { data } = await apiClient.post('/auth/refresh', { token })

      if (data.token) {
        this.setToken(data.token)
        apiClient.setAuthToken(data.token)
      }

      return data.token
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.logout()
      throw error
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    return this.getUser()
  },

  getUserRole() {
    return localStorage.getItem(USER_ROLE_KEY)
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken()
  },

  /**
   * Set authentication token
   */
  setToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  },

  /**
   * Get authentication token
   */
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  },

  /**
   * Clear authentication token
   */
  clearToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  },

  /**
   * Set user data
   */
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  /**
   * Get user data
   */
  getUser() {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  /**
   * Clear user data
   */
  clearUser() {
    localStorage.removeItem(USER_KEY)
  },

  setUserRole(role) {
    localStorage.setItem(USER_ROLE_KEY, role)
  },

  clearUserRole() {
    localStorage.removeItem(USER_ROLE_KEY)
  },

  /**
   * Initialize token from storage (on app startup)
   */
  initializeFromStorage() {
    const token = this.getToken()
    if (token) {
      apiClient.setAuthToken(token)
    }
  },
}
