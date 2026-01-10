import chalk from 'chalk'
import ora from 'ora'
import Service from '../services/Service.js'
import credentials from './credentials.js'

/**
 * Check if token is expired and refresh it if needed
 * @param silent If true, don't show spinner feedback
 * @returns true if token is valid (either was already valid or was refreshed successfully)
 */
export async function refreshTokenIfNeeded(silent: boolean = false): Promise<boolean> {
  // If token is still valid, no need to refresh
  if (!credentials.isTokenExpired()) {
    return true
  }

  const service = new Service()
  const spinner = silent ? null : ora('Refreshing authentication token...').start()

  try {
    const success = await service.refreshToken()
    if (success) {
      if (spinner) {
        spinner.succeed('Token refreshed successfully')
      }
      return true
    } else {
      if (spinner) {
        spinner.fail('Failed to refresh token')
      }
      return false
    }
  } catch (error: any) {
    if (spinner) {
      spinner.fail(`Token refresh error: ${error.message}`)
    } else {
      console.error(`${chalk.red('✖')} Token refresh error: ${error.message}`)
    }
    return false
  }
}

/**
 * Ensure user is logged in and token is valid
 */
export function ensureLoggedIn(): void {
  const creds = credentials.get()
  if (!creds?.password) {
    console.error(`${chalk.red('✖')} Not logged in. Please login first with: ${chalk.cyan('b10cks login')}`)
    process.exit(1)
  }
}

/**
 * Display token expiration information
 */
export function displayTokenInfo(): void {
  const creds = credentials.get()
  if (creds?.expiresAt) {
    const expiresAt = new Date(creds.expiresAt)
    const timeUntilExpiry = creds.expiresAt - Date.now()
    const hoursRemaining = Math.floor(timeUntilExpiry / (1000 * 60 * 60))
    const minutesRemaining = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60))

    console.log(`${chalk.gray(`Expires at: ${expiresAt.toLocaleString()}`)}`)
    if (hoursRemaining > 0 || minutesRemaining > 0) {
      console.log(`${chalk.gray(`Valid for: ${hoursRemaining}h ${minutesRemaining}m`)}`)
    }
  }
}
