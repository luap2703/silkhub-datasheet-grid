import React, { useMemo } from 'react'
import {
  CellProps,
  Column,
  ColumnVisibilityModel,
  SimpleColumn,
} from '../types'

const defaultComponent = () => <></>
const defaultIsCellEmpty = () => false
const identityRow = <T extends any>({ rowData }: { rowData: T }) => rowData
const defaultCopyValue = () => null
const defaultGutterComponent = ({ rowIndex }: CellProps<any, any>) => (
  <>{rowIndex + 1}</>
)
const cellAlwaysEmpty = () => true
const defaultPrePasteValues = (values: string[]) => values

export const parseFlexValue = (value: string | number) => {
  if (typeof value === 'number') {
    return {
      basis: 0,
      grow: value,
      shrink: 1,
    }
  }

  if (value.match(/^ *\d+(\.\d*)? *$/)) {
    return {
      basis: 0,
      grow: parseFloat(value.trim()),
      shrink: 1,
    }
  }

  if (value.match(/^ *\d+(\.\d*)? *px *$/)) {
    return {
      basis: parseFloat(value.trim()),
      grow: 1,
      shrink: 1,
    }
  }

  if (value.match(/^ *\d+(\.\d*)? \d+(\.\d*)? *$/)) {
    const [grow, shrink] = value.trim().split(' ')
    return {
      basis: 0,
      grow: parseFloat(grow),
      shrink: parseFloat(shrink),
    }
  }

  if (value.match(/^ *\d+(\.\d*)? \d+(\.\d*)? *px *$/)) {
    const [grow, basis] = value.trim().split(' ')
    return {
      basis: parseFloat(basis),
      grow: parseFloat(grow),
      shrink: 1,
    }
  }

  if (value.match(/^ *\d+(\.\d*)? \d+(\.\d*)? \d+(\.\d*)? *px *$/)) {
    const [grow, shrink, basis] = value.trim().split(' ')
    return {
      basis: parseFloat(basis),
      grow: parseFloat(grow),
      shrink: parseFloat(shrink),
    }
  }

  return {
    basis: 0,
    grow: 1,
    shrink: 1,
  }
}

export const useColumns = <T extends any>(
  columns: Partial<Column<T, any, any>>[],
  gutterColumn?: SimpleColumn<T, any> | false,
  columnVisibilityModel?: ColumnVisibilityModel
): Column<T, any, any>[] => {
  return useMemo<Column<T, any, any>[]>(() => {
    const visibleColumns = columns.filter(
      (column) => !column.id || !columnVisibilityModel?.has(column.id)
    )
    const rightStickyColumns = visibleColumns.filter(
      (column) => column.sticky === 'right'
    )
    const leftStickyColumns = visibleColumns.filter(
      (column) => column.sticky === 'left'
    )

    const _gutterColumn: Partial<Column<T, any, any>> =
      gutterColumn === false
        ? {
            basis: 0,
            grow: 0,
            shrink: 0,
            minWidth: 0,
            // eslint-disable-next-line react/display-name
            component: () => <></>,
            headerClassName: 'dsg-hidden-cell',
            cellClassName: 'dsg-hidden-cell',
            isCellEmpty: cellAlwaysEmpty,
            disablePadding: true,

            sticky: leftStickyColumns.length ? 'left' : undefined,
          }
        : {
            ...gutterColumn,
            basis: gutterColumn?.basis ?? 40,
            grow: gutterColumn?.grow ?? 0,
            shrink: gutterColumn?.shrink ?? 0,
            minWidth: gutterColumn?.minWidth ?? 0,
            title:
              gutterColumn?.title ??
              (() => <div className="dsg-corner-indicator" />),
            disablePadding: true,
            component: gutterColumn?.component ?? defaultGutterComponent,
            isCellEmpty: cellAlwaysEmpty,

            sticky: leftStickyColumns.length ? 'left' : undefined,
          }

    const partialColumns: Partial<Column<T, any, any>>[] =
      visibleColumns.filter((column) => column.sticky === undefined)

    if (rightStickyColumns) {
      partialColumns.push(
        ...rightStickyColumns.map((column) => ({
          ...column,
          basis: column.basis ?? column.minWidth ?? 40,
          grow: column.grow ?? 0,
          shrink: column.shrink ?? 0,
          minWidth: column.minWidth ?? 0,
          isCellEmpty: cellAlwaysEmpty,
        }))
      )
    }

    if (leftStickyColumns) {
      partialColumns.unshift(
        ...leftStickyColumns.map((column) => ({
          ...column,
          basis: column.basis ?? 40,
          grow: column.grow ?? 0,
          shrink: column.shrink ?? 0,
          minWidth: column.minWidth ?? 0,
          isCellEmpty: cellAlwaysEmpty,
        }))
      )
    }

    partialColumns.unshift(_gutterColumn)

    return partialColumns.map<Column<T, any, any>>((column) => {
      const legacyWidth =
        column.width !== undefined
          ? parseFlexValue(column.width)
          : {
              basis: undefined,
              grow: undefined,
              shrink: undefined,
            }

      return {
        ...column,
        basis: column.basis ?? legacyWidth.basis ?? 0,
        grow: column.grow ?? legacyWidth.grow ?? 1,
        shrink: column.shrink ?? legacyWidth.shrink ?? 1,
        minWidth: column.minWidth ?? 100,
        component: column.component ?? defaultComponent,
        disableKeys: column.disableKeys ?? false,
        disabled: column.disabled ?? false,
        keepFocus: column.keepFocus ?? false,
        deleteValue: column.deleteValue ?? identityRow,
        copyValue: column.copyValue ?? defaultCopyValue,
        pasteValue: column.pasteValue ?? identityRow,
        prePasteValues: column.prePasteValues ?? defaultPrePasteValues,
        isCellEmpty: column.isCellEmpty ?? defaultIsCellEmpty,
        disableEditing: column.disableEditing ?? true,
        disablePadding: column.disablePadding ?? false,
        interactive: column.interactive ?? false,
      }
    })
  }, [columns, gutterColumn, columnVisibilityModel])
}
