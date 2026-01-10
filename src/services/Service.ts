import type {
  CreateTeamPayload,
  CreateTeamResponse,
  LoginPayload,
  SpacesResponse,
  Team,
  TeamHierarchyNode,
  TeamsResponse,
} from '../types'
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

  async listSpaces(): Promise<SpacesResponse> {
    return this.api.getSpaces()
  }

  async listTeams(): Promise<TeamsResponse> {
    return this.api.getTeams()
  }

  async buildTeamsHierarchyFromList(): Promise<TeamHierarchyNode | null> {
    const response = await this.listTeams()
    if (!response.data || response.data.length === 0) {
      return null
    }

    // Find root teams (teams with no parent_id or parent_id is null)
    const rootTeams = response.data.filter((team) => !team.parent_id)

    // Build the hierarchy recursively
    const buildNode = (team: Team): TeamHierarchyNode => {
      const children: TeamHierarchyNode[] = []

      // Find all children of this team
      for (const potentialChild of response.data) {
        if (potentialChild.parent_id === team.id) {
          children.push(buildNode(potentialChild))
        }
      }

      return {
        id: team.id,
        name: team.name,
        ...(children.length > 0 && { children }),
      }
    }

    // If there are multiple roots, create a synthetic root
    if (rootTeams.length === 1) {
      return buildNode(rootTeams[0])
    } else if (rootTeams.length > 1) {
      // Create a synthetic root to contain all root teams
      return {
        id: '__root__',
        name: 'Teams',
        children: rootTeams.map(buildNode),
      }
    }

    return null
  }

  async createTeam(payload: CreateTeamPayload): Promise<CreateTeamResponse> {
    return this.api.createTeam(payload)
  }
}
