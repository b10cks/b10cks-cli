import chalk from 'chalk'

import credentials from './credentials.js'

/**
 * Ensure user is logged in and has a valid token
 */
export function ensureLoggedIn(): void {
  const creds = credentials.get()
  if (!creds?.password) {
    console.error(
      `${chalk.red('✖')} Not authenticated. Please login first with: ${chalk.cyan('b10cks login')}`
    )
    process.exit(1)
  }
}

/**
 * Check if token exists (no refresh needed with Sanctum tokens)
 * @returns true if token exists
 */
export async function refreshTokenIfNeeded(): Promise<boolean> {
  const creds = credentials.get()
  return !!creds?.password
}

/**
 * Display token information
 */
export function displayTokenInfo(): void {
  const creds = credentials.get()
  if (creds?.login && creds?.password) {
    console.log(chalk.gray('Personal access token stored in .netrc'))
  }
}
