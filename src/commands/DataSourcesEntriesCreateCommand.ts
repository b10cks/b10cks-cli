import chalk from 'chalk'
import type { Command } from 'commander'
import inquirer from 'inquirer'

import type { CreateDataSourceEntryPayload } from '../types/index.js'
import { BaseCommand } from './BaseCommand.js'

export class DataSourcesEntriesCreateCommand extends BaseCommand {
  register(program: Command): void {
    program
      .command('data-sources-entries-create')
      .description('create a new data source entry')
      .argument('[spaceId]', 'Space ID')
      .argument('[dataSourceId]', 'Data source ID')
      .option('-s, --space-id <spaceId>', 'Space ID')
      .option('-d, --data-source-id <dataSourceId>', 'Data source ID')
      .option('-k, --key <key>', 'Entry key')
      .option('-v, --value <value>', 'Entry value')
      .option('--interactive', 'Interactive mode (prompt for inputs)', false)
      .action(async (spaceIdArg, dataSourceIdArg, options) => {
        if (!(await this.ensureAuthenticated())) {
          process.exit(1)
        }

        try {
          const identifiers = this.resolveIdentifiers(spaceIdArg, dataSourceIdArg, options)

          const payload = options.interactive
            ? await this.promptForEntryData(options)
            : this.validateAndBuildPayload(options)

          const response = await this.service.createDataSourceEntry(
            identifiers.spaceId,
            identifiers.dataSourceId,
            payload
          )

          console.log(`\n${chalk.green('✓')} Data source entry created successfully!`)
          if (response.data?.id) {
            console.log(`${chalk.bold('ID:')} ${chalk.cyan(response.data.id)}`)
          }
          console.log(`${chalk.bold('Space ID:')} ${identifiers.spaceId}`)
          console.log(`${chalk.bold('Data Source ID:')} ${identifiers.dataSourceId}`)
          console.log(`${chalk.bold('Key:')} ${response.data?.key ?? payload.key}`)
          console.log(`${chalk.bold('Value:')} ${response.data?.value ?? payload.value}`)
        } catch (error: any) {
          this.handleError(error)
        }
      })
  }

  private resolveIdentifiers(
    spaceIdArg: string | undefined,
    dataSourceIdArg: string | undefined,
    options: any
  ) {
    const spaceId = options.spaceId || spaceIdArg
    const dataSourceId = options.dataSourceId || dataSourceIdArg

    if (!spaceId) {
      throw new Error('Space ID is required (use argument, --space-id, or --interactive)')
    }

    if (!dataSourceId) {
      throw new Error(
        'Data source ID is required (use argument, --data-source-id, or --interactive)'
      )
    }

    return { spaceId, dataSourceId }
  }

  private async promptForEntryData(options: any): Promise<CreateDataSourceEntryPayload> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'key',
        message: 'Entry key:',
        default: options.key,
        validate: (value) => {
          if (!value || value.length === 0) {
            return 'Entry key is required'
          }
          return true
        },
      },
      {
        type: 'input',
        name: 'value',
        message: 'Entry value:',
        default: options.value,
        validate: (value) => {
          if (!value || value.length === 0) {
            return 'Entry value is required'
          }
          return true
        },
      },
    ])

    return {
      key: answers.key,
      value: answers.value,
    }
  }

  private validateAndBuildPayload(options: any): CreateDataSourceEntryPayload {
    if (!options.key) {
      throw new Error('Entry key is required (use --key or --interactive)')
    }

    if (!options.value) {
      throw new Error('Entry value is required (use --value or --interactive)')
    }

    return {
      key: options.key,
      value: options.value,
    }
  }
}
