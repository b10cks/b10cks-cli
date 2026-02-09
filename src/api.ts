import fs from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import path from 'path'

import type {
  BlockListResponse,
  CreateTeamPayload,
  CreateTeamResponse,
  SpacesResponse,
  TeamsResponse,
} from './types'

import credentials from './utils/credentials'

const DOMAIN = process.env.B10CKS_API_DOMAIN || 'https://api.b10cks.com'
const __dirname = dirname(fileURLToPath(import.meta.url))

interface ApiError extends Error {
  status?: number
  errors?: Record<string, string[]>
}

class API {
  private headers: Record<string, string>

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
      throw new Error('Not authenticated. Please login first.')
    }
    return creds.password
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      ...this.headers,
      Authorization: `Bearer ${this.getToken()}`,
    }
  }

  private async handleResponse<_T>(
    response: Response,
    type?: string,
    key?: string,
    asBuffer?: boolean
  ): Promise<any> {
    if (!response.ok) {
      const error: ApiError = new Error('API error')
      error.status = response.status

      switch (response.status) {
        case 401:
          error.message = 'Authentication failed. Please check your personal access token.'
          break
        case 403:
          error.message = 'Access denied. Please check for a valid license.'
          break
        case 404:
          error.message =
            type && key ? `${type} with key "${key}" not found.` : 'Resource not found.'
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

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    type?: string,
    key?: string
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: options.headers || this.getAuthHeaders(),
    })

    return this.handleResponse<T>(response, type, key)
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${DOMAIN}/mgmt/v1/users/me`, {
        method: 'GET',
        headers: {
          ...this.headers,
          Authorization: `Bearer ${token}`,
        },
      })
      return response.ok
    } catch (_error: any) {
      return false
    }
  }

  async logout(): Promise<boolean> {
    try {
      await this.makeRequest(`${DOMAIN}/auth/v1/logout`, {
        method: 'POST',
      })
      return true
    } catch (_error: any) {
      return false
    }
  }

  async getBlocks(space: string): Promise<BlockListResponse> {
    return this.makeRequest<BlockListResponse>(
      `${DOMAIN}/mgmt/v1/spaces/${space}/blocks?per_page=9999`
    )
  }

  async getSpaces(): Promise<SpacesResponse> {
    return this.makeRequest<SpacesResponse>(`${DOMAIN}/mgmt/v1/spaces`)
  }

  async getTeams(): Promise<TeamsResponse> {
    return this.makeRequest<TeamsResponse>(`${DOMAIN}/mgmt/v1/teams`)
  }

  async createTeam(payload: CreateTeamPayload): Promise<CreateTeamResponse> {
    return this.makeRequest<CreateTeamResponse>(`${DOMAIN}/mgmt/v1/teams`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }
}

export default API
