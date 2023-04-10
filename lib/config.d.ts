export interface SimplifiedJSDocTag {
    /**
     * Name of the tag
     *
     * @ref tag.tagName.escapedText.toString()
     */
    name: string;
    /**
     * Value of the tag
     *
     * @ref tag.comment
     */
    value?: string;
}
export declare type GetSchemaName = (identifier: string) => string;
export declare type NameFilter = (name: string) => boolean;
export declare type JSDocTagFilter = (tags: SimplifiedJSDocTag[]) => boolean;
export declare type Config = {
    /**
     * Path of the input file (types source)
     */
    input: string;
    /**
     * Path of the output file (generated zod schemas)
     */
    output: string;
    /**
     * Skip the validation step (not recommended)
     */
    skipValidation?: boolean;
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
    getSchemaName?: GetSchemaName;
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
};
export declare type Configs = Array<Config & {
    /**
     * Name of the config.
     *
     * Usage: `ts-to-zod --config {name}`
     */
    name: string;
}>;
export declare type TsToZodConfig = Config | Configs;
