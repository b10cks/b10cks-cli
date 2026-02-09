import netrc from 'netrc'
import fs from 'node:fs'
import os from 'node:os'
import path from 'path'

export interface Credentials {
  email?: string
  password?: string
  login?: string
  token?: string
  expiresAt?: number
}

const getFile = () => {
  const home = process.env[/^win/.test(process.platform) ? 'USERPROFILE' : 'HOME']
  return path.join(home!, '.netrc')
}

const getNrcFile = (): Record<string, any> => {
  let obj: Record<string, any> = {}

  try {
    obj = netrc(getFile()) as Record<string, any>
  } catch (_e) {
    obj = {}
  }

  return obj
}

const get = (host: string = 'b10cks.com'): Credentials | null => {
  const obj = getNrcFile()

  if (process.env.B10CKS_LOGIN && process.env.B10CKS_TOKEN) {
    return {
      email: process.env.B10CKS_LOGIN,
      password: process.env.B10CKS_TOKEN,
    }
  }

  if (Object.hasOwn(obj, host)) {
    return obj[host] as Credentials
  }

  return null
}

const set = (content: Credentials | null, host: string = 'b10cks.com'): Credentials | null => {
  const file = getFile()
  let obj: Record<string, any> = {}

  try {
    obj = netrc(file) as Record<string, any>
  } catch (_e) {
    obj = {}
  }

  if (content === null) {
    delete obj[host]
    fs.writeFileSync(file, netrc.format(obj) + os.EOL)
    return null
  } else {
    obj[host] = content
    fs.writeFileSync(file, netrc.format(obj) + os.EOL)
    return get()
  }
}

/**
 * Check if the token is expired or about to expire (within 5 minutes)
 */
const isTokenExpired = (host: string = 'b10cks.com'): boolean => {
  const creds = get(host)
  if (!creds?.expiresAt) {
    return false // No expiration info, assume it's valid
  }

  // Check if expired or expiring within 5 minutes
  const expirationBuffer = 5 * 60 * 1000 // 5 minutes in milliseconds
  return Date.now() >= creds.expiresAt - expirationBuffer
}

export default {
  set: set,
  get: get,
  clear: () => set(null),
  isTokenExpired,
}
