import chalk from 'chalk'
import type { Command } from 'commander'
import { BaseCommand } from './BaseCommand.js'

export class TeamsListCommand extends BaseCommand {
  register(program: Command): void {
    program
      .command('teams-list')
      .description('list all available teams')
      .action(async () => {
        if (!(await this.ensureAuthenticated())) {
          process.exit(1)
        }

        try {
          const response = await this.service.listTeams()
          if (!response.data || response.data.length === 0) {
            console.log('No teams found')
            return
          }

          console.log(`\n${chalk.bold('Available Teams:')}`)
          response.data.forEach((team) => {
            console.log(`${chalk.cyan(team.id)} ${team.name}`)
          })
        } catch (error: any) {
          this.handleError(error)
        }
      })
  }
}
