import { Column } from '../types';
type ColumnData = {
    key: ColumnKey<any>;
    id: string;
    original: Partial<Column<any, any, any>>;
};
/**
 * @param selector - The selector of the column. This can be:
 *   - A direct key
 *   - A nested key
 *   - A selector function
 *
 * Important: If the selector is a function, it must return a value of type T.
 * If the selector is a string, it serves as a fallback key if no id is specified.
 *
 * **Important**: Since we cannot map the selector (or arbitrary id) to the row data back
 * on changes, we pass the updated value in an $operationValue object. This ensures that the
 * value is not lost when the row data is updated.
 *
 * @param column - The column definition to be used.
 * @returns - Returns a ColumnReturn object.
 */
export declare const keyColumn: <T extends Record<string, any>, K extends ColumnKey<T>, PasteValue = string>(selector: K, column: ConditionalColumn<T, K, PasteValue>) => ColumnReturn<T, ColumnData, PasteValue>;
export type NestedKey<Obj, Depth extends number = 3> = Depth extends 0 ? never : {
    [K in keyof Obj & string]: Obj[K] extends Record<string, any> | null | undefined ? NestedKey<NonNullable<Obj[K]>, Decrement<Depth>> extends infer R ? [R] extends [never] ? `${K}` : `${K}` | `${K}.${Extract<R, string>}` : never : `${K}`;
}[keyof Obj & string];
type NestedValue<T, K extends string> = K extends `${infer First}.${infer Rest}` ? First extends keyof T ? T[First] extends Record<string, any> | null | undefined ? Rest extends NestedKey<NonNullable<T[First]>> ? NestedValue<NonNullable<T[First]>, Rest> : undefined : undefined : undefined : K extends keyof T ? T[K] : undefined;
type Decrement<T extends number> = T extends 3 ? 2 : T extends 2 ? 1 : T extends 1 ? 0 : never;
type GetResultType<T extends Record<string, any>, K> = K extends (rowData: T) => infer R ? R : K extends keyof T ? T[K] : K extends NestedKey<T> ? NestedValue<T, Extract<K, string>> : never;
type ColumnKey<T extends Record<string, any>> = keyof T | NestedKey<T> | ((rowData: T) => any);
type ColumnReturn<T extends Record<string, any>, ColumnData, PasteValue = string> = Partial<Column<T, ColumnData, PasteValue>>;
type ConditionalColumn<T extends Record<string, any>, K, PasteValue = string> = Partial<Column<GetResultType<T, K>, any, PasteValue>> & (K extends (rowData: T) => any ? {
    id: string;
} : {
    id?: string;
});
export {};
/**
 * Creates a column with a key and a column definition
 * @param key - Key of the column
 * @param column - Column definition
 * @returns Column definition with key and original column
 * @description It is important to note that, if the key is a function, on an update, the updated value is not returned in a prop, but as "operationValue" in the operation object.
 */
//# sourceMappingURL=keyColumn.d.ts.map