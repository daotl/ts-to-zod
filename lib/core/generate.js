"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const tslib_1 = require("tslib");
const case_1 = require("case");
const tsutils_1 = require("tsutils");
const typescript_1 = (0, tslib_1.__importDefault)(require("typescript"));
const getSimplifiedJsDocTags_1 = require("../utils/getSimplifiedJsDocTags");
const resolveModules_1 = require("../utils/resolveModules");
const generateIntegrationTests_1 = require("./generateIntegrationTests");
const generateZodInferredType_1 = require("./generateZodInferredType");
const generateZodSchema_1 = require("./generateZodSchema");
const transformRecursiveSchema_1 = require("./transformRecursiveSchema");
const const_1 = require("./const");
/**
 * Generate zod schemas and integration tests from a typescript file.
 *
 * This function take care of the sorting of the `const` declarations and solved potential circular references
 */
function generate({ sourceText, nameFilter = () => true, jsDocTagFilter = () => true, getSchemaName = (id) => (0, case_1.camel)(id) + "Schema", keepComments = false, skipParseJSDoc = false, }) {
    // Create a source file and deal with modules
    const sourceFile = (0, resolveModules_1.resolveModules)(sourceText);
    // Extract the nodes (interface declarations & type aliases)
    const nodes = [];
    const visitor = (node) => {
        if (typescript_1.default.isInterfaceDeclaration(node) ||
            typescript_1.default.isTypeAliasDeclaration(node) ||
            typescript_1.default.isEnumDeclaration(node)) {
            const jsDoc = (0, tsutils_1.getJsDoc)(node, sourceFile);
            const tags = (0, getSimplifiedJsDocTags_1.getSimplifiedJsDocTags)(jsDoc);
            if (!jsDocTagFilter(tags))
                return;
            if (!nameFilter(node.name.text))
                return;
            nodes.push(node);
        }
    };
    typescript_1.default.forEachChild(sourceFile, visitor);
    // Generate zod schemas
    const zodSchemas = nodes.map((node) => {
        const typeName = node.name.text;
        const varName = getSchemaName(typeName);
        const zodSchema = (0, generateZodSchema_1.generateZodSchemaVariableStatement)({
            zodImportValue: "z",
            node,
            sourceFile,
            varName,
            getDependencyName: getSchemaName,
            skipParseJSDoc,
        });
        return Object.assign({ typeName, varName }, zodSchema);
    });
    const zodSchemaNames = zodSchemas.map(({ varName }) => varName);
    // Zod schemas with direct or indirect dependencies that are not in `zodSchemas`, won't be generated
    const zodSchemasWithMissingDependencies = new Set();
    const standardBuiltInObjects = new Set();
    zodSchemas.forEach(({ varName, dependencies, statement, typeName, requiresImport }) => {
        dependencies
            .filter((dep) => !zodSchemaNames.includes(dep))
            .forEach((dep) => {
            if (const_1.standardBuiltInObjectVarNames.includes(dep)) {
                standardBuiltInObjects.add(dep);
            }
            else {
                zodSchemasWithMissingDependencies.add(dep);
                zodSchemasWithMissingDependencies.add(varName);
            }
        });
    });
    zodSchemaNames.push(...standardBuiltInObjects);
    zodSchemas.push(...Array.from(standardBuiltInObjects).map((obj) => {
        const typeName = obj[0].toUpperCase() + obj.substring(1, obj.length - 6);
        return Object.assign({ typeName, varName: obj }, (0, generateZodSchema_1.generateZodSchemaVariableStatement)({
            typeName,
            zodImportValue: "z",
            sourceFile,
            varName: obj,
            getDependencyName: getSchemaName,
            skipParseJSDoc,
        }));
    }));
    // Resolves statements order
    // A schema can't be declared if all the referenced schemas used inside this one are not previously declared.
    const statements = new Map();
    const typeImports = new Set();
    let done = false;
    // Loop until no more schemas can be generated and no more schemas with direct or indirect missing dependencies are found
    while (!done &&
        statements.size + zodSchemasWithMissingDependencies.size !==
            zodSchemas.length) {
        done = true;
        zodSchemas
            .filter(({ varName }) => !statements.has(varName) &&
            !zodSchemasWithMissingDependencies.has(varName))
            .forEach(({ varName, dependencies, statement, typeName, requiresImport }) => {
            const isCircular = dependencies.includes(varName);
            const notGeneratedDependencies = dependencies
                .filter((dep) => dep !== varName)
                .filter((dep) => !statements.has(dep));
            if (notGeneratedDependencies.length === 0) {
                done = false;
                if (isCircular) {
                    typeImports.add(typeName);
                    statements.set(varName, {
                        value: (0, transformRecursiveSchema_1.transformRecursiveSchema)("z", statement, typeName),
                        typeName,
                    });
                }
                else {
                    if (requiresImport) {
                        typeImports.add(typeName);
                    }
                    statements.set(varName, { value: statement, typeName });
                }
            }
            else if (
            // Check if every dependency is (in `zodSchemas` and not in `zodSchemasWithMissingDependencies`)
            !notGeneratedDependencies.every((dep) => zodSchemaNames.includes(dep) &&
                !zodSchemasWithMissingDependencies.has(dep))) {
                done = false;
                zodSchemasWithMissingDependencies.add(varName);
            }
        });
    }
    // Generate remaining schemas, which have circular dependencies with loop of length > 1 like: A->B—>C->A
    zodSchemas
        .filter(({ varName }) => !statements.has(varName) &&
        !zodSchemasWithMissingDependencies.has(varName))
        .forEach(({ varName, dependencies, statement, typeName, requiresImport }) => {
        typeImports.add(typeName);
        statements.set(varName, {
            value: (0, transformRecursiveSchema_1.transformRecursiveSchema)("z", statement, typeName),
            typeName,
        });
    });
    // Warn the user of possible not resolvable loops
    const errors = [];
    if (zodSchemasWithMissingDependencies.size > 0) {
        errors.push(`Some schemas can't be generated due to direct or indirect missing dependencies:
${Array.from(zodSchemasWithMissingDependencies).join("\n")}`);
    }
    // Create output files (zod schemas & integration tests)
    const printer = typescript_1.default.createPrinter({
        newLine: typescript_1.default.NewLineKind.LineFeed,
        removeComments: !keepComments,
    });
    const printerWithComments = typescript_1.default.createPrinter({
        newLine: typescript_1.default.NewLineKind.LineFeed,
    });
    const print = (node) => printer.printNode(typescript_1.default.EmitHint.Unspecified, node, sourceFile);
    const transformedSourceText = printerWithComments.printFile(sourceFile);
    const imports = Array.from(typeImports.values());
    const getZodSchemasFile = (typesImportPath) => `// Generated by ts-to-zod
import { z } from "zod";
${imports.length
        ? `import { ${imports.join(", ")} } from "${typesImportPath}";\n`
        : ""}
${Array.from(statements.values())
        .map((statement) => print(statement.value))
        .join("\n\n")}
`;
    const testCases = (0, generateIntegrationTests_1.generateIntegrationTests)(Array.from(statements.values())
        .filter(isExported)
        .map((i) => ({
        zodType: `${getSchemaName(i.typeName)}InferredType`,
        tsType: `spec.${i.typeName}`,
    })));
    const getIntegrationTestFile = (typesImportPath, zodSchemasImportPath) => `// Generated by ts-to-zod
import { z } from "zod";

import * as spec from "${typesImportPath}";
import * as generated from "${zodSchemasImportPath}";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function expectType<T>(_: T) {
  /* noop */
}

${Array.from(statements.values())
        .filter(isExported)
        .map((statement) => {
        // Generate z.infer<>
        const zodInferredSchema = (0, generateZodInferredType_1.generateZodInferredType)({
            aliasName: `${getSchemaName(statement.typeName)}InferredType`,
            zodConstName: `generated.${getSchemaName(statement.typeName)}`,
            zodImportValue: "z",
        });
        return print(zodInferredSchema);
    })
        .join("\n\n")}

${testCases.map(print).join("\n")}
`;
    return {
        /**
         * Source text with pre-process applied.
         */
        transformedSourceText,
        /**
         * Get the content of the zod schemas file.
         *
         * @param typesImportPath Relative path of the source file
         */
        getZodSchemasFile,
        /**
         * Get the content of the integration tests file.
         *
         * @param typesImportPath Relative path of the source file
         * @param zodSchemasImportPath Relative path of the zod schemas file
         */
        getIntegrationTestFile,
        /**
         * List of generation errors.
         */
        errors,
        /**
         * `true` if zodSchemaFile have some resolvable circular dependencies
         */
        hasCircularDependencies: imports.length > 0,
    };
}
exports.generate = generate;
/**
 * Helper to filter exported const declaration
 * @param i
 * @returns
 */
const isExported = (i) => { var _a; return (_a = i.value.modifiers) === null || _a === void 0 ? void 0 : _a.find((mod) => mod.kind === typescript_1.default.SyntaxKind.ExportKeyword); };
//# sourceMappingURL=generate.js.map