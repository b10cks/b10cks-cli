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
import { displayTokenInfo, ensureLoggedIn, refreshTokenIfNeeded } from './utils/refreshTokenIfNeeded.js'

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
    ensureLoggedIn()

    // Check if token is expired and needs refresh
    const refreshed = await refreshTokenIfNeeded()
    if (!refreshed) {
      console.error(`${chalk.red('✖')} Could not refresh authentication token`)
      process.exit(1)
    }

    const service = new TypesGeneratorService(options.out)
    await service.generate(space)
  })

program
  .command('refresh-token')
  .description('Refresh the session token')
  .action(async () => {
    ensureLoggedIn()

    const service = new Service()
    try {
      if (await service.refreshToken()) {
        console.log(`${chalk.green('✓')} Token refreshed successfully`)
        displayTokenInfo()
      } else {
        console.error(`${chalk.red('✖')} An error occurred when refreshing the token`)
        process.exit(1)
      }
    } catch (error: any) {
      console.error(`${chalk.red('✖')} Error: ${error.message}`)
      process.exit(1)
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

    const service = new Service()
    try {
      if (await service.login(content)) {
        console.log(`${chalk.green('✓')} Logged in successfully! Session Token is stored in your .netrc file.`)
        displayTokenInfo()
      } else {
        console.error(`${chalk.red('✖')} An error occurred when logging in`)
        process.exit(1)
      }
    } catch (error: any) {
      console.error(`${chalk.red('✖')} Error: ${error.message}`)
      process.exit(1)
    }
  })

program
  .command('logout')
  .description('logout from b10cks')
  .action(async () => {
    const service = new Service()
    try {
      await service.logout()
      console.log(`${chalk.green('✓')} Logged out successfully`)
    } catch (error: any) {
      console.error(`${chalk.red('✖')} Error: ${error.message}`)
      process.exit(1)
    }
  })

program.parse(process.argv)
