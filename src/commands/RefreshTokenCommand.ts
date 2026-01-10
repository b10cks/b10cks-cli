import type { Command } from 'commander'
import { BaseCommand } from './BaseCommand.js'

export class RefreshTokenCommand extends BaseCommand {
  register(program: Command): void {
    program
      .command('refresh-token')
      .description('Refresh the session token')
      .action(async () => {
        if (!(await this.ensureAuthenticated())) {
          process.exit(1)
        }

        try {
          if (await this.service.refreshToken()) {
            this.displaySuccess('Token refreshed successfully')
            this.displayTokenInfo()
          } else {
            console.error('An error occurred when refreshing the token')
            process.exit(1)
          }
        } catch (error: any) {
          this.handleError(error)
        }
      })
  }
}
