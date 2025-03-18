import React, { useCallback, useRef } from 'react'
import { CellComponent, Column } from '../types'

type ColumnData = { key: string; original: Partial<Column<any, any, any>> }

const KeyComponent: CellComponent<any, ColumnData> = ({
  columnData: { key, original },
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
      setRowData({ ...rowDataRef.current, [key]: value })
    },
    [key, setRowData]
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
      rowData={rowData[key]}
      {...rest}
    />
  )
}
export const keyColumn = <
  T extends Record<string, any>,
  K extends keyof T = keyof T,
  PasteValue = string
>(
  key: K,
  column: Partial<Column<T[K], any, PasteValue>>
): Partial<Column<T, ColumnData, PasteValue>> => ({
  id: key as string,
  ...column,
  // We pass the key and the original column as columnData to be able to retrieve them in the cell component
  columnData: { key: key as string, original: column },
  component: KeyComponent,
  // Here we simply wrap all functions to only pass the value of the desired key to the column, and not the entire row
  copyValue: ({ rowData, rowIndex }) =>
    column.copyValue?.({ rowData: rowData[key], rowIndex }) ?? null,
  deleteValue: ({ rowData, rowIndex }) => ({
    ...rowData,
    [key]: column.deleteValue?.({ rowData: rowData[key], rowIndex }) ?? null,
  }),
  pasteValue: ({ rowData, value, rowIndex }) => ({
    ...rowData,
    [key]:
      column.pasteValue?.({ rowData: rowData[key], value, rowIndex }) ?? null,
  }),
  disabled:
    typeof column.disabled === 'function'
      ? ({ rowData, rowIndex }) => {
          return typeof column.disabled === 'function'
            ? column.disabled({ rowData: rowData[key], rowIndex })
            : column.disabled ?? false
        }
      : column.disabled,
  cellClassName:
    typeof column.cellClassName === 'function'
      ? ({ rowData, rowIndex, columnId }) => {
          return typeof column.cellClassName === 'function'
            ? column.cellClassName({
                rowData: rowData[key],
                rowIndex,
                columnId,
              })
            : column.cellClassName ?? undefined
        }
      : column.cellClassName,
  isCellEmpty: ({ rowData, rowIndex }) =>
    column.isCellEmpty?.({ rowData: rowData[key], rowIndex }) ?? false,

  onCellKeyDown: ({ rowData, rowId, columnId, ...props }, e) =>
    column.onCellKeyDown?.(
      { rowData: rowData[key], rowId, columnId, ...props },
      e
    ),
  interactive:
    typeof column.interactive === 'function'
      ? ({ rowData, rowIndex }) => {
          return typeof column.interactive === 'function'
            ? column.interactive({ rowData: rowData[key], rowIndex })
            : column.interactive ?? false
        }
      : column.interactive,
})

// Type as path of TransferInboundFailedEvent
export type NestedKey<Obj, Depth extends number = 3> = Depth extends 0
  ? never
  : {
      [K in keyof Obj & string]: Obj[K] extends Record<string, any>
        ? NestedKey<Obj[K], Decrement<Depth>> extends infer R
          ? [R] extends [never]
            ? `${K}`
            : `${K}` | `${K}.${Extract<R, string>}`
          : never
        : `${K}`
    }[keyof Obj & string]

type Decrement<T extends number> = T extends 3
  ? 2
  : T extends 2
  ? 1
  : T extends 1
  ? 0
  : never
