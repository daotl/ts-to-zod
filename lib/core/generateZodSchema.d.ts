import * as ts from "typescript";
export interface GenerateZodSchemaProps {
    /**
     * Name of the exported variable
     */
    varName: string;
    /**
     * Name of the standard built-in object
     */
    typeName?: string;
    /**
     * Interface or type node
     */
    node?: ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.EnumDeclaration;
    /**
     * Zod import value.
     *
     * @default "z"
     */
    zodImportValue?: string;
    /**
     * Source file
     */
    sourceFile: ts.SourceFile;
    /**
     * Getter for schema dependencies (Type reference inside type)
     *
     * @default (identifierName) => camel(`${identifierName}Schema`)
     */
    getDependencyName?: (identifierName: string) => string;
    /**
     * Skip the creation of zod validators from JSDoc annotations
     *
     * @default false
     */
    skipParseJSDoc?: boolean;
}
/**
 * Generate zod schema declaration
 *
 * ```ts
 * export const ${varName} = ${zodImportValue}.object(…)
 * ```
 */
export declare function generateZodSchemaVariableStatement({ node, typeName, sourceFile, varName, zodImportValue, getDependencyName, skipParseJSDoc, }: GenerateZodSchemaProps): {
    dependencies: string[];
    statement: ts.VariableStatement;
    requiresImport: boolean;
};
