import type {
  CreateTeamPayload,
  CreateTeamResponse,
  Space,
  SpacesHierarchyNode,
  SpacesResponse,
  Team,
  TeamHierarchyNode,
  TeamsResponse,
} from '../types'

import credentials from '../utils/credentials'
import BaseService from './BaseService'

export default class Service extends BaseService {
  async login(token: string) {
    try {
      const isValid = await this.api.verifyToken(token)
      if (!isValid) {
        console.error('Token verification failed')
        return false
      }

      credentials.set({
        login: 'sanctum',
        password: token,
      })
      return true
    } catch (error: any) {
      console.error('Authentication failed:', error.message)
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

  async buildSpacesHierarchy(): Promise<SpacesHierarchyNode | null> {
    const [teamsResponse, spacesResponse] = await Promise.all([this.listTeams(), this.listSpaces()])

    if (!teamsResponse.data || teamsResponse.data.length === 0) {
      return null
    }

    // Create a map of spaces by team_id (if available) or by global spaces
    const spacesByTeamId = new Map<string, Space[]>()
    const globalSpaces: Space[] = []

    for (const space of spacesResponse.data) {
      // Check if space has team_id field (depends on API structure)
      const teamId = (space as any).team_id
      if (teamId) {
        if (!spacesByTeamId.has(teamId)) {
          spacesByTeamId.set(teamId, [])
        }
        spacesByTeamId.get(teamId)!.push(space)
      } else {
        globalSpaces.push(space)
      }
    }

    // Find root teams
    const rootTeams = teamsResponse.data.filter((team) => !team.parent_id)

    // Build the hierarchy recursively
    const buildNode = (team: Team): SpacesHierarchyNode => {
      const children: SpacesHierarchyNode[] = []

      // Add spaces for this team
      const teamSpaces = spacesByTeamId.get(team.id) || []
      for (const space of teamSpaces) {
        children.push({
          id: space.id,
          name: space.name,
          type: 'space',
          color: space.color,
          icon: space.icon,
        })
      }

      // Add child teams
      for (const potentialChild of teamsResponse.data) {
        if (potentialChild.parent_id === team.id) {
          children.push(buildNode(potentialChild))
        }
      }

      return {
        id: team.id,
        name: team.name,
        type: 'team',
        ...(children.length > 0 && { children }),
      }
    }

    // Build the hierarchy
    let rootNode: SpacesHierarchyNode

    if (rootTeams.length === 1) {
      rootNode = buildNode(rootTeams[0])
    } else {
      // Create a synthetic root to contain all root teams and global spaces
      const children: SpacesHierarchyNode[] = []

      // Add global spaces first
      for (const space of globalSpaces) {
        children.push({
          id: space.id,
          name: space.name,
          type: 'space',
          color: space.color,
          icon: space.icon,
        })
      }

      // Add root teams
      for (const team of rootTeams) {
        children.push(buildNode(team))
      }

      rootNode = {
        id: '__root__',
        name: 'Workspace',
        type: 'team',
        children,
      }
    }

    return rootNode
  }
}
