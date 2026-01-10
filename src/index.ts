#!/usr/bin/env node
import fs from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { Command } from 'commander'
import figlet from 'figlet'
import inquirer from 'inquirer'
import path from 'path'
import updateNotifier from 'update-notifier'

import Service from './services/Service.js'
import { TypesGeneratorService } from './services/TypeGeneratorService'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rawPkg = fs.readFileSync(path.join(__dirname, '../package.json'))
const pkg = JSON.parse(rawPkg.toString())
const program = new Command()

updateNotifier({ pkg }).notify({ isGlobal: true })

program
  .addHelpText('beforeAll', chalk.magentaBright(figlet.textSync('b10cks', { font: 'small' })))
  .configureHelp({
    sortSubcommands: true,
  })
  .version(pkg.version)

program
  .command('generate-types')
  .argument('<space>', 'The space to generate types for')
  .option('-o, --out <path>', 'Output path for the generated types', './b10cks/types')
  .description('Generate types for b10cks')
  .action(async (space, options) => {
    const service = new TypesGeneratorService(options.out)
    await service.generate(space)
  })

program
  .command('refresh-token')
  .description('Refresh the session token')
  .action(async () => {
    const service = new Service()
    if (await service.refreshToken()) {
    } else {
      console.error(`${chalk.red('✖')} An error occurred when refreshing the token`)
    }
  })

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

    if (await new Service().login(content)) {
      console.log(`${chalk.green('✓')} Logged in successfully! Session Token is stored in your .netrc file.`)
    } else {
      console.error(`${chalk.red('✖')} An error occurred when login the user`)
    }
  })

program.parse(process.argv)
