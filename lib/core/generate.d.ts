import { JSDocTagFilter, NameFilter } from "../config";
export interface GenerateProps {
    /**
     * Content of the typescript source file.
     */
    sourceText: string;
    /**
     * Filter on type/interface name.
     */
    nameFilter?: NameFilter;
    /**
     * Filter on JSDocTag.
     */
    jsDocTagFilter?: JSDocTagFilter;
    /**
     * Schema name generator.
     */
    getSchemaName?: (identifier: string) => string;
    /**
     * Keep parameters comments.
     * @default false
     */
    keepComments?: boolean;
    /**
     * Skip the creation of zod validators from JSDoc annotations
     *
     * @default false
     */
    skipParseJSDoc?: boolean;
    /**
     * Path of z.infer<> types file.
     */
    inferredTypes?: string;
}
/**
 * Generate zod schemas and integration tests from a typescript file.
 *
 * This function take care of the sorting of the `const` declarations and solved potential circular references
 */
export declare function generate({ sourceText, nameFilter, jsDocTagFilter, getSchemaName, keepComments, skipParseJSDoc, }: GenerateProps): {
    /**
     * Source text with pre-process applied.
     */
    transformedSourceText: string;
    /**
     * Get the content of the zod schemas file.
     *
     * @param typesImportPath Relative path of the source file
     */
    getZodSchemasFile: (typesImportPath: string, inputPath?: string | undefined) => string;
    /**
     * Get the content of the integration tests file.
     *
     * @param typesImportPath Relative path of the source file
     * @param zodSchemasImportPath Relative path of the zod schemas file
     */
    getIntegrationTestFile: (typesImportPath: string, zodSchemasImportPath: string) => string;
    /**
     * Get the content of the zod inferred types files.
     *
     * @param zodSchemasImportPath Relative path of the zod schemas file
     */
    getInferredTypes: (zodSchemasImportPath: string) => string;
    /**
     * List of generation errors.
     */
    errors: string[];
    /**
     * `true` if zodSchemaFile have some resolvable circular dependencies
     */
    hasCircularDependencies: boolean;
};
