import React, { useCallback, useRef } from 'react'
import { CellComponent, Column, OperationResult } from '../types'

type ColumnData = {
  key: ColumnKey<any>
  id: string
  original: Partial<Column<any, any, any>>
}

const KeyComponent: CellComponent<any, ColumnData> = ({
  columnData: {
    key,
    id,

    original,
  },
  rowData,
  setRowData,
  ...rest
}) => {
  // We use a ref so useCallback does not produce a new setKeyData function every time the rowData changes
  const rowDataRef = useRef(rowData)
  rowDataRef.current = rowData

  // We wrap the setRowData function to assign the value to the desired key
  const setKeyData = useCallback(
    (value: any) => {
      setRowData(mergeRowDataWithKey(rowDataRef.current, key, id, value))
    },
    [id, key, setRowData]
  )

  if (!original.component) {
    return <></>
  }

  const Component = original.component

  return (
    <Component
      columnData={original.columnData}
      setRowData={setKeyData}
      // We only pass the value of the desired key, this is why each cell does not have to re-render everytime
      // another cell in the same row changes!
      rowData={getKeyRowData(rowData, key)}
      {...rest}
    />
  )
}

/**
 * Extracts the value from the data object based on the key or selector function
 *
 * @param rowData - Data object from which the value is extracted
 * @param key - Data key or selector function
 * @returns Selected value of type ResultType
 */
const getKeyRowData = <T extends Record<string, any>, K extends ColumnKey<T>>(
  rowData: T,
  key: K
): GetResultType<T, K> => {
  if (typeof key === 'function') {
    return key(rowData) as GetResultType<T, K>
  }

  if (typeof key === 'string') {
    if (key.includes('.')) {
      const keys = key.split('.')
      let result: any = rowData

      for (const k of keys) {
        if (result == null) return undefined as any
        result = result[k]
      }

      return result as GetResultType<T, K>
    }

    return rowData[key as keyof T] as GetResultType<T, K>
  }

  return null as never // Should never be reached
}

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
export const keyColumn = <
  T extends Record<string, any>,
  K extends ColumnKey<T>,
  PasteValue = string
>(
  selector: K,
  column: ConditionalColumn<T, K, PasteValue>
): ColumnReturn<T, ColumnData, PasteValue> => {
  // If the column has an id, we use it as the key
  const id = column.id ?? (selector as string)

  return {
    id: id,
    ...column,

    // We pass the key and the original column as columnData to be able to retrieve them in the cell component
    columnData: { key: selector, id, original: column },
    component: KeyComponent,
    // Here we simply wrap all functions to only pass the value of the desired key to the column, and not the entire row
    copyValue: ({ rowData, rowIndex }) =>
      column.copyValue?.({
        rowData: getKeyRowData(rowData, selector),
        rowIndex,
      }) ?? null,

    deleteValue: ({ rowData, rowIndex }) =>
      mergeRowDataWithKey(
        rowData,
        selector,
        id,
        column.deleteValue?.({
          rowData: getKeyRowData(rowData, selector),
          rowIndex,
        }) ?? null
      ),
    pasteValue: ({ rowData, value, rowIndex }) =>
      mergeRowDataWithKey(
        rowData,
        selector,
        id,

        column.pasteValue?.({
          rowData: getKeyRowData(rowData, selector),
          value,
          rowIndex,
        }) ?? null
      ),

    disabled:
      typeof column.disabled === 'function'
        ? ({ rowData, rowIndex }) => {
            return typeof column.disabled === 'function'
              ? column.disabled({
                  rowData: getKeyRowData(rowData, selector),
                  rowIndex,
                })
              : column.disabled ?? false
          }
        : column.disabled,
    cellClassName:
      typeof column.cellClassName === 'function'
        ? ({ rowData, rowIndex, columnId }) => {
            return typeof column.cellClassName === 'function'
              ? column.cellClassName({
                  rowData: getKeyRowData(rowData, selector),
                  rowIndex,
                  columnId,
                })
              : column.cellClassName ?? undefined
          }
        : column.cellClassName,
    isCellEmpty: ({ rowData, rowIndex }) =>
      column.isCellEmpty?.({
        rowData: getKeyRowData(rowData, selector),
        rowIndex,
      }) ?? false,

    interactive:
      typeof column.interactive === 'function'
        ? ({ rowData, rowIndex }) => {
            return typeof column.interactive === 'function'
              ? column.interactive({
                  rowData: getKeyRowData(rowData, selector),
                  rowIndex,
                })
              : column.interactive ?? false
          }
        : column.interactive,

    onCellKeyDown(opt, e) {
      if (column.onCellKeyDown && selector) {
        column.onCellKeyDown(
          {
            ...opt,
            rowData: getKeyRowData(opt.rowData, selector),
          },
          e
        )
      }
    },
  }
}

// Example for usage:
// column((s) => s.packaging?.height, { component: (o) => o.rowData })

// Modified NestedKey type to better handle nullable objects
export type NestedKey<Obj, Depth extends number = 3> = Depth extends 0
  ? never
  : {
      [K in keyof Obj & string]: Obj[K] extends
        | Record<string, any>
        | null
        | undefined
        ? NestedKey<NonNullable<Obj[K]>, Decrement<Depth>> extends infer R
          ? [R] extends [never]
            ? `${K}`
            : `${K}` | `${K}.${Extract<R, string>}`
          : never
        : `${K}`
    }[keyof Obj & string]

// Adjusted NestedValue to handle potential nulls
type NestedValue<T, K extends string> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? T[First] extends Record<string, any> | null | undefined
      ? Rest extends NestedKey<NonNullable<T[First]>>
        ? NestedValue<NonNullable<T[First]>, Rest>
        : undefined
      : undefined
    : undefined
  : K extends keyof T
  ? T[K]
  : undefined

type Decrement<T extends number> = T extends 3
  ? 2
  : T extends 2
  ? 1
  : T extends 1
  ? 0
  : never

// Helper function to determine the result type based on the key
type GetResultType<T extends Record<string, any>, K> = K extends (
  rowData: T
) => infer R
  ? R
  : K extends keyof T
  ? T[K]
  : K extends NestedKey<T>
  ? NestedValue<T, Extract<K, string>>
  : never

// Schlüsseltyp, der alle möglichen Optionen umfasst
type ColumnKey<T extends Record<string, any>> =
  | keyof T
  | NestedKey<T>
  | ((rowData: T) => any)

// Typ für die zurückgegebene Spalte
type ColumnReturn<
  T extends Record<string, any>,
  ColumnData,
  PasteValue = string
> = Partial<Column<T, ColumnData, PasteValue>>

const mergeRowDataWithKey = <T extends Record<string, any>>(
  rowData: T,
  key: ColumnKey<T>,
  id: string,
  newValue: any
): OperationResult<T> => {
  const res = (obj: any) => ({
    ...obj,
    $operationValue: {
      ...obj.$operationValue,
      [id]: newValue,
    },
  })
  if (typeof key === 'string') {
    // Check if the key is an indirect key
    if (key in rowData) res({ ...rowData, [key]: newValue })

    const keys = key.split('.')
    let result: any = rowData
    let isValidIndirectKey = true

    for (const k of keys) {
      if (result == null || typeof result !== 'object' || !(k in result)) {
        isValidIndirectKey = false
        break
      }
      result = result[k]
    }

    if (isValidIndirectKey) {
      const mergeDeep = (obj: any, path: string[], value: any) => {
        if (path.length === 1) {
          obj[path[0]] = value
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const key = path.shift()!
        if (!(key in obj) || typeof obj[key] !== 'object') {
          obj[key] = {}
        }

        mergeDeep(obj[key], path, value)
      }

      const newData = structuredClone(rowData)
      mergeDeep(newData, keys, newValue)

      return res(newData)
    }

    // Check if the key is a direct key
  }

  return res(rowData)
}

// Conditional Column types based on K
type ConditionalColumn<
  T extends Record<string, any>,
  K,
  PasteValue = string
> = Partial<Column<GetResultType<T, K>, any, PasteValue>> &
  (K extends (rowData: T) => any ? { id: string } : { id?: string })
/**
 * Creates a column with a key and a column definition
 * @param key - Key of the column
 * @param column - Column definition
 * @returns Column definition with key and original column
 * @description It is important to note that, if the key is a function, on an update, the updated value is not returned in a prop, but as "operationValue" in the operation object.
 */
