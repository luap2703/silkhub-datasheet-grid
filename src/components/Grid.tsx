import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual'
import React, {
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import {
  Cell,
  Column,
  ContextMenuItem,
  DataSheetGridProps,
  HeaderCellComponent,
  Selection,
  TableCallbackProps,
} from '../types'
import cx from 'classnames'
import { Cell as CellComponent } from './Cell'
import { useMemoizedIndexCallback } from '../hooks/useMemoizedIndexCallback'
import { HorizontalScrollShadow } from './HorizontalScrollShadow'
import { throttle } from 'throttle-debounce'

const FallbackHeader: HeaderCellComponent<any> = () => <></>

export const Grid = <T extends any>({
  data,
  columns,
  outerRef,
  innerRef,
  columnWidths,
  hasStickyRightColumn,
  hasStickyLeftColumn,
  //displayHeight,
  headerRowHeight,
  rowHeight,
  rowKey,
  fullWidth,
  selection,
  activeCell,
  rowClassName,
  cellClassName,
  children,
  editing,
  getContextMenuItems,
  setRowData,
  deleteRows,
  duplicateRows,
  insertRowAfter,
  stopEditing,
  onScroll,
  onBottomReached,
  bottomReachedBuffer = 300,

  loading,
  loadingRowComponent,
  loadingRowCount = 10,
  loadingRowHeight,

  selectedRows,
  selectRows,

  toggleSelection,
  selectAllRows,

  getRowId,
  table,

  getStickyColumnWidth,

  outerHeight,
}: {
  data: T[]
  columns: Column<T, any, any>[]
  outerRef: RefObject<HTMLDivElement>
  innerRef: RefObject<HTMLDivElement>
  columnWidths?: number[]
  hasStickyRightColumn: boolean
  hasStickyLeftColumn: boolean
  //displayHeight: number
  headerRowHeight: number
  rowHeight: (index: number) => { height: number }
  rowKey: DataSheetGridProps<T>['rowKey']
  rowClassName: DataSheetGridProps<T>['rowClassName']
  cellClassName: DataSheetGridProps<T>['cellClassName']
  fullWidth: boolean
  selection: Selection | null
  activeCell: Cell | null
  children: ReactNode
  editing: boolean
  getContextMenuItems: () => ContextMenuItem[]
  setRowData: (rowIndex: number, item: T) => void
  deleteRows: (rowMin: number, rowMax?: number) => void
  duplicateRows: (rowMin: number, rowMax?: number) => void
  insertRowAfter: (row: number, count?: number) => void
  stopEditing: (opts?: { nextRow?: boolean }) => void
  onScroll?: React.UIEventHandler<HTMLDivElement>

  onBottomReached?: () => void
  bottomReachedBuffer?: number

  loading?: boolean
  loadingRowCount?: number
  loadingRowHeight?: number
  loadingRowComponent?: ReactNode

  selectedRows: Set<string>

  outerHeight: number | undefined

  selectRows: (rowSelection: string[] | ((prev: string[]) => string[])) => void

  toggleSelection: (rowIndex: number) => void
  getRowId: (rowIndex: number) => string
  selectAllRows: () => void

  table: TableCallbackProps

  getStickyColumnWidth: (side: 'left' | 'right') => number
}) => {
  const LoadingComponent = useMemo(
    () => loadingRowComponent ?? <div>Loading...</div>,
    [loadingRowComponent]
  )

  const rowVirtualizer = useVirtualizer({
    count: loading ? loadingRowCount : data.length,
    getScrollElement: () => outerRef.current,
    paddingStart: headerRowHeight,
    estimateSize: (index) =>
      loading
        ? loadingRowHeight ?? rowHeight(index).height
        : rowHeight(index).height,
    getItemKey: (index: number): React.Key => {
      if (rowKey && !loading) {
        const row = data[index]
        if (typeof rowKey === 'function') {
          return rowKey({ rowData: row, rowIndex: index })
        } else if (
          typeof rowKey === 'string' &&
          row instanceof Object &&
          rowKey in row
        ) {
          const key = row[rowKey as keyof T]
          if (typeof key === 'string' || typeof key === 'number') {
            return key
          }
        }
      }
      return index
    },
    overscan: 5,
  })

  const colVirtualizer = useVirtualizer({
    count: columns.length,
    getScrollElement: () => outerRef.current,
    estimateSize: (index) => columnWidths?.[index] ?? 100,
    horizontal: true,
    getItemKey: (index: number): React.Key => columns[index].id ?? index,
    overscan: 1,

    rangeExtractor: (range) => {
      let result = defaultRangeExtractor(range)

      // Make sure all left sticky columns are included
      if (hasStickyLeftColumn) {
        const leftColumns: number[] = []

        for (let i = 0; i < columns.length; i++) {
          if (columns[i].sticky !== 'left') {
            break
          }

          leftColumns.push(i)
        }

        // Now remove any left column from result to then add them back in the correct order
        result = result.filter((i) => !leftColumns.includes(i))

        result = [...leftColumns, ...result]
      }

      if (result[0] !== 0) {
        result.unshift(0)
      }

      // Make sure all right sticky columns are included
      if (hasStickyRightColumn) {
        const rightColumns: number[] = []

        for (let i = columns.length - 1; i >= 0; i--) {
          if (columns[i].sticky !== 'right') {
            break
          }

          rightColumns.push(i)
        }

        // Now remove any right column from result to then add them back in the correct order
        result = result.filter((i) => !rightColumns.includes(i))

        result = [...result, ...rightColumns]
      }

      return result
    },
  })

  useEffect(() => {
    colVirtualizer.measure()
  }, [colVirtualizer, columnWidths])

  const setGivenRowData = useMemoizedIndexCallback(setRowData, 1)
  const deleteGivenRow = useMemoizedIndexCallback(deleteRows, 0)
  const duplicateGivenRow = useMemoizedIndexCallback(duplicateRows, 0)
  const insertAfterGivenRow = useMemoizedIndexCallback(insertRowAfter, 0)

  const selectionColMin = selection?.min.col ?? activeCell?.col
  const selectionColMax = selection?.max.col ?? activeCell?.col
  const selectionMinRow = selection?.min.row ?? activeCell?.row
  const selectionMaxRow = selection?.max.row ?? activeCell?.row

  const toggleGivenRow = useMemoizedIndexCallback(toggleSelection, 0)

  const _selectedRows = useMemo(() => {
    return Array.from(selectedRows)
  }, [selectedRows])

  const [isHorizontallyScrolled, setIsScrolled] = React.useState(false)

  const handleScroll = useCallback(() => {
    if (outerRef.current) {
      const target = outerRef.current

      if (target.scrollLeft > 0.01) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
  }, [outerRef])

  useEffect(() => {
    const throttledScroll = throttle(500, false, handleScroll)
    const ref = outerRef.current
    ref?.addEventListener('scroll', throttledScroll)
    return () => {
      ref?.removeEventListener('scroll', throttledScroll)
    }
  }, [handleScroll, outerRef])

  const isAtBottom = useRef(false)

  const bottomReachedHandler = useCallback(() => {
    const scrollableElement = outerRef.current
    if (scrollableElement) {
      const { scrollHeight, scrollTop, clientHeight } = scrollableElement

      if (
        scrollHeight - scrollTop - clientHeight < bottomReachedBuffer &&
        data.length > 0
      ) {
        if (!isAtBottom.current) {
          onBottomReached?.()
          isAtBottom.current = true
        }
      } else {
        isAtBottom.current = false
      }
    }
  }, [bottomReachedBuffer, data.length, onBottomReached, outerRef])

  const bottomReachedHandlerRef = useRef(bottomReachedHandler)
  bottomReachedHandlerRef.current = bottomReachedHandler

  // Also trigger bottomReacheed if layouting is done and the container is not scrollable bc the content is smaller than the container
  useEffect(() => {
    if (isAtBottom.current) return
    if (
      outerRef.current &&
      innerRef.current &&
      outerRef.current?.offsetHeight >= innerRef.current.offsetHeight
    ) {
      bottomReachedHandlerRef.current?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length, outerHeight])

  const onScrollHandler = useMemo(() => {
    return (e: React.UIEvent<HTMLDivElement>) => {
      onScroll?.(e)
      bottomReachedHandler()
    }
  }, [onScroll, bottomReachedHandler])

  return (
    <div
      ref={outerRef}
      className={cx('dsg-container', 'group/container')}
      data-state={loading ? 'loading' : 'loaded'}
      onScroll={onScrollHandler}
      //  style={{ height: displayHeight }}
    >
      <div
        className="group/inner-container"
        ref={innerRef}
        style={{
          width: fullWidth ? '100%' : colVirtualizer.getTotalSize(),
          height: rowVirtualizer.getTotalSize(),
        }}
      >
        {headerRowHeight > 0 && (
          <div
            className={cx('dsg-row', 'group/row', 'dsg-row-header')}
            style={{
              width: fullWidth ? '100%' : colVirtualizer.getTotalSize(),
              height: headerRowHeight,
            }}
          >
            {colVirtualizer.getVirtualItems().map((col) => {
              const Header: HeaderCellComponent<T> =
                columns[col.index].title ?? FallbackHeader

              const isStickyLeft =
                hasStickyLeftColumn && columns[col.index].sticky === 'left'

              if (loading && col.index === 0) return null

              return (
                <CellComponent
                  key={col.key}
                  gutter={!loading && col.index === 0}
                  stickyRight={
                    hasStickyRightColumn && col.index === columns.length - 1
                  }
                  width={col.size}
                  left={col.start}
                  padding={
                    !columns[col.index].disablePadding && col.index !== 0
                  }
                  stickyLeft={isStickyLeft}
                  className={cx(
                    'dsg-cell-header',
                    selectionColMin !== undefined &&
                      selectionColMax !== undefined &&
                      selectionColMin <= col.index - 1 &&
                      selectionColMax >= col.index - 1 &&
                      'dsg-cell-header-active',
                    columns[col.index].headerClassName
                  )}
                >
                  <div className="dsg-cell-header-container">
                    <Header
                      columnData={columns[col.index].columnData}
                      selectedRows={_selectedRows}
                      selectRows={selectRows}
                      selectAllRows={selectAllRows}
                      table={table}
                    />
                  </div>
                </CellComponent>
              )
            })}
          </div>
        )}
        {rowVirtualizer.getVirtualItems().map((row) => {
          const rowActive = Boolean(
            row.index >= (selectionMinRow ?? Infinity) &&
              row.index <= (selectionMaxRow ?? -Infinity)
          )

          const rowSelected = selectedRows.has(row.key.toString())

          return (
            <div
              key={row.key}
              className={cx(
                'dsg-row',
                'group/row',
                rowSelected && 'dsg-row-selected',
                typeof rowClassName === 'string' ? rowClassName : null,
                typeof rowClassName === 'function'
                  ? rowClassName({
                      rowData: data[row.index],
                      rowIndex: row.index,
                    })
                  : null
              )}
              style={{
                height: row.size,
                top: row.start,
                width: fullWidth ? '100%' : colVirtualizer.getTotalSize(),
              }}
            >
              {colVirtualizer.getVirtualItems().map((col) => {
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
                  activeCell?.row === row.index &&
                  activeCell.col === col.index - 1

                const isStickyLeft =
                  hasStickyLeftColumn && columns[col.index].sticky === 'left'

                if (loading && col.index === 0) return null

                return (
                  <CellComponent
                    key={col.key}
                    gutter={!loading && col.index === 0}
                    stickyRight={
                      hasStickyRightColumn && col.index === columns.length - 1
                    }
                    stickyLeft={isStickyLeft}
                    active={col.index === 0 && rowActive}
                    disabled={cellDisabled}
                    interactive={cellInteractive}
                    padding={
                      !columns[col.index].disablePadding && col.index !== 0
                    }
                    className={cx(
                      !loading
                        ? typeof colCellClassName === 'function' // Disable when loading to prevent any special behavior for loading view
                          ? colCellClassName({
                              rowData: data[row.index],
                              rowIndex: row.index,
                              columnId: columns[col.index].id,
                            })
                          : colCellClassName
                        : undefined,
                      !loading
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
                    {loading && col.index !== 0 ? (
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
                        selected={rowSelected}
                        selectRows={selectRows}
                        toggleSelection={toggleGivenRow(row.index)}
                        getRowId={getRowId}
                        table={table}
                      />
                    )}
                  </CellComponent>
                )
              })}
            </div>
          )
        })}

        {children}

        <HorizontalScrollShadow
          hasStickyLeftColumn={hasStickyLeftColumn}
          getStickyColumnWidth={getStickyColumnWidth}
          isHorizontallyScrolled={isHorizontallyScrolled}
          headerHeight={headerRowHeight}
        />
      </div>
    </div>
  )
}
