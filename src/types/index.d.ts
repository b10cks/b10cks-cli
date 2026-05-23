export interface BlockResource {
  id: string
  name: string
  slug: string
  icon: string
  schema: object
  tags: string[]
  description: string
  created_at: string
  updated_at: string
}

export type BlockList = Record<
  string,
  {
    name: string
    tags: string[]
  }
>

export interface BlockListResponse {
  data: BlockResource[]
}

export interface Space {
  id: string
  state: string
  name: string
  color?: string
  icon?: string
  created_at: string
  updated_at: string
}

export interface SpacesResponse {
  data: Space[]
}

export interface Team {
  id: string
  name: string
  parent_id?: string | null
}

export interface TeamsResponse {
  data: Team[]
}

export interface TeamHierarchyNode {
  id: string
  name: string
  children?: TeamHierarchyNode[]
}

export interface TeamHierarchyResponse {
  data: TeamHierarchyNode
}

export interface CreateTeamPayload {
  name: string
  icon?: string
  color?: string
  description?: string
  parent_id?: string | null
}

export interface CreateTeamResponse {
  data: Team
}

export interface CreateDataSourceEntryPayload {
  key: string
  value: string
}

export interface DataSourceEntry {
  id: string
  key: string
  value: string
}

export interface CreateDataSourceEntryResponse {
  data: DataSourceEntry
}

export interface SpacesHierarchyNode {
  id: string
  name: string
  type: 'team' | 'space'
  color?: string
  icon?: string
  children?: SpacesHierarchyNode[]
}

export interface SpacesHierarchyResponse {
  data: SpacesHierarchyNode
}
