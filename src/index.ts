#!/usr/bin/env node
import fs from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { Command } from 'commander'
import figlet from 'figlet'
import path from 'path'
import updateNotifier from 'update-notifier'

import {
  GenerateTypesCommand,
  LoginCommand,
  LogoutCommand,
  RefreshTokenCommand,
  SpacesHierarchyCommand,
  SpacesListCommand,
  TeamsCreateCommand,
  TeamsHierarchyCommand,
  TeamsListCommand,
} from './commands/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rawPkg = fs.readFileSync(path.join(__dirname, '../package.json'))
const pkg = JSON.parse(rawPkg.toString())
const program = new Command()

updateNotifier({ pkg }).notify({ isGlobal: true })

program
  .addHelpText('beforeAll', chalk.blueBright(figlet.textSync('b10cks', { font: 'small' })))
  .configureHelp({
    sortSubcommands: true,
  })
  .version(pkg.version)

// Register all commands
const commands = [
  new GenerateTypesCommand(),
  new RefreshTokenCommand(),
  new LoginCommand(),
  new LogoutCommand(),
  new SpacesListCommand(),
  new SpacesHierarchyCommand(),
  new TeamsListCommand(),
  new TeamsCreateCommand(),
  new TeamsHierarchyCommand(),
]

commands.forEach((command) => {
  command.register(program)
})

program.parse(process.argv)
