import chalk from 'chalk'
import type { Command } from 'commander'
import inquirer from 'inquirer'
import { BaseCommand } from './BaseCommand.js'

export class LoginCommand extends BaseCommand {
  register(program: Command): void {
    program
      .command('login')
      .description('login to b10cks')
      .action(async () => {
        const content = await inquirer.prompt([
          {
            type: 'input',
            name: 'email',
            message: 'email address:',
          },
          {
            type: 'password',
            name: 'password',
            message: 'Password:',
            validate: (value) => {
              if (value.length) {
                return true
              }
              return 'Please enter a valid password'
            },
          },
        ])

        try {
          if (await this.service.login(content)) {
            this.displaySuccess('Logged in successfully! Session Token is stored in your .netrc file.')
            this.displayTokenInfo()
          } else {
            console.error(`${chalk.red('✖')} An error occurred when logging in`)
            process.exit(1)
          }
        } catch (error: any) {
          this.handleError(error)
        }
      })
  }
}
