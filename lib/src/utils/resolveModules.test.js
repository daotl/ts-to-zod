"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typescript_1 = (0, tslib_1.__importDefault)(require("typescript"));
const resolveModules_1 = require("./resolveModules");
describe("resolveModules", () => {
    it("should prefix interface", () => {
        const sourceText = `export namespace Metropolis {
      export interface Superman {
        name: string;
        hasPower: boolean;
      }
    }`;
        expect(print((0, resolveModules_1.resolveModules)(sourceText))).toMatchInlineSnapshot(`
      "export interface MetropolisSuperman {
          name: string;
          hasPower: boolean;
      }
      "
    `);
    });
    it("should prefix type", () => {
        const sourceText = `export namespace Metropolis {
      export type Name = "superman" | "clark kent" | "kal-l";
    }`;
        expect(print((0, resolveModules_1.resolveModules)(sourceText))).toMatchInlineSnapshot(`
      "export type MetropolisName = \\"superman\\" | \\"clark kent\\" | \\"kal-l\\";
      "
    `);
    });
    it("should prefix enum", () => {
        const sourceText = `export namespace Metropolis {
      export enum Superhero { 
        Superman = "superman",
        ClarkKent = "clark_kent",
      };
    }`;
        expect(print((0, resolveModules_1.resolveModules)(sourceText))).toMatchInlineSnapshot(`
      "export enum MetropolisSuperhero {
          Superman = \\"superman\\",
          ClarkKent = \\"clark_kent\\"
      }
      ;
      "
    `);
    });
    it("should prefix every type references", () => {
        const sourceText = `
    export type Weakness = "krytonite" | "lois"

    export namespace Metropolis {
      export type Name = string;

      export type BadassSuperman = Omit<Superman, "underKryptonite">;

      export interface Superman {
        fullName: Name;
        name: { first: Name; last: Name };
        hasPower: boolean;
        weakness: Weakness;
      }

      export interface Clark {
        hasGlasses: boolean
      }
      
      export type SupermanBis = {
        fullName: Name;
        name: { first: Name; last: Name };
        hasPower: boolean;
        weakness: Weakness;
      }

      export interface ExtendedSuperman extends Superman, Clark {
        hasEvenMorePower: boolean;
      }
    }`;
        expect(print((0, resolveModules_1.resolveModules)(sourceText))).toMatchInlineSnapshot(`
      "export type Weakness = \\"krytonite\\" | \\"lois\\";
      export type MetropolisName = string;
      export type MetropolisBadassSuperman = Omit<MetropolisSuperman, \\"underKryptonite\\">;
      export interface MetropolisSuperman {
          fullName: MetropolisName;
          name: {
              first: MetropolisName;
              last: MetropolisName;
          };
          hasPower: boolean;
          weakness: Weakness;
      }
      export interface MetropolisClark {
          hasGlasses: boolean;
      }
      export type MetropolisSupermanBis = {
          fullName: MetropolisName;
          name: {
              first: MetropolisName;
              last: MetropolisName;
          };
          hasPower: boolean;
          weakness: Weakness;
      };
      export interface MetropolisExtendedSuperman extends MetropolisSuperman, MetropolisClark {
          hasEvenMorePower: boolean;
      }
      "
    `);
    });
});
const printer = typescript_1.default.createPrinter({ newLine: typescript_1.default.NewLineKind.LineFeed });
const print = (sourceFile) => printer.printFile(sourceFile);
//# sourceMappingURL=resolveModules.test.js.map