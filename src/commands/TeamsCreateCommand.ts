import type { Command } from 'commander'

import chalk from 'chalk'
import inquirer from 'inquirer'

import type { CreateTeamPayload } from '../types/index.js'

import { BaseCommand } from './BaseCommand.js'

export class TeamsCreateCommand extends BaseCommand {
  private validateColor(color: string): boolean {
    // Validate hex color format: #RRGGBB or #RGB
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    return hexColorRegex.test(color)
  }

  register(program: Command): void {
    program
      .command('teams-create')
      .description('create a new team')
      .option('-n, --name <name>', 'Team name (required)')
      .option('-d, --description <description>', 'Team description')
      .option('-i, --icon <icon>', 'Team icon (max 50 characters)')
      .option('-c, --color <color>', 'Team color (hex format: #RRGGBB or #RGB)')
      .option('-p, --parent-id <parentId>', 'Parent team ID (for subteams)')
      .option('--interactive', 'Interactive mode (prompt for inputs)', false)
      .action(async (options) => {
        if (!(await this.ensureAuthenticated())) {
          process.exit(1)
        }

        try {
          let payload: CreateTeamPayload

          if (options.interactive || !options.name) {
            // Interactive mode
            payload = await this.promptForTeamData(options)
          } else {
            // Command-line mode
            payload = this.validateAndBuildPayload(options)
          }

          const response = await this.service.createTeam(payload)

          console.log(`\n${chalk.green('✓')} Team created successfully!`)
          console.log(`${chalk.bold('ID:')} ${chalk.cyan(response.data.id)}`)
          console.log(`${chalk.bold('Name:')} ${response.data.name}`)
          if (response.data.parent_id) {
            console.log(`${chalk.bold('Parent ID:')} ${response.data.parent_id}`)
          }
        } catch (error: any) {
          this.handleError(error)
        }
      })
  }

  private async promptForTeamData(options: any): Promise<CreateTeamPayload> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Team name:',
        default: options.name,
        validate: (value) => {
          if (!value || value.length === 0) {
            return 'Team name is required'
          }
          if (value.length > 100) {
            return 'Team name must not exceed 100 characters'
          }
          return true
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Team description (optional):',
        default: options.description || '',
      },
      {
        type: 'input',
        name: 'icon',
        message: 'Team icon (optional, max 50 characters):',
        default: options.icon || '',
        validate: (value) => {
          if (value && value.length > 50) {
            return 'Icon must not exceed 50 characters'
          }
          return true
        },
      },
      {
        type: 'input',
        name: 'color',
        message: 'Team color in hex format (optional, e.g., #FF5733 or #F57):',
        default: options.color || '',
        validate: (value) => {
          if (value && !this.validateColor(value)) {
            return 'Invalid hex color format. Use #RRGGBB or #RGB'
          }
          return true
        },
      },
      {
        type: 'input',
        name: 'parent_id',
        message: 'Parent team ID for hierarchy (optional):',
        default: options.parentId || '',
      },
    ])

    const payload: CreateTeamPayload = {
      name: answers.name,
    }

    if (answers.description) {
      payload.description = answers.description
    }

    if (answers.icon) {
      payload.icon = answers.icon
    }

    if (answers.color) {
      payload.color = answers.color
    }

    if (answers.parent_id) {
      payload.parent_id = answers.parent_id
    }

    return payload
  }

  private validateAndBuildPayload(options: any): CreateTeamPayload {
    // Validate required field
    if (!options.name) {
      throw new Error('Team name is required (use --name or --interactive)')
    }

    if (options.name.length > 100) {
      throw new Error('Team name must not exceed 100 characters')
    }

    // Validate icon length
    if (options.icon && options.icon.length > 50) {
      throw new Error('Icon must not exceed 50 characters')
    }

    // Validate color format if provided
    if (options.color && !this.validateColor(options.color)) {
      throw new Error('Invalid hex color format. Use #RRGGBB or #RGB (e.g., #FF5733 or #F57)')
    }

    const payload: CreateTeamPayload = {
      name: options.name,
    }

    if (options.description) {
      payload.description = options.description
    }

    if (options.icon) {
      payload.icon = options.icon
    }

    if (options.color) {
      payload.color = options.color
    }

    if (options.parentId) {
      payload.parent_id = options.parentId
    }

    return payload
  }
}
