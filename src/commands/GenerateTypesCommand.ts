import type { Command } from 'commander'

import chalk from 'chalk'

import { TypesGeneratorService } from '../services/TypeGeneratorService.js'
import { BaseCommand } from './BaseCommand.js'

export class GenerateTypesCommand extends BaseCommand {
  register(program: Command): void {
    program
      .command('generate-types')
      .argument('<space>', 'The space to generate types for')
      .option('-o, --out <path>', 'Output path for the generated types', './b10cks/types')
      .description('Generate types for b10cks')
      .action(async (space, options) => {
        if (!(await this.ensureAuthenticated())) {
          process.exit(1)
        }

        try {
          console.log(`\n${chalk.bold('Generating types for space:')} ${chalk.cyan(space)}`)
          console.log(`${chalk.dim('Output path:')} ${options.out}\n`)

          const service = new TypesGeneratorService(options.out)
          await service.generate(space)
        } catch (error: any) {
          this.handleError(error)
        }
      })
  }
}
