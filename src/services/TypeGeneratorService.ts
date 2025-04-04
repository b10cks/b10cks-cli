import * as fs from 'fs'
import * as path from 'path'
import BaseService from './BaseService'
import { BlockResource } from '../types'

/**
 * Service for generating TypeScript definition files from API responses
 */
export class TypesGeneratorService extends  BaseService{
  private readonly outputDir: string
  private readonly generatedFilePath: string
  private readonly indexFilePath: string

  /**
   * Creates a new instance of TypesGeneratorService
   * @param outputDir The directory to write the definition files to
   */
  constructor(outputDir: string = 'blocks/types') {
    super()
    this.outputDir = outputDir
    this.generatedFilePath = path.join(this.outputDir, 'generated.d.ts')
    this.indexFilePath = path.join(this.outputDir, 'index.d.ts')
  }

  public async generate(space: string) {
    const { data } = await this.api.getBlocks(space)
    this.generateTypes(data)
  }

  public generateTypes(blocks: Array<BlockResource>): void {
    this.ensureDirectoryExists(this.outputDir)

    const typesContent = this.generateTypesContent(blocks)

    fs.writeFileSync(this.generatedFilePath, typesContent)
    console.log(`Generated types written to ${this.generatedFilePath}`)

    this.createIndexFileIfNotExists()
  }

  /**
   * Ensures the output directory exists, creating it if necessary
   * @param dirPath The directory path to ensure exists
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      console.log(`Created directory: ${dirPath}`)
    }
  }

  /**
   * Creates the index.d.ts file if it doesn't exist
   */
  private createIndexFileIfNotExists(): void {
    if (!fs.existsSync(this.indexFilePath)) {
      const indexContent = `export * from './generated';\n`
      fs.writeFileSync(this.indexFilePath, indexContent)
      console.log(`Created index file at ${this.indexFilePath}`)
    } else {
      console.log(`Index file already exists at ${this.indexFilePath}`)
    }
  }

  /**
   * Generates the content for the generated.d.ts file
   * @param blocks The blocks from the API response
   * @returns The generated TypeScript definition content
   */
  private generateTypesContent(blocks: any[]): string {
    let content = `export interface B10cksItem {
  id: string
  block: string
}

export type B10cksLink = {
  url: string;
  type: 'url'
  target?: '_self' | '_blank' | '_parent' | '_top'
  rel?: string
} | {
  email?: string
  type: 'email'
}`

    blocks.forEach(block => {
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
    return 'B10cks' + slug.charAt(0).toUpperCase() + slug.slice(1)
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
        let type = this.mapSchemaTypeToTsType(schema.type, key, block.slug, schema)
        let optional = !schema.required ? '?' : ''
        return `\t${key}${optional}: ${type}`
      })

      content += properties.join('\n') + '\n'
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
  private mapSchemaTypeToTsType(schemaType: string, key: string, blockSlug: string, schema: any): string {
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
      case 'blocks':
        // Use whitelist if available to determine array type
        if (schema.block_whitelist && schema.block_whitelist.length > 0) {
          const whitelistTypes = schema.block_whitelist.map((slug: string) => this.getInterfaceName(slug))

          if (whitelistTypes.length === 1) {
            return `${whitelistTypes[0]}[]`
          } else {
            return `Array<${whitelistTypes.join(' | ')}>`
          }
        }

        // Default to BItem array if no whitelist
        return 'Array<BItem>'
      case 'option':
        // Extract options if available
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