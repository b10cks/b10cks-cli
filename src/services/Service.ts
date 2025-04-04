import { LoginPayload } from '../types'
import credentials from '../utils/credentials'
import BaseService from './BaseService'

export default class Service extends BaseService{
  async login(input: LoginPayload) {
    const data = await this.api.login(input)
    credentials.set({
      login: input.email,
      password: data.access_token
    })

    return true
  }

  async logout() {
    await this.api.logout()
    credentials.clear()
  }
}