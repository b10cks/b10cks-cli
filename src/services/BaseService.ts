import { ChalkInstance } from 'chalk'
import API from '../api'

class BaseService {
  protected api: API

  constructor() {
    this.api = new API()
  }

  protected output(content: string | ChalkInstance, silent: boolean = false): void {
    if (!silent) console.log(content)
  }
}

export default BaseService