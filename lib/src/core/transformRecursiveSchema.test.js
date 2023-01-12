"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typescript_1 = (0, tslib_1.__importDefault)(require("typescript"));
const findNode_1 = require("../utils/findNode");
const transformRecursiveSchema_1 = require("./transformRecursiveSchema");
describe("transformRecursiveSchema", () => {
    it("should wrap the variable declaration with the appropriate syntax", () => {
        const sourceFile = typescript_1.default.createSourceFile("index.ts", `export const categorySchema = z.object({
      name: z.string(),
      subcategories: z.array(categorySchema),
    })`, typescript_1.default.ScriptTarget.Latest);
        const declaration = (0, findNode_1.findNode)(sourceFile, typescript_1.default.isVariableStatement);
        if (!declaration) {
            fail("should have a variable declaration");
        }
        const output = (0, transformRecursiveSchema_1.transformRecursiveSchema)("z", declaration, "Category");
        const printer = typescript_1.default.createPrinter({ newLine: typescript_1.default.NewLineKind.LineFeed });
        expect(printer.printNode(typescript_1.default.EmitHint.Unspecified, output, sourceFile))
            .toMatchInlineSnapshot(`
      "export const categorySchema: z.ZodSchema<Category> = z.lazy(() => z.object({
          name: z.string(),
          subcategories: z.array(categorySchema),
      }));"
    `);
    });
    it("should throw if the statement is not valid", () => {
        const sourceFile = typescript_1.default.createSourceFile("index.ts", `export const categorySchema;
    })`, typescript_1.default.ScriptTarget.Latest);
        const declaration = (0, findNode_1.findNode)(sourceFile, typescript_1.default.isVariableStatement);
        if (!declaration) {
            fail("should have a variable declaration");
        }
        expect(() => (0, transformRecursiveSchema_1.transformRecursiveSchema)("z", declaration, "Category")).toThrowErrorMatchingInlineSnapshot(`"Unvalid zod statement"`);
    });
});
//# sourceMappingURL=transformRecursiveSchema.test.js.map