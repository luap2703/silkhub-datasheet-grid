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
import { getLoadingKey } from '../utils/loading-key'

declare type Key = string | number

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
  onBottomDataReached,
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
  overscanRows = 10,
}: {
  data: T[]
  columns: Column<T, any, any>[]
  outerRef: RefObject<HTMLDivElement | null>
  innerRef: RefObject<HTMLDivElement | null>
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
  onBottomDataReached?: (index: number) => void
  onBottomThrottleRate?: number

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

  overscanRows: number | undefined
}) => {
  const dataRef = useRef(data)
  dataRef.current = data
  const onBottomDataReachedRef = useRef(onBottomDataReached)
  onBottomDataReachedRef.current = onBottomDataReached

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
        ? (loadingRowHeight ?? rowHeight(index).height)
        : rowHeight(index).height,
    getItemKey: (index: number): Key => {
      if (data[index] === null) {
        return getLoadingKey(index)
      }
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
    overscan: overscanRows,
  })

  const colVirtualizer = useVirtualizer({
    count: columns.length,
    getScrollElement: () => outerRef.current,
    estimateSize: (index) => columnWidths?.[index] ?? 100,
    horizontal: true,
    getItemKey: (index: number): Key => columns[index].id ?? index,
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

  const nullValueCount = useMemo(() => {
    // Count the number of null's in the virtualized rows
    let nullCount = 0
    for (let i = 0; i < rowVirtualizer.getVirtualItems().length; i++) {
      if (data[rowVirtualizer.getVirtualItems()[i].index] === null) {
        nullCount++
      }
    }

    return nullCount
  }, [data])

  const bottomReachedHandler = useCallback(
    throttle(bottomReachedBuffer, () => {
      const scrollableElement = outerRef.current
      if (scrollableElement) {
        const { scrollHeight, scrollTop, clientHeight } = scrollableElement

        if (
          scrollHeight - scrollTop - clientHeight < bottomReachedBuffer &&
          dataRef.current.length > 0
        ) {
          if (!isAtBottom.current) {
            onBottomReached?.()
            isAtBottom.current = true
          }
        } else {
          isAtBottom.current = false
        }
      }
    }),
    [bottomReachedBuffer, onBottomReached, outerRef]
  )

  const horizontallyScrolledHandler = useCallback(() => {
    if (outerRef.current) {
      const isScrolled = outerRef.current.scrollLeft > 0.01
      if (isScrolled !== isHorizontallyScrolledRef.current)
        setIsScrolled(outerRef.current.scrollLeft > 0.01)
    }
  }, [outerRef])

  const bottomReachedHandlerRef = useRef(bottomReachedHandler)
  bottomReachedHandlerRef.current = bottomReachedHandler

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bottomDataReachedHandler = useCallback(
    throttle(bottomReachedBuffer, () => {
      // This should be a handler to figure out if a data point that is NULL is reached, aka rendered. If so, we should trigger a fetch for more data
      // Get the index of the first row that is NULL

      if (!rowVirtualizerRef.current) return

      const renderedElements = rowVirtualizerRef.current.getVirtualItems()
      if (!renderedElements.length) return

      // Check if one of the indices is NULL
      let firstNullIndex: number | null = null

      for (let i = 0; i < renderedElements.length; i++) {
        if (dataRef.current[renderedElements[i].index] === null) {
          firstNullIndex = renderedElements[i].index
          break
        }
      }

      if (firstNullIndex === null) return

      // Now we know that smth is null. We should refetch with the firstNullIndex as the starting point
      onBottomDataReachedRef.current?.(firstNullIndex)
    }),
    []
  )

  // Also trigger onBottomDataReached if the number of null values in the view changes.
  useEffect(() => {
    if (!loading && nullValueCount > 0) {
      bottomDataReachedHandler()
    }
  }, [nullValueCount])

  const isHorizontallyScrolledRef = useRef(isHorizontallyScrolled)
  isHorizontallyScrolledRef.current = isHorizontallyScrolled

  const onScrollHandler = useMemo(() => {
    return (e: React.UIEvent<HTMLDivElement>) => {
      onScroll?.(e)
      horizontallyScrolledHandler()
      bottomReachedHandler()
      bottomDataReachedHandler()
    }
  }, [onScroll, bottomReachedHandler, bottomDataReachedHandler])

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
  }, [data, loading, outerHeight])

  const isAtBottom = useRef(false)

  const rowVirtualizerRef = useRef(rowVirtualizer)
  rowVirtualizerRef.current = rowVirtualizer

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
                    padding={
                      !columns[col.index].disablePadding && col.index !== 0
                    }
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
                    {isLoading && col.index !== 0 ? (
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
