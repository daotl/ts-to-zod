export declare namespace std {
    interface BaseObject {
        "id": string;
    }
    interface $Object extends BaseObject {
    }
    interface FreeObject extends BaseObject {
    }
    type JsonEmpty = "ReturnEmpty" | "ReturnTarget" | "Error" | "UseNull" | "DeleteKey";
}
export interface Base extends std.$Object {
    "createdAt": Date;
}
export interface ThirdPartyBase extends std.$Object {
    "thirdPartyEntityId"?: string | null;
    "thirdPartyId"?: string | null;
}
export interface User extends Base, ThirdPartyBase {
    "email": string;
    "idCardBackPhoto"?: Map<string, string> | null;
    "idCardFrontPhoto"?: Set<string> | null;
    "organizationLicensePhoto"?: Uint8Array | null;
    "organizationName"?: string | null;
    "password"?: string | null;
    "privKey"?: string | null;
    "pubKey"?: string | null;
    "socialCreditCode"?: string | null;
}
