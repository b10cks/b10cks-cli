#!/usr/bin/env node
import chalk from 'chalk'
import figlet from 'figlet'
import inquirer from 'inquirer'
import { Command } from 'commander'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import updateNotifier from 'update-notifier'
import path from 'path'
import fs from 'fs'

import Service from './services/Service.js'
import { TypesGeneratorService } from './services/TypeGeneratorService'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rawPkg = fs.readFileSync(path.join(__dirname, '../package.json'))
const pkg = JSON.parse(rawPkg.toString())
const program = new Command()

updateNotifier({ pkg })
  .notify({ isGlobal: true })


program.addHelpText('beforeAll', chalk.magentaBright(figlet.textSync('b10cks', { font: 'Chunky' })))
  .configureHelp({
    sortSubcommands: true
  })
  .version(pkg.version)

program.command('generate-types')
  .argument('<space>', 'The space to generate types for')
  .description('Generate types for b10cks')
  .action(async (space) => {
    const service = new TypesGeneratorService()
    await service.generate(space)
  })

program.command('login')
  .description('login to b10cks')
  .action(async () => {
    const content = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'email address:'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:',
        validate: function (value) {
          if (value.length) {
            return true
          }
          return 'Please enter a valid password'
        }
      }
    ])

    if (await (new Service()).login(content)) {
      console.log(chalk.green('✓') + ' Logged in successfully! Session Token is stored in your .netrc file.')
    } else {
      console.error(chalk.red('✖') + ' An error occurred when login the user')
    }
  })

program.parse(process.argv)