# b10cks CLI

[![npm version](https://img.shields.io/npm/v/b10cks-cli.svg)](https://www.npmjs.com/package/b10cks-cli)
[![npm downloads](https://img.shields.io/npm/dt/b10cks-cli.svg)](https://www.npmjs.com/package/b10cks-cli)
[![GitHub issues](https://img.shields.io/github/issues/b10cks/b10cks-cli.svg?style=flat-square)](https://github.com/b10cks/b10cks-cli/issues)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Linted with Biome](https://img.shields.io/badge/Linted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

## Overview

The b10cks CLI is a command-line interface tool designed to enhance your workflow with the b10cks headless CMS. It provides essential utilities for authentication, content type generation, team management, and project management when working with the b10cks API-first content management system.

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

### Authentication

#### Login

Authenticate with your b10cks account:

```sh
b10cks login

# Or using package runners
npx b10cks-cli login
bunx b10cks-cli login
yarn dlx b10cks-cli login
```

This command will guide you through the authentication process to connect the CLI with your b10cks workspace. Your session token will be stored in your `.netrc` file for subsequent commands.

#### Logout

End your authenticated session:

```sh
b10cks logout

# Or using package runners
npx b10cks-cli logout
bunx b10cks-cli logout
yarn dlx b10cks-cli logout
```

#### Refresh Token

Refresh your session token:

```sh
b10cks refresh-token

# Or using package runners
npx b10cks-cli refresh-token
bunx b10cks-cli refresh-token
yarn dlx b10cks-cli refresh-token
```

### Development Tools

#### Generate TypeScript Definitions

Create TypeScript type definitions based on your configured content blocks:

```sh
b10cks generate-types <space>

# With custom output path
b10cks generate-types <space> --out ./types

# Or using package runners
npx b10cks-cli generate-types <space>
bunx b10cks-cli generate-types <space>
yarn dlx b10cks-cli generate-types <space>
```

This generates strongly-typed interfaces for your content models, enabling better development experience with autocomplete and type checking.

### Spaces Management

#### List Spaces

List all available spaces in your workspace:

```sh
b10cks spaces-list

# Or using package runners
npx b10cks-cli spaces-list
bunx b10cks-cli spaces-list
yarn dlx b10cks-cli spaces-list
```

Displays all spaces with their IDs and names in a formatted table.

#### View Spaces & Teams Hierarchy

Display the complete spaces and teams hierarchy tree with color differentiation:

```sh
b10cks spaces-hierarchy

# Or using package runners
npx b10cks-cli spaces-hierarchy
bunx b10cks-cli spaces-hierarchy
yarn dlx b10cks-cli spaces-hierarchy
```

Shows teams and spaces organized in a tree structure to visualize the relationship between teams and their associated spaces. Uses color coding to differentiate:

- **Teams** - Displayed in blue with `[TEAM]` prefix
- **Spaces** - Displayed with a colored dot (●) using the space's configured color, with optional emoji/icon

This command builds the hierarchy client-side by combining team and space data to show:

1. Teams in a parent-child hierarchy
2. Spaces belonging to each team
3. Visual organization with proper indentation and tree connectors

### Data Sources Management

#### Create a Data Source Entry

Create a new data source entry by posting a `key` and `value` to a specific data source in a space.

**Quick Mode (Positional arguments + flags):**

```sh
b10cks data-sources-entries-create <spaceId> <dataSourceId> --key "key" --value "value"

# Example
b10cks data-sources-entries-create space_123 ds_456 --key "country" --value "Austria"
```

**Quick Mode (Options only):**

```sh
b10cks data-sources-entries-create \
  --space-id "space_123" \
  --data-source-id "ds_456" \
  --key "country" \
  --value "Austria"
```

**Interactive Mode (Guided prompts for entry data):**

```sh
b10cks data-sources-entries-create <spaceId> <dataSourceId> --interactive

# Or using package runners
npx b10cks-cli data-sources-entries-create <spaceId> <dataSourceId> --interactive
bunx b10cks-cli data-sources-entries-create <spaceId> <dataSourceId> --interactive
yarn dlx b10cks-cli data-sources-entries-create <spaceId> <dataSourceId> --interactive
```

**Options and Arguments:**

- `[spaceId]` - Space ID (optional if `--space-id` is provided)
- `[dataSourceId]` - Data source ID (optional if `--data-source-id` is provided)
- `-s, --space-id <spaceId>` - Space ID
- `-d, --data-source-id <dataSourceId>` - Data source ID
- `-k, --key <key>` - Entry key
- `-v, --value <value>` - Entry value
- `--interactive` - Launch interactive mode for `key` and `value`

**Validation:**

- Space ID: required
- Data source ID: required
- Key: required
- Value: required

**Examples:**

```sh
# Using positional arguments
b10cks data-sources-entries-create space_123 ds_456 --key "language" --value "de"

# Using named options
b10cks data-sources-entries-create --space-id space_123 --data-source-id ds_456 --key "timezone" --value "Europe/Vienna"

# Prompt for key/value interactively
b10cks data-sources-entries-create space_123 ds_456 --interactive
```

### Teams Management

#### List Teams

List all teams in your workspace:

```sh
b10cks teams-list

# Or using package runners
npx b10cks-cli teams-list
bunx b10cks-cli teams-list
yarn dlx b10cks-cli teams-list
```

Displays all teams with their IDs (ULIDs) and names in a formatted table.

#### View Team Hierarchy

Display the complete team hierarchy tree:

```sh
b10cks teams-hierarchy

# Or using package runners
npx b10cks-cli teams-hierarchy
bunx b10cks-cli teams-hierarchy
yarn dlx b10cks-cli teams-hierarchy
```

Shows teams organized in a tree structure to visualize parent-child relationships.

#### Create a Team

Create a new team in your workspace with two modes:

**Quick Mode (Command-line flags):**

```sh
b10cks teams-create --name "Engineering Team" --color "#0066FF" --icon "⚙️"

# With parent team (subteam)
b10cks teams-create --name "Backend Team" --parent-id "parent-team-id" --description "Backend development team"

# All options
b10cks teams-create \
  --name "My Team" \
  --description "Team description" \
  --color "#FF5733" \
  --icon "🚀" \
  --parent-id "parent-team-id"
```

**Interactive Mode (Guided prompts):**

```sh
b10cks teams-create --interactive

# Or using package runners
npx b10cks-cli teams-create --interactive
bunx b10cks-cli teams-create --interactive
yarn dlx b10cks-cli teams-create --interactive
```

**Options:**

- `-n, --name <name>` - Team name (required in quick mode)
- `-d, --description <description>` - Team description (optional)
- `-i, --icon <icon>` - Team icon/emoji, max 50 characters (optional)
- `-c, --color <color>` - Hex color format: `#RRGGBB` or `#RGB` (optional, e.g., `#FF5733` or `#F57`)
- `-p, --parent-id <parentId>` - Parent team ID for creating subteams (optional)
- `--interactive` - Launch interactive mode with prompts for all fields

**Color Format:**

The color must be a valid hexadecimal color:

- Full format: `#RRGGBB` (e.g., `#FF5733`)
- Short format: `#RGB` (e.g., `#F57`)

**Validation:**

- Team name: required, max 100 characters
- Icon: max 50 characters
- Color: must be valid hex format
- Description: optional, any length
- Parent ID: optional, must be a valid team ID

**Examples:**

```sh
# Simple team
b10cks teams-create --name "Marketing"

# Team with description
b10cks teams-create --name "Design Team" --description "UI/UX design team" --color "#FF00FF"

# Subteam under another team
b10cks teams-create --name "Mobile Dev" --parent-id "engineering-team-id"

# Interactive mode for guidance
b10cks teams-create --interactive
```

## Getting Help

View all available commands:

```sh
b10cks --help
```

Get help for a specific command:

```sh
b10cks <command> --help
```

View version:

```sh
b10cks --version
```

## Architecture

The CLI uses a modular command architecture with:

- **Commands** (`src/commands/`) - Individual command implementations
- **Services** (`src/services/`) - Business logic for API interactions
- **Types** (`src/types/`) - TypeScript interfaces for type safety
- **Utilities** (`src/utils/`) - Helper functions and authentication

Each command extends `BaseCommand` for consistent error handling, authentication, and user feedback.

## Hierarchy Commands

The CLI provides two hierarchy visualization commands:

### Teams Hierarchy (`teams-hierarchy`)

Shows only the team structure:

```sh
b10cks teams-hierarchy
```

Displays teams in a tree with parent-child relationships.

### Spaces & Teams Hierarchy (`spaces-hierarchy`)

Shows the complete workspace structure:

```sh
b10cks spaces-hierarchy
```

Displays both teams and spaces organized together, with teams in blue and spaces colored according to their configuration. This is useful for understanding:

- How teams are organized (parent-child teams)
- What spaces belong to each team
- The overall workspace structure

## License

This project is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](https://www.gnu.org/licenses/agpl-3.0.en.html) - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
