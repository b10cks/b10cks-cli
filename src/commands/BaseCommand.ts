import chalk from 'chalk'
import type { Command } from 'commander'
import Service from '../services/Service.js'
import { displayTokenInfo, ensureLoggedIn, refreshTokenIfNeeded } from '../utils/refreshTokenIfNeeded.js'

export abstract class BaseCommand {
  protected service: Service

  constructor() {
    this.service = new Service()
  }

  protected async ensureAuthenticated(): Promise<boolean> {
    ensureLoggedIn()

    const refreshed = await refreshTokenIfNeeded()
    if (!refreshed) {
      console.error(`${chalk.red('✖')} Could not refresh authentication token`)
      return false
    }

    return true
  }

  protected handleError(error: any): void {
    console.error(`${chalk.red('✖')} Error: ${error.message}`)
    process.exit(1)
  }

  protected displaySuccess(message: string): void {
    console.log(`${chalk.green('✓')} ${message}`)
  }

  protected displayTokenInfo(): void {
    displayTokenInfo()
  }

  abstract register(program: Command): void
}
