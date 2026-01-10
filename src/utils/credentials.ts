import fs from 'node:fs'
import os from 'node:os'
import netrc from 'netrc'
import path from 'path'

const getFile = () => {
  const home = process.env[/^win/.test(process.platform) ? 'USERPROFILE' : 'HOME']
  return path.join(home!, '.netrc')
}

const getNrcFile = () => {
  let obj = {}

  try {
    obj = netrc(getFile())
  } catch (_e) {
    obj = {}
  }

  return obj
}

const get = (host: string = 'b10cks.com') => {
  const obj = getNrcFile()

  if (process.env.B10CKS_LOGIN && process.env.B10CKS_TOKEN) {
    return {
      email: process.env.B10CKS_LOGIN,
      token: process.env.B10CKS_TOKEN,
    }
  }

  if (Object.hasOwn(obj, host)) {
    return obj[host]
  }

  return null
}

const set = (content: {} | null, host: string = 'b10cks.com') => {
  const file = getFile()
  let obj = {}

  try {
    obj = netrc(file)
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

export default {
  set: set,
  get: get,
  clear: () => set(null),
}
