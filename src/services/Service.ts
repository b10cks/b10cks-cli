import type { LoginPayload } from '../types'
import credentials from '../utils/credentials'
import BaseService from './BaseService'

export default class Service extends BaseService {
  async login(input: LoginPayload) {
    try {
      const data = await this.api.login(input)
      credentials.set({
        login: input.email,
        password: data.access_token,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      })
      return true
    } catch (error: any) {
      console.error('Login failed:', error.message)
      return false
    }
  }

  async refreshToken() {
    try {
      const data = await this.api.refreshToken()
      const creds = credentials.get()
      if (creds) {
        credentials.set({
          ...creds,
          password: data.access_token,
          expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
        })
      }
      return true
    } catch (error: any) {
      console.error('Token refresh failed:', error.message)
      return false
    }
  }

  async logout() {
    try {
      await this.api.logout()
      credentials.clear()
    } catch (error: any) {
      console.error('Logout failed:', error.message)
      credentials.clear()
    }
  }
}
