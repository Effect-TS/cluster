/**
 * @since 1.0.0
 */
export type JsonArray = ReadonlyArray<JsonData>;
/**
 * @since 1.0.0
 */
export type JsonObject = {
    readonly [key: string]: JsonData;
};
/**
 * @since 1.0.0
 */
export type JsonData = null | boolean | number | string | JsonArray | JsonObject;
//# sourceMappingURL=utils.d.ts.map