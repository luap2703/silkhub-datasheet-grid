import React, { useMemo } from 'react'
import { VirtualItem, Virtualizer } from '@tanstack/react-virtual'
import {
  Cell,
  Column,
  ContextMenuItem,
  DataSheetGridProps,
  GroupRowComponent,
  GroupRowComponentProps,
  RowType,
} from '../types'
import { Cell as CellComponent } from './Cell'
import cx from 'classnames'

export const GridGroupRow = <T extends RowType>({
  colVirtualizer,
  columns,
  data,
  row,
  rowIndex,
  loading,
  LoadingComponent,
  hasStickyLeftColumn,
  hasStickyRightColumn,
  activeCell,
  editing,
  getContextMenuItems,
  deleteGivenRow,
  duplicateGivenRow,
  stopEditing,
  insertAfterGivenRow,
  setGivenRowData,
  rowSelected,
  selectRows,
  toggleGivenRow,
  getRowId,
  table,
  groupRowComponentProps,
  GroupRowComponent,
  cellClassName,

  fullWidth,
  rowActive,
}: {
  colVirtualizer: Virtualizer<HTMLDivElement, Element>
  columns: Column<T, any, any>[]
  data: T[]
  row: { key: React.Key; index: number; size: number; start: number }
  rowIndex: number
  loading?: boolean
  LoadingComponent: React.ReactNode
  hasStickyLeftColumn: boolean
  hasStickyRightColumn: boolean
  activeCell: Cell | null
  editing: boolean
  getContextMenuItems: () => ContextMenuItem[]
  deleteGivenRow: (index: number) => () => void
  duplicateGivenRow: (index: number) => () => void
  stopEditing: (opts?: { nextRow?: boolean }) => void
  insertAfterGivenRow: (index: number) => () => void
  setGivenRowData: (index: number) => (rowData: T) => void
  rowSelected?: boolean
  selectRows: (rowSelection: string[] | ((prev: string[]) => string[])) => void
  toggleGivenRow: (index: number) => () => void
  getRowId: (rowIndex: number) => React.Key
  table: any
  groupRowComponentProps?: GroupRowComponentProps<T>
  GroupRowComponent: GroupRowComponent<T>

  cellClassName: DataSheetGridProps<T>['cellClassName']

  rowActive: boolean
  fullWidth: boolean
}) => {
  const firstCol: undefined | VirtualItem<HTMLDivElement> =
    colVirtualizer.getVirtualItems()?.[0]
  const lastCol: undefined | VirtualItem<HTMLDivElement> =
    colVirtualizer.getVirtualItems()[
      colVirtualizer.getVirtualItems().length - 1
    ]

  const keepLeftRows = groupRowComponentProps?.keepColsLeft ?? 0
  const keepRightRows = groupRowComponentProps?.keepColsRight ?? 0

  const leftOffset =
    colVirtualizer.getVirtualItems()?.[keepLeftRows + 1]?.start ??
    colVirtualizer.getVirtualItems()?.[keepLeftRows]?.start ??
    0

  const cols = colVirtualizer.getVirtualItems()
  const totalSize = colVirtualizer.getTotalSize()
  const width = useMemo(() => {
    const lastCol = Math.min(
      columns.length - 1 - keepRightRows,
      cols.length - 1 - keepRightRows
    )
    return (
      // Get the size until the keepColRight
      cols[lastCol].start + cols[lastCol].size - cols?.[keepLeftRows + 1]?.start
    )
  }, [totalSize, cols, keepLeftRows, keepRightRows, columns])

  console.log(
    'widths',

    cols.map((c) => c.start),
    cols.reduce((acc, c) => acc + c.size, 0),

    totalSize,
    width
  )

  const groupCellClassName = groupRowComponentProps?.cellClassName

  return (
    <>
      {colVirtualizer
        .getVirtualItems()
        .filter((i) => i.index <= keepLeftRows)
        .map((col) => {
          const colCellClassName = columns[col.index].cellClassName
          const disabled = columns[col.index].disabled
          const Component = columns[col.index].component
          const cellDisabled =
            disabled === true ||
            (typeof disabled === 'function' &&
              disabled({
                rowData: data[row.index],
                rowIndex: row.index,
              }))

          const interactive = columns[col.index].interactive
          const cellInteractive =
            interactive === true ||
            (typeof interactive === 'function' &&
              interactive({
                rowData: data[row.index],
                rowIndex: row.index,
              }))

          const cellIsActive =
            activeCell?.row === row.index && activeCell.col === col.index - 1

          const isStickyLeft =
            hasStickyLeftColumn && columns[col.index].sticky === 'left'

          const isLoading = loading || data[row.index] === null

          if (isLoading && col.index === 0) return null

          return (
            <CellComponent
              key={col.key}
              gutter={!isLoading && col.index === 0}
              stickyRight={
                hasStickyRightColumn && col.index === columns.length - 1
              }
              stickyLeft={isStickyLeft}
              active={col.index === 0 && rowActive}
              disabled={cellDisabled}
              interactive={cellInteractive}
              padding={!columns[col.index].disablePadding && col.index !== 0}
              className={cx(
                !isLoading
                  ? typeof colCellClassName === 'function' // Disable when isLoading to prevent any special behavior for isLoading view
                    ? colCellClassName({
                        rowData: data[row.index],
                        rowIndex: row.index,
                        columnId: columns[col.index].id,
                      })
                    : colCellClassName
                  : undefined,
                !isLoading
                  ? typeof cellClassName === 'function'
                    ? cellClassName({
                        rowData: data[row.index],
                        rowIndex: row.index,
                        columnId: columns[col.index].id,
                      })
                    : cellClassName
                  : undefined
              )}
              width={col.size}
              left={col.start}
            >
              {loading || data[rowIndex] === null ? (
                LoadingComponent
              ) : (
                <Component
                  rowData={data[row.index]}
                  getContextMenuItems={getContextMenuItems}
                  disabled={cellDisabled}
                  rowId={row.key.toString()}
                  active={cellIsActive}
                  columnIndex={col.index - 1}
                  rowIndex={row.index}
                  focus={cellIsActive && editing}
                  deleteRow={deleteGivenRow(row.index)}
                  duplicateRow={duplicateGivenRow(row.index)}
                  stopEditing={stopEditing}
                  insertRowBelow={insertAfterGivenRow(row.index)}
                  setRowData={setGivenRowData(row.index)}
                  columnData={columns[col.index].columnData}
                  selected={Boolean(rowSelected)}
                  selectRows={selectRows}
                  toggleSelection={toggleGivenRow(row.index)}
                  getRowId={getRowId}
                  table={table}
                />
              )}
            </CellComponent>
          )
        })}
      <CellComponent
        gutter={false}
        stickyRight={false}
        stickyLeft={
          // If the replaced column (i.e., the column after keepLeftRows, is still sticky)
          false
        }
        // Width and right should be the remaining cols that are now replaced by the group row
        width={width}
        left={leftOffset}
        className={cx(
          'dsg-cell-subheader',
          Boolean(rowSelected) && 'dsg-cell-subheader-selected',
          activeCell?.row === rowIndex && 'dsg-cell-subheader-active',
          typeof groupCellClassName === 'function'
            ? groupCellClassName({
                rowData: data[rowIndex],
                rowIndex: rowIndex,
              })
            : groupCellClassName
        )}
        disabled={
          (groupRowComponentProps?.disabled === true ||
            (typeof groupRowComponentProps?.disabled === 'function' &&
              groupRowComponentProps.disabled({
                rowData: data[rowIndex],
                rowIndex: rowIndex,
              }))) ??
          undefined
        }
        interactive={
          (groupRowComponentProps?.interactive === true ||
            (typeof groupRowComponentProps?.interactive === 'function' &&
              groupRowComponentProps.interactive({
                rowData: data[rowIndex],
                rowIndex: rowIndex,
              }))) ??
          undefined
        }
      >
        {loading || data[rowIndex] === null ? (
          LoadingComponent
        ) : (
          <GroupRowComponent rowData={data[rowIndex]} rowIndex={rowIndex} />
        )}
      </CellComponent>

      {colVirtualizer
        .getVirtualItems()
        .filter((i) => i.index > columns.length - 1 - keepRightRows)
        .map((col) => {
          const colCellClassName = columns[col.index].cellClassName
          const cellClassName = columns[col.index].cellClassName
          const disabled = columns[col.index].disabled
          const Component = columns[col.index].component
          const cellDisabled =
            disabled === true ||
            (typeof disabled === 'function' &&
              disabled({
                rowData: data[rowIndex],
                rowIndex: rowIndex,
              }))

          const interactive = columns[col.index].interactive
          const cellInteractive =
            interactive === true ||
            (typeof interactive === 'function' &&
              interactive({
                rowData: data[rowIndex],
                rowIndex: rowIndex,
              }))

          const cellIsActive =
            activeCell?.row === rowIndex && activeCell.col === col.index - 1

          const isStickyLeft =
            hasStickyLeftColumn && columns[col.index].sticky === 'left'

          const isLoading = loading || data[rowIndex] === null

          if (isLoading && col.index === 0) return null

          return (
            <CellComponent
              key={col.key}
              gutter={!isLoading && col.index === 0}
              stickyRight={
                hasStickyRightColumn && col.index === columns.length - 1
              }
              stickyLeft={isStickyLeft}
              active={col.index === 0 && rowActive}
              disabled={cellDisabled}
              interactive={cellInteractive}
              padding={!columns[col.index].disablePadding && col.index !== 0}
              className={cx(
                !isLoading
                  ? typeof colCellClassName === 'function' // Disable when isLoading to prevent any special behavior for isLoading view
                    ? colCellClassName({
                        rowData: data[row.index],
                        rowIndex: row.index,
                        columnId: columns[col.index].id,
                      })
                    : colCellClassName
                  : undefined,
                !isLoading
                  ? typeof cellClassName === 'function'
                    ? cellClassName({
                        rowData: data[row.index],
                        rowIndex: row.index,
                        columnId: columns[col.index].id,
                      })
                    : cellClassName
                  : undefined
              )}
              width={col.size}
              left={col.start}
            >
              {loading || data[rowIndex] === null ? (
                LoadingComponent
              ) : (
                <Component
                  rowData={data[row.index]}
                  getContextMenuItems={getContextMenuItems}
                  disabled={cellDisabled}
                  rowId={row.key.toString()}
                  active={cellIsActive}
                  columnIndex={col.index - 1}
                  rowIndex={row.index}
                  focus={cellIsActive && editing}
                  deleteRow={deleteGivenRow(row.index)}
                  duplicateRow={duplicateGivenRow(row.index)}
                  stopEditing={stopEditing}
                  insertRowBelow={insertAfterGivenRow(row.index)}
                  setRowData={setGivenRowData(row.index)}
                  columnData={columns[col.index].columnData}
                  selected={Boolean(rowSelected)}
                  selectRows={selectRows}
                  toggleSelection={toggleGivenRow(row.index)}
                  getRowId={getRowId}
                  table={table}
                />
              )}
            </CellComponent>
          )
        })}
    </>
  )
}
