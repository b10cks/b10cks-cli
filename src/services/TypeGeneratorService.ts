import * as fs from 'node:fs'
import * as path from 'path'
import type { BlockList, BlockResource } from '../types'
import BaseService from './BaseService'

export class TypesGeneratorService extends BaseService {
  private readonly outputDir: string
  private readonly generatedFilePath: string
  private readonly indexFilePath: string
  private allBlocks: BlockList = {}

  constructor(outputDir: string = './b10cks/types') {
    super()
    if (!path.isAbsolute(outputDir)) {
      const appDir = path.join(process.cwd(), 'app')
      if (fs.existsSync(appDir)) {
        outputDir = path.join(appDir, outputDir)
      } else {
        outputDir = path.join(process.cwd(), outputDir)
      }
    }

    this.outputDir = outputDir
    this.generatedFilePath = path.join(this.outputDir, 'generated.d.ts')
    this.indexFilePath = path.join(this.outputDir, 'index.d.ts')
  }

  public async generate(space: string) {
    const { data } = await this.api.getBlocks(space)
    this.allBlocks = data.reduce((acc, { slug, tags }) => {
      acc[slug] = {
        name: this.getInterfaceName(slug),
        tags,
      }
      return acc
    }, {} as BlockList)

    this.generateTypes(data)
  }

  public generateTypes(blocks: Array<BlockResource>): void {
    this.ensureDirectoryExists(this.outputDir)

    const typesContent = this.generateTypesContent(blocks)

    fs.writeFileSync(this.generatedFilePath, typesContent)

    this.createIndexFileIfNotExists()
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  private createIndexFileIfNotExists(): void {
    if (!fs.existsSync(this.indexFilePath)) {
      const indexContent = `export * from './generated';\n`
      fs.writeFileSync(this.indexFilePath, indexContent)
    } else {
    }
  }

  private generateTypesContent(blocks: any[]): string {
    let content = `export interface B10cksItem {
  id: string
  block: string
}

export type B10cksAsset = {
    url: string
    data: Record<string, never>
    metadata: {
      width: number
      height: number
    },
    id: string
    size: number
    type: "asset"
    filename: string
    extension: string
    full_path: string
    mime_type: string
}

export type B10cksLink = {
  url: string;
  type: 'url'
  target?: '_self' | '_blank' | '_parent' | '_top'
  rel?: string
} | {
  email: string
  type: 'email'
} | {
  type: 'internal'
  url: string
  title: string
  content: string
  target?: '_self' | '_blank' | '_parent' | '_top'  
}

`

    blocks.forEach((block) => {
      const typeName = this.getInterfaceName(block.slug)
      const interfaceContent = this.generateInterfaceContent(block, typeName)
      content += interfaceContent
    })

    return content
  }

  /**
   * Gets the interface name for a block slug
   * @param slug The block slug
   * @returns The interface name
   */
  private getInterfaceName(slug: string): string {
    return `B10cks${slug.charAt(0).toUpperCase()}${slug.slice(1)}`
  }

  /**
   * Generates the interface content for a block
   * @param block The block definition
   * @param typeName The interface name
   * @returns The generated interface content
   */
  private generateInterfaceContent(block: any, typeName: string): string {
    let content = `export interface ${typeName} extends B10cksItem {\n`

    if (block.schema) {
      const properties = Object.entries(block.schema).map(([key, schema]: [string, any]) => {
        const type = this.mapSchemaTypeToTsType(schema.type, key, block.slug, schema)
        const optional = !schema.required ? '?' : ''
        return `\t${key}${optional}: ${type}`
      })

      content += `${properties.join('\n')}\n`
    }

    content += '}\n\n'
    return content
  }

  /**
   * Maps a schema type to a TypeScript type
   * @param schemaType The schema type
   * @param key The property key
   * @param blockSlug The block slug
   * @param schema The complete schema object
   * @returns The corresponding TypeScript type
   */
  private mapSchemaTypeToTsType(schemaType: string, _key: string, _blockSlug: string, schema: any): string {
    switch (schemaType) {
      case 'text':
      case 'textarea':
      case 'markdown':
        return 'string'
      case 'boolean':
        return 'boolean'
      case 'number':
        return 'number'
      case 'link':
        return 'B10cksLink'
      case 'asset':
        return 'B10cksAsset'
      case 'multiAsset':
        return 'Array<B10cksAsset>'
      case 'blocks': {
        const whitelistTypes: string[] = []
        if (schema.restrict_blocks && (schema.block_whitelist?.length > 0 || schema.tag_whitelist?.length > 0)) {
          schema.block_whitelist.forEach((blockSlug: string) => {
            if (this.allBlocks[blockSlug]) {
              whitelistTypes.push(this.allBlocks[blockSlug].name)
            } else {
            }
          })

          schema.tag_whitelist.forEach((tag: string) => {
            const matchingBlocks = Object.entries(this.allBlocks)
              .filter(([_, block]) => block.tags?.includes(tag))
              .map(([_slug, block]) => block.name)

            if (matchingBlocks.length > 0) {
              whitelistTypes.push(...matchingBlocks)
            } else {
            }
          })

          if (whitelistTypes.length === 1) {
            return `${whitelistTypes[0]}[]`
          } else {
            return `Array<${whitelistTypes.join(' | ')}>`
          }
        }

        return 'Array<BItem>'
      }
      case 'option':
        if (schema.options && Array.isArray(schema.options)) {
          const optionValues = schema.options
            .filter((option: any) => option.value !== undefined)
            .map((option: any) => `'${option.value}'`)

          if (optionValues.length > 0) {
            return optionValues.join(' | ')
          }
        }

        return 'string'
      default:
        return 'any'
    }
  }
}
