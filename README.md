# b10cks CLI

[![npm version](https://img.shields.io/npm/v/b10cks-cli.svg)](https://www.npmjs.com/package/b10cks-cli)
[![npm downloads](https://img.shields.io/npm/dt/b10cks-cli.svg)](https://www.npmjs.com/package/b10cks-cli)
[![GitHub issues](https://img.shields.io/github/issues/b10cks/b10cks-cli.svg?style=flat-square)](https://github.com/b10cks/b10cks-cli/issues)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## Overview

The b10cks CLI is a command-line interface tool designed to enhance your workflow with the b10cks headless CMS. It provides essential utilities for authentication, content type generation, and project management when working with the b10cks API-first content management system.

## Installation

### Global Installation

Install the CLI globally using your preferred package manager:

```bash
# Using npm
npm install -g b10cks-cli

# Using yarn
yarn global add b10cks-cli

# Using bun
bun install -g b10cks-cli
```

### Direct Execution

You can also run the CLI directly without installation:

```bash
# Using npx (npm)
npx b10cks-cli <command>

# Using bunx (bun)
bunx b10cks-cli <command>

# Using yarn
yarn dlx b10cks-cli <command>
```

## Usage

#### Login

Authenticate with your b10cks account:

```sh
b10cks login

# Or using package runners
npx b10cks-cli login
bunx b10cks-cli login
yarn dlx b10cks-cli login
```

This command will guide you through the authentication process to connect the CLI with your b10cks workspace.

#### Logout

End your authenticated session:

```sh
b10cks logout

# Or using package runners
npx b10cks-cli logout
bunx b10cks-cli logout
yarn dlx b10cks-cli logout
```

### Development Tools

#### Generate TypeScript Definitions

Create TypeScript type definitions based on your configured content blocks:

```sh
b10cks generate-types <space>

# Or using package runners
npx b10cks-cli generate-types <space>
bunx b10cks-cli generate-types <space>
yarn dlx b10cks-cli generate-types <space>
```

This generates strongly-typed interfaces for your content models, enabling better development experience with autocomplete and type checking.

## License

This project is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](https://www.gnu.org/licenses/agpl-3.0.en.html) - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.