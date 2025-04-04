export interface LoginPayload {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface BlockResource {
  id: string
  name: string
  slug: string
  icon: string
  schema: object
  description: string
  created_at: string
  updated_at: string
}

export interface BlockListResponse {
  data: BlockResource[]
}