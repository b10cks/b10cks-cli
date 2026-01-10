import fs from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import path from 'path'
import type { BlockListResponse, LoginPayload, TokenResponse } from './types'
import credentials from './utils/credentials'

const DOMAIN = process.env.B10CKS_API_DOMAIN || 'https://api.b10cks.com'
const __dirname = dirname(fileURLToPath(import.meta.url))

interface ApiError extends Error {
  status?: number
  errors?: Record<string, string[]>
}

class API {
  private headers: Record<string, string>
  private isRefreshing: boolean = false
  private refreshPromise: Promise<TokenResponse> | null = null

  constructor() {
    this.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': `b10cks-cli/${this.getVersion()}`,
    }
  }

  private getVersion(): string {
    const rawPkg = fs.readFileSync(path.join(__dirname, '../package.json'))
    const pkg = JSON.parse(rawPkg.toString())

    return pkg.version
  }

  private getToken(): string {
    const creds = credentials.get()
    if (!creds?.password) {
      throw new Error('Not logged in. Please login first.')
    }
    return creds.password
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      ...this.headers,
      Authorization: `Bearer ${this.getToken()}`,
    }
  }

  /**
   * Ensure token is valid, refreshing if necessary
   */
  private async ensureValidToken(): Promise<void> {
    if (!credentials.isTokenExpired()) {
      return
    }

    // If already refreshing, wait for that to complete
    if (this.isRefreshing && this.refreshPromise) {
      await this.refreshPromise
      return
    }

    // Start refresh
    this.isRefreshing = true
    try {
      this.refreshPromise = this.performTokenRefresh()
      await this.refreshPromise
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<TokenResponse> {
    const response = await fetch(`${DOMAIN}/auth/v1/token/refresh`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    })

    const data = await this.handleResponse<TokenResponse>(response)

    // Store refreshed token with expiration time
    const creds = credentials.get()
    if (creds) {
      const expiresIn = (data.expires_in || 3600) * 1000 // Convert seconds to milliseconds
      credentials.set({
        ...creds,
        password: data.access_token,
        expiresAt: Date.now() + expiresIn,
      })
    }

    return data
  }

  private async handleResponse<_T>(response: Response, type?: string, key?: string, asBuffer?: boolean): Promise<any> {
    if (!response.ok) {
      const error: ApiError = new Error('API error')
      error.status = response.status

      switch (response.status) {
        case 401:
          error.message = 'Authentication failed. Please check your Login.'
          break
        case 403:
          error.message = 'Access denied. Please check for a valid license.'
          break
        case 404:
          error.message = type && key ? `${type} with key "${key}" not found.` : 'Resource not found.'
          break
        case 422: {
          const errorData = await response.json()
          if (errorData.errors) {
            error.errors = errorData.errors
            error.message = Object.entries(errorData.errors)
              .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
              .join(', ')
          }
          break
        }
        default:
          error.message = (await response.json()).error || response.statusText
      }

      throw error
    }

    return asBuffer ? Buffer.from(await response.arrayBuffer()) : response.json()
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}, type?: string, key?: string): Promise<T> {
    // Ensure token is valid before making request
    await this.ensureValidToken()

    const response = await fetch(url, {
      ...options,
      headers: options.headers || this.getAuthHeaders(),
    })

    // If we get a 401, try refreshing token and retrying once
    if (response.status === 401) {
      try {
        await this.performTokenRefresh()
        const retryResponse = await fetch(url, {
          ...options,
          headers: options.headers || this.getAuthHeaders(),
        })
        return this.handleResponse<T>(retryResponse, type, key)
      } catch (_error: any) {
        // If refresh fails, handle the original 401
        return this.handleResponse<T>(response, type, key)
      }
    }

    return this.handleResponse<T>(response, type, key)
  }

  async login(input: LoginPayload): Promise<TokenResponse> {
    const response = await fetch(`${DOMAIN}/auth/v1/token`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(input),
    })
    const data = await this.handleResponse<TokenResponse>(response)

    // Store expiration time when logging in
    const expiresIn = (data.expires_in || 3600) * 1000 // Convert seconds to milliseconds
    credentials.set({
      login: input.email,
      password: data.access_token,
      expiresAt: Date.now() + expiresIn,
    })

    return data
  }

  async refreshToken(): Promise<TokenResponse> {
    return this.performTokenRefresh()
  }

  async logout(): Promise<boolean> {
    try {
      await this.makeRequest(`${DOMAIN}/auth/v1/token`, {
        method: 'POST',
        body: JSON.stringify({ _method: 'DELETE' }),
      })
      return true
    } catch (_error: any) {
      return false
    }
  }

  async getBlocks(space: string): Promise<BlockListResponse> {
    return this.makeRequest<BlockListResponse>(`${DOMAIN}/mgmt/v1/spaces/${space}/blocks?per_page=1000`)
  }
}

export default API
