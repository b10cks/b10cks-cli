import credentials from './utils/credentials'
import {
  BlockListResponse,
  LoginPayload,
  TokenResponse
} from './types'
import fs from 'fs'
import path from 'path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'

const DOMAIN = process.env.B10CKS_API_DOMAIN || 'https://api.b10cks.com'
const __dirname = dirname(fileURLToPath(import.meta.url))

interface ApiError extends Error {
  status?: number;
  errors?: Record<string, string[]>;
}

class API {
  private headers: Record<string, string>

  constructor() {
    this.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': `b10cks-cli/${this.getVersion()}`
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
      'Authorization': `Bearer ${this.getToken()}`
    }
  }

  private async handleResponse<T>(response: Response, type?: string, key?: string, asBuffer?: boolean): Promise<any> {
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
        case 422:
          const errorData = await response.json()
          if (errorData.errors) {
            error.errors = errorData.errors
            error.message = Object.entries(errorData.errors)
              .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
              .join(', ')
          }
          break
        default:
          error.message = (await response.json()).error || response.statusText
      }

      throw error
    }

    return asBuffer ? Buffer.from(await response.arrayBuffer()) : response.json();
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}, type?: string, key?: string): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: options.headers || this.getAuthHeaders()
    })
    return this.handleResponse<T>(response, type, key)
  }

  async login(input: LoginPayload): Promise<TokenResponse> {
    return this.makeRequest<TokenResponse>(`${DOMAIN}/auth/v1/token`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(input)
    })
  }

  async logout(): Promise<boolean> {
    try {
      await this.makeRequest(`${DOMAIN}/auth/v1/token`, {
        method: 'POST',
        body: JSON.stringify({ _method: 'DELETE' })
      })
      return true
    } catch (error: any) {
      console.error(chalk.red('✖'), error.message)
      return false
    }
  }

  async getBlocks(space: string): Promise<BlockListResponse> {
    return this.makeRequest<BlockListResponse>(`${DOMAIN}/mgmt/v1/spaces/${space}/blocks`)
  }
}

export default API