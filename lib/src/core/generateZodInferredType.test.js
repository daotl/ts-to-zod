"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typescript_1 = (0, tslib_1.__importDefault)(require("typescript"));
const generateZodInferredType_1 = require("./generateZodInferredType");
describe("generateZodInferredType", () => {
    it("should generate inferred type zod schema", () => {
        const sourceFile = typescript_1.default.createSourceFile("index.ts", `export const supermanSchema = z.object({
      name: z.string(),
    })`, typescript_1.default.ScriptTarget.Latest);
        const output = (0, generateZodInferredType_1.generateZodInferredType)({
            aliasName: "Superman",
            zodConstName: "supermanSchema",
            zodImportValue: "z",
        });
        const printer = typescript_1.default.createPrinter({ newLine: typescript_1.default.NewLineKind.LineFeed });
        expect(printer.printNode(typescript_1.default.EmitHint.Unspecified, output, sourceFile)).toMatchInlineSnapshot(`"export type Superman = z.infer<typeof supermanSchema>;"`);
    });
});
//# sourceMappingURL=generateZodInferredType.test.js.map