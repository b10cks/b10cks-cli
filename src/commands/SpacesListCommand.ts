import chalk from 'chalk'
import type { Command } from 'commander'
import { BaseCommand } from './BaseCommand.js'

export class SpacesListCommand extends BaseCommand {
  register(program: Command): void {
    program
      .command('spaces-list')
      .description('list all available spaces')
      .action(async () => {
        if (!(await this.ensureAuthenticated())) {
          process.exit(1)
        }

        try {
          const response = await this.service.listSpaces()
          if (!response.data || response.data.length === 0) {
            console.log('No spaces found')
            return
          }

          console.log(`\n${chalk.bold('Available Spaces:')}`)
          response.data.forEach((space) => {
            console.log(`${chalk.cyan(space.id)} ${space.name}`)
          })
        } catch (error: any) {
          this.handleError(error)
        }
      })
  }
}
