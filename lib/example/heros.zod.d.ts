import { z } from "zod";
export declare const stdBaseObjectSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const stdObjectSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const baseSchema: z.ZodObject<z.extendShape<{
    id: z.ZodString;
}, {
    createdAt: z.ZodDate;
}>, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
}, {
    id: string;
    createdAt: Date;
}>;
export declare const thirdPartyBaseSchema: z.ZodObject<z.extendShape<{
    id: z.ZodString;
}, {
    thirdPartyEntityId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    thirdPartyId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}>, "strip", z.ZodTypeAny, {
    thirdPartyEntityId?: string | null | undefined;
    thirdPartyId?: string | null | undefined;
    id: string;
}, {
    thirdPartyEntityId?: string | null | undefined;
    thirdPartyId?: string | null | undefined;
    id: string;
}>;
