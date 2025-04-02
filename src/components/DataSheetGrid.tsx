import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from 'react'
import {
  Cell,
  CellWithIdInput,
  Column,
  ContextMenuType,
  ContextMenuItem,
  DataSheetGridProps,
  DataSheetGridRef,
  Operation,
  Selection,
  SelectionWithIdInput,
  TableCallbackProps,
  OperationResult,
} from '../types'
import { useColumnWidths } from '../hooks/useColumnWidths'
import { useResizeDetector } from 'react-resize-detector'
import { useColumns } from '../hooks/useColumns'
import { useEdges } from '../hooks/useEdges'
import { useDeepEqualState } from '../hooks/useDeepEqualState'
import { useDocumentEventListener } from '../hooks/useDocumentEventListener'
import { useGetBoundingClientRect } from '../hooks/useGetBoundingClientRect'
import { AddRows } from './AddRows'
import deepEqual from 'fast-deep-equal'
import { ContextMenu as DefaultContextMenu } from './ContextMenu'
import {
  encodeHtml,
  isPrintableUnicode,
  parseTextHtmlData,
  parseTextPlainData,
} from '../utils/copyPasting'
import {
  getCell,
  getCellWithId,
  getSelection,
  getSelectionWithId,
} from '../utils/typeCheck'
import { getAllTabbableElements } from '../utils/tab'
import { Grid } from './Grid'
import { SelectionRect } from './SelectionRect'
import { useRowHeights } from '../hooks/useRowHeights'
import { useRowSelection } from '../hooks/useRowSelection'
import { throttle } from 'throttle-debounce'
import { getLoadingKey } from '../utils/loading-key'

const DEFAULT_DATA: any[] = []
const DEFAULT_COLUMNS: Column<any, any, any>[] = []
const DEFAULT_CREATE_ROW: DataSheetGridProps<any>['createRow'] = () => ({})
const DEFAULT_EMPTY_CALLBACK: () => void = () => null
const DEFAULT_DUPLICATE_ROW: DataSheetGridProps<any>['duplicateRow'] = ({
  rowData,
}) => ({ ...rowData })

type ScrollBehavior = {
  doNotScrollX?: boolean
  doNotScrollY?: boolean
}

// eslint-disable-next-line react/display-name
export const DataSheetGrid = React.memo(
  React.forwardRef<DataSheetGridRef, DataSheetGridProps<any>>(
    <T extends any>(
      {
        value: data = DEFAULT_DATA,
        className,
        style,
        height: maxHeight = 400,
        onChange = DEFAULT_EMPTY_CALLBACK,
        columns: rawColumns = DEFAULT_COLUMNS,
        rowHeight = 40,
        headerRowHeight = typeof rowHeight === 'number' ? rowHeight : 40,
        gutterColumn,

        rowKey,
        addRowsComponent: AddRowsComponent = (props) => <AddRows {...props} />,
        createRow = DEFAULT_CREATE_ROW as () => T,
        autoAddRow = false,
        lockRows = false,
        disableExpandSelection = false,
        disableSmartDelete = false,
        duplicateRow = DEFAULT_DUPLICATE_ROW,
        contextMenuComponent: _ContextMenuComponent,
        disableContextMenu: disableContextMenuRaw = false,
        onFocus = DEFAULT_EMPTY_CALLBACK,
        onBlur = DEFAULT_EMPTY_CALLBACK,
        onActiveCellChange = DEFAULT_EMPTY_CALLBACK,
        onSelectionChange = DEFAULT_EMPTY_CALLBACK,
        rowClassName,
        cellClassName,
        onScroll,

        loading = false,
        loadingRowComponent = null,
        loadingRowCount = 10,
        loadingRowHeight,

        enforceLoading = false,

        rowSelection,
        onRowSelectionChange,
        onCellCopy,

        columnVisibilityModel,
        onColumnVisibilityChange,

        bottomReachedBuffer,

        onBottomReached,
        onBottomDataReached,
        onBottomThrottleRate = 1_000,

        overscanRows,
      }: DataSheetGridProps<T>,
      ref: React.ForwardedRef<DataSheetGridRef>
    ): JSX.Element => {
      if (!enforceLoading) {
        loading = loading && data.length === 0
      }

      const lastEditingCellRef = useRef<Cell | null>(null)
      const disableContextMenu = disableContextMenuRaw || lockRows

      const columns = useColumns(
        rawColumns,
        gutterColumn,
        columnVisibilityModel
      )

      const columnVisibilityModelRef = useRef(columnVisibilityModel)
      columnVisibilityModelRef.current = columnVisibilityModel

      const onColumnVisibilityChangeRef = useRef(onColumnVisibilityChange)
      onColumnVisibilityChangeRef.current = onColumnVisibilityChange

      const { hasStickyRightColumn, hasStickyLeftColumn } = useMemo(() => {
        return columns.reduce(
          (acc, column) => {
            if (column.sticky === 'right') acc.hasStickyRightColumn = true
            if (column.sticky === 'left') acc.hasStickyLeftColumn = true
            return acc
          },
          { hasStickyRightColumn: false, hasStickyLeftColumn: false }
        )
      }, [columns])
      const innerRef = useRef<HTMLDivElement>(null)
      const outerRef = useRef<HTMLDivElement>(null)
      const beforeTabIndexRef = useRef<HTMLDivElement>(null)
      const afterTabIndexRef = useRef<HTMLDivElement>(null)

      const { selectedRows, selectRows } = useRowSelection(
        rowSelection,
        onRowSelectionChange
      )

      const selectedRowsRef = useRef(selectedRows)
      selectedRowsRef.current = selectedRows

      // Default value is 1 for the border
      //  const [heightDiff, setHeightDiff] = useDebounceState(1, 1000)

      const { getRowSize, totalSize, getRowIndex } = useRowHeights({
        value: data,
        rowHeight,
      })

      // Height of the list (including scrollbars and borders) to display
      /* const displayHeight = Math.min(
        maxHeight,
        headerRowHeight + totalSize(maxHeight) + heightDiff
      )*/

      // Width and height of the scrollable area
      const { width, height } = useResizeDetector({
        targetRef: outerRef,
        refreshMode: 'throttle',
        refreshRate: 50,
      })

      //  setHeightDiff(height ? displayHeight - height : 0)

      const edges = useEdges(outerRef, width, height)

      const {
        fullWidth,
        totalWidth: contentWidth,
        columnWidths,
        columnRights,
      } = useColumnWidths(columns, width)

      // x,y coordinates of the right click
      const [contextMenu, setContextMenu] = useState<{
        x: number
        y: number
        cursorIndex: Cell
      } | null>(null)

      // Items of the context menu
      const [contextMenuItems, setContextMenuItems] = useState<
        ContextMenuItem[]
      >([])

      const ContextMenu: ContextMenuType = useMemo(() => {
        const col = contextMenu?.cursorIndex.col
        if (col !== undefined) {
          const ColMenu = columns[col + 1].contextMenuComponent

          if (ColMenu) {
            return ColMenu
          }
        }

        return (
          _ContextMenuComponent ??
          ((props) => <DefaultContextMenu {...props} />)
        )
      }, [_ContextMenuComponent, columns, contextMenu?.cursorIndex.col])

      // True when the active cell is being edited
      const [editing, setEditing] = useState(false)

      // Number of rows the user is expanding the selection by, always a number, even when not expanding selection
      const [expandSelectionRowsCount, setExpandSelectionRowsCount] =
        useState<number>(0)

      // When not null, represents the index of the row from which we are expanding
      const [
        expandingSelectionFromRowIndex,
        setExpandingSelectionFromRowIndex,
      ] = useState<number | null>(null)

      // Highlighted cell, null when not focused
      const [activeCell, setActiveCell] = useDeepEqualState<
        (Cell & ScrollBehavior) | null
      >(null)

      // The selection cell and the active cell are the two corners of the selection, null when nothing is selected
      const [selectionCell, setSelectionCell] = useDeepEqualState<
        (Cell & ScrollBehavior) | null
      >(null)

      // Min and max of the current selection (rectangle defined by the active cell and the selection cell), null when nothing is selected
      const selection = useMemo<Selection | null>(
        () =>
          activeCell &&
          selectionCell && {
            min: {
              col: Math.min(activeCell.col, selectionCell.col),
              row: Math.min(activeCell.row, selectionCell.row),
            },
            max: {
              col: Math.max(activeCell.col, selectionCell.col),
              row: Math.max(activeCell.row, selectionCell.row),
            },
          },
        [activeCell, selectionCell]
      )

      const selectionRef = useRef(selection)
      selectionRef.current = selection

      // Behavior of the selection when the user drags the mouse around
      const [selectionMode, setSelectionMode] = useDeepEqualState({
        // True when the position of the cursor should impact the columns of the selection
        columns: false,
        // True when the position of the cursor should impact the rows of the selection
        rows: false,
        // True when the user is dragging the mouse around to select
        active: false,
      })

      // Same as expandSelectionRowsCount but is null when we should not be able to expand the selection
      const expandSelection = useMemo<number | null>(() => {
        return disableExpandSelection ||
          editing ||
          selectionMode.active ||
          activeCell?.row === data?.length - 1 ||
          selection?.max.row === data?.length - 1 ||
          (activeCell &&
            columns
              .slice(
                (selection?.min.col ?? activeCell.col) + 1,
                (selection?.max.col ?? activeCell.col) + 2
              )
              .every((column) => column.disabled === true))
          ? null
          : expandSelectionRowsCount
      }, [
        activeCell,
        columns,
        data,
        disableExpandSelection,
        editing,
        expandSelectionRowsCount,
        selection,
        selectionMode.active,
      ])

      const getInnerBoundingClientRect = useGetBoundingClientRect(innerRef)
      const getOuterBoundingClientRect = useGetBoundingClientRect(outerRef)

      // Blur any element on focusing the grid
      useEffect(() => {
        if (activeCell !== null) {
          ;(document.activeElement as HTMLElement).blur()
          window.getSelection()?.removeAllRanges()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [activeCell !== null])

      // Extract the coordinates of the cursor from a mouse event
      const getCursorIndex = useCallback(
        (
          event: MouseEvent,
          force: boolean = false,
          includeSticky: boolean = false
        ): Cell | null => {
          const innerBoundingClientRect = getInnerBoundingClientRect(force)
          const outerBoundingClientRect =
            includeSticky && getOuterBoundingClientRect(force)

          if (innerBoundingClientRect && columnRights && columnWidths) {
            let x = event.clientX - innerBoundingClientRect.left
            let y = event.clientY - innerBoundingClientRect.top

            if (outerBoundingClientRect) {
              if (
                event.clientY - outerBoundingClientRect.top <=
                headerRowHeight
              ) {
                y = 0
              }

              if (
                event.clientX - outerBoundingClientRect.left <=
                columnWidths[0]
              ) {
                x = 0
              }

              if (
                hasStickyRightColumn &&
                outerBoundingClientRect.right - event.clientX <=
                  columnWidths[columnWidths.length - 1]
              ) {
                x = columnRights[columnRights.length - 2] + 1
              }
            }

            return {
              col: columnRights.findIndex((right) => x < right) - 1,
              row: getRowIndex(y - headerRowHeight),
            }
          }

          return null
        },
        [
          columnRights,
          columnWidths,
          getInnerBoundingClientRect,
          getOuterBoundingClientRect,
          headerRowHeight,
          hasStickyRightColumn,
          getRowIndex,
        ]
      )

      const dataRef = useRef(data)
      dataRef.current = data

      const isCellDisabled = useCallback(
        (cell: Cell): boolean => {
          const disabled = columns[cell.col + 1].disabled

          return Boolean(
            typeof disabled === 'function'
              ? disabled({
                  rowData: dataRef.current[cell.row],
                  rowIndex: cell.row,
                })
              : disabled
          )
        },
        [columns]
      )

      const isCellInteractive = useCallback(
        (cell: Cell): boolean => {
          const interactive = columns[cell.col + 1].interactive

          return Boolean(
            typeof interactive === 'function'
              ? interactive({
                  rowData: dataRef.current[cell.row],
                  rowIndex: cell.row,
                })
              : interactive
          )
        },
        [columns]
      )

      const insertRowAfter = useCallback(
        (row: number, count = 1) => {
          if (lockRows) {
            return
          }

          setSelectionCell(null)
          setEditing(false)

          onChange(
            [
              ...dataRef.current.slice(0, row + 1),
              ...new Array(count).fill(0).map(createRow),
              ...dataRef.current.slice(row + 1),
            ],
            [
              {
                type: 'CREATE',
                fromRowIndex: row + 1,
                toRowIndex: row + 1 + count,
              },
            ]
          )
          setActiveCell((a) => ({
            col: a?.col || 0,
            row: row + count,
            doNotScrollX: true,
          }))
        },
        [createRow, lockRows, onChange, setActiveCell, setSelectionCell]
      )

      const duplicateRows = useCallback(
        (rowMin: number, rowMax: number = rowMin) => {
          if (lockRows) {
            return
          }

          onChange(
            [
              ...dataRef.current.slice(0, rowMax + 1),
              ...dataRef.current
                .slice(rowMin, rowMax + 1)
                .map((rowData, i) =>
                  duplicateRow({ rowData, rowIndex: i + rowMin })
                ),
              ...dataRef.current.slice(rowMax + 1),
            ],
            [
              {
                type: 'CREATE',
                fromRowIndex: rowMax + 1,
                toRowIndex: rowMax + 2 + rowMax - rowMin,
              },
            ]
          )
          setActiveCell({ col: 0, row: rowMax + 1, doNotScrollX: true })
          setSelectionCell({
            col: columns.length - (hasStickyRightColumn ? 3 : 2),
            row: 2 * rowMax - rowMin + 1,
            doNotScrollX: true,
          })
          setEditing(false)
        },
        [
          columns.length,
          duplicateRow,
          lockRows,
          onChange,
          setActiveCell,
          setSelectionCell,
          hasStickyRightColumn,
        ]
      )

      // Scroll to any given cell making sure it is in view
      const scrollTo = useCallback(
        (cell: Cell & ScrollBehavior) => {
          if (!height || !width) {
            return
          }

          if (!cell.doNotScrollY) {
            // Align top
            const topMax = getRowSize(cell.row).top
            // Align bottom
            const topMin =
              getRowSize(cell.row).top +
              getRowSize(cell.row).height +
              headerRowHeight -
              height +
              1

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (!outerRef.current) return
            const scrollTop = outerRef.current.scrollTop

            if (scrollTop > topMax) {
              outerRef.current.scrollTop = topMax
            } else if (scrollTop < topMin) {
              outerRef.current.scrollTop = topMin
            }
          }

          if (
            columnRights &&
            columnWidths &&
            outerRef.current &&
            !cell.doNotScrollX
          ) {
            // Align left
            const leftMax = columnRights[cell.col] - columnRights[0]
            // Align right
            const leftMin =
              columnRights[cell.col] +
              columnWidths[cell.col + 1] +
              (hasStickyRightColumn
                ? columnWidths[columnWidths.length - 1]
                : 0) -
              width +
              1

            const scrollLeft = outerRef.current.scrollLeft

            if (scrollLeft > leftMax) {
              outerRef.current.scrollLeft = leftMax
            } else if (scrollLeft < leftMin) {
              outerRef.current.scrollLeft = leftMin
            }
          }
        },
        [
          height,
          width,
          headerRowHeight,
          columnRights,
          columnWidths,
          getRowSize,
          hasStickyRightColumn,
        ]
      )

      // Scroll to the selectionCell cell when it changes
      useEffect(() => {
        if (selectionCell) {
          scrollTo(selectionCell)
        }
      }, [selectionCell])

      // Scroll to the active cell when it changes
      useEffect(() => {
        if (activeCell) {
          scrollTo(activeCell)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [activeCell?.col, activeCell?.row])

      // If the selected cells or activeCell isn't there anymore, we need to reset the selection
      useLayoutEffect(() => {
        if (
          selection &&
          (selection.min.row >= data.length ||
            selection.max.row >= data.length ||
            selection.min.col >= columns.length - 1 ||
            selection.max.col >= columns.length - 1)
        ) {
          console.debug('Selection out of bounds, resetting')
          setSelectionCell(null)
        }
      }, [columns.length, data.length, selection, setSelectionCell])

      useLayoutEffect(() => {
        if (
          activeCell &&
          (activeCell.row >= data.length ||
            activeCell.col >= columns.length - 1)
        ) {
          console.debug('Active cell out of bounds, resetting')
          setActiveCell(null)
        }
      }, [activeCell, columns.length, data.length, setActiveCell])

      const setRowData = useCallback(
        (rowIndex: number, item: OperationResult<T>) => {
          onChange(
            [
              ...dataRef.current?.slice(0, rowIndex),
              item,
              ...dataRef.current?.slice(rowIndex + 1),
            ],
            [
              {
                type: 'UPDATE',
                fromRowIndex: rowIndex,
                toRowIndex: rowIndex + 1,
              },
            ]
          )
        },
        [onChange]
      )

      const deleteRows = useCallback(
        (rowMin: number, rowMax: number = rowMin) => {
          if (lockRows) {
            return
          }

          setEditing(false)
          setActiveCell((a) => {
            const row = Math.min(
              dataRef.current.length - 2 - rowMax + rowMin,
              rowMin
            )

            if (row < 0) {
              return null
            }

            return a && { col: a.col, row }
          })
          setSelectionCell(null)
          onChange(
            [
              ...dataRef.current.slice(0, rowMin),
              ...dataRef.current.slice(rowMax + 1),
            ],
            [
              {
                type: 'DELETE',
                fromRowIndex: rowMin,
                toRowIndex: rowMax + 1,
              },
            ]
          )
        },
        [lockRows, onChange, setActiveCell, setSelectionCell]
      )

      const deleteSelection = useCallback(
        (_smartDelete = true) => {
          const smartDelete = _smartDelete && !disableSmartDelete
          if (!refs.current.activeCell) {
            return
          }

          const min: Cell = selection?.min || refs.current.activeCell
          const max: Cell = selection?.max || refs.current.activeCell

          if (
            data
              .slice(min.row, max.row + 1)
              .every((rowData, i) =>
                columns.every((column) =>
                  column.isCellEmpty({ rowData, rowIndex: i + min.row })
                )
              )
          ) {
            if (smartDelete) {
              deleteRows(min.row, max.row)
            }
            return
          }

          const newData = [...data]

          for (let row = min.row; row <= max.row; ++row) {
            for (let col = min.col; col <= max.col; ++col) {
              if (!isCellDisabled({ col, row })) {
                const { deleteValue = ({ rowData }) => rowData } =
                  columns[col + 1]
                newData[row] = deleteValue({
                  rowData: newData[row],
                  rowIndex: row,
                })
              }
            }
          }

          if (smartDelete && deepEqual(newData, data)) {
            setActiveCell({ col: 0, row: min.row, doNotScrollX: true })
            setSelectionCell({
              col: columns.length - (hasStickyRightColumn ? 3 : 2),
              row: max.row,
              doNotScrollX: true,
            })
            return
          }

          onChange(newData, [
            {
              type: 'UPDATE',
              fromRowIndex: min.row,
              toRowIndex: max.row + 1,
            },
          ])
        },
        [
          disableSmartDelete,
          selection?.min,
          selection?.max,
          data,
          onChange,
          columns,
          deleteRows,
          isCellDisabled,
          setActiveCell,
          setSelectionCell,
          hasStickyRightColumn,
        ]
      )

      const stopEditing = useCallback(
        ({ nextRow = true } = {}) => {
          if (refs.current.activeCell?.row === dataRef.current.length - 1) {
            if (nextRow && autoAddRow) {
              insertRowAfter(refs.current.activeCell?.row)
            } else {
              setEditing(false)
            }
          } else {
            setEditing(false)

            if (nextRow) {
              setActiveCell((a) => a && { col: a.col, row: a.row + 1 })
            }
          }
        },
        [autoAddRow, insertRowAfter, setActiveCell]
      )

      const onCellCopyRef = useRef(onCellCopy)
      onCellCopyRef.current = onCellCopy

      const onCopy = useCallback(
        async (event?: ClipboardEvent) => {
          if (!editing && refs.current.activeCell) {
            const copyData: Array<Array<number | string | null>> = []

            const min: Cell = selection?.min || refs.current.activeCell
            const max: Cell = selection?.max || refs.current.activeCell

            const copiedCells: Cell[] = []

            for (let row = min.row; row <= max.row; ++row) {
              if (dataRef.current[row] === null) {
                // Insert nulls
                copyData.push(Array(max.col - min.col + 1).fill(null))
                continue
              }
              copyData.push([])

              for (let col = min.col; col <= max.col; ++col) {
                const { copyValue = () => null } = columns[col + 1]
                copyData[row - min.row].push(
                  copyValue({ rowData: data[row], rowIndex: row })
                )

                copiedCells.push({ col, row })
              }
            }

            const textPlain = copyData.map((row) => row.join('\t')).join('\n')
            const textHtml = `<table>${copyData
              .map(
                (row) =>
                  `<tr>${row
                    .map(
                      (cell) =>
                        `<td>${encodeHtml(String(cell ?? '')).replace(
                          /\n/g,
                          '<br/>'
                        )}</td>`
                    )
                    .join('')}</tr>`
              )
              .join('')}</table>`

            if (event !== undefined) {
              event.clipboardData?.setData('text/plain', textPlain)
              event.clipboardData?.setData('text/html', textHtml)
              event.preventDefault()
            } else {
              let success = false
              if (navigator.clipboard.write !== undefined) {
                const textBlob = new Blob([textPlain], {
                  type: 'text/plain',
                })
                const htmlBlob = new Blob([textHtml], { type: 'text/html' })
                const clipboardData = [
                  new ClipboardItem({
                    'text/plain': textBlob,
                    'text/html': htmlBlob,
                  }),
                ]
                await navigator.clipboard.write(clipboardData).then(() => {
                  success = true
                })
              } else if (navigator.clipboard.writeText !== undefined) {
                await navigator.clipboard.writeText(textPlain).then(() => {
                  success = true
                })
              } else if (document.execCommand !== undefined) {
                const result = document.execCommand('copy')
                if (result) {
                  success = true
                }
              }
              if (!success) {
                alert(
                  'This action is unavailable in your browser, but you can still use Ctrl+C for copy or Ctrl+X for cut'
                )
              }
            }

            onCellCopyRef.current?.(copiedCells, textPlain, textHtml)
          }
        },
        [columns, data, editing, selection]
      )
      useDocumentEventListener('copy', onCopy)

      const onCut = useCallback(
        (event?: ClipboardEvent) => {
          if (!editing && refs.current.activeCell) {
            onCopy(event)
            deleteSelection(false)
          }
        },
        [deleteSelection, editing, onCopy]
      )
      useDocumentEventListener('cut', onCut)

      const applyPasteDataToDatasheet = useCallback(
        async (pasteData: string[][]) => {
          if (!editing && refs.current.activeCell) {
            const min: Cell = selection?.min || refs.current.activeCell
            const max: Cell = selection?.max || refs.current.activeCell

            const results = await Promise.all(
              pasteData[0].map((_, columnIndex) => {
                const prePasteValues =
                  columns[min.col + columnIndex + 1]?.prePasteValues

                const values = pasteData.map((row) => row[columnIndex])
                return prePasteValues?.(values) ?? values
              })
            )

            pasteData = pasteData.map((_, rowIndex) =>
              results.map((column) => column[rowIndex])
            )

            // Paste single row
            if (pasteData.length === 1) {
              const newData = [...data]

              for (
                let columnIndex = 0;
                columnIndex < pasteData[0].length;
                columnIndex++
              ) {
                const pasteValue =
                  columns[min.col + columnIndex + 1]?.pasteValue

                if (pasteValue) {
                  for (
                    let rowIndex = min.row;
                    rowIndex <= max.row;
                    rowIndex++
                  ) {
                    if (
                      !isCellDisabled({
                        col: columnIndex + min.col,
                        row: rowIndex,
                      })
                    ) {
                      newData[rowIndex] = await pasteValue({
                        rowData: newData[rowIndex],
                        value: pasteData[0][columnIndex],
                        rowIndex,
                      })
                    }
                  }
                }
              }

              onChange(newData, [
                {
                  type: 'UPDATE',
                  fromRowIndex: min.row,
                  toRowIndex: max.row + 1,
                },
              ])
              setActiveCell({ col: min.col, row: min.row })
              setSelectionCell({
                col: Math.min(
                  min.col + pasteData[0].length - 1,
                  columns.length - (hasStickyRightColumn ? 3 : 2)
                ),
                row: max.row,
              })
            } else {
              // Paste multiple rows
              let newData = [...data]
              const missingRows = min.row + pasteData.length - data.length

              if (missingRows > 0) {
                if (!lockRows) {
                  newData = [
                    ...newData,
                    ...new Array(missingRows).fill(0).map(() => createRow()),
                  ]
                } else {
                  pasteData.splice(pasteData.length - missingRows, missingRows)
                }
              }

              for (
                let columnIndex = 0;
                columnIndex < pasteData[0].length &&
                min.col + columnIndex <
                  columns.length - (hasStickyRightColumn ? 2 : 1);
                columnIndex++
              ) {
                const pasteValue =
                  columns[min.col + columnIndex + 1]?.pasteValue

                if (pasteValue) {
                  for (
                    let rowIndex = 0;
                    rowIndex < pasteData.length;
                    rowIndex++
                  ) {
                    if (
                      !isCellDisabled({
                        col: min.col + columnIndex,
                        row: min.row + rowIndex,
                      })
                    ) {
                      newData[min.row + rowIndex] = await pasteValue({
                        rowData: newData[min.row + rowIndex],
                        value: pasteData[rowIndex][columnIndex],
                        rowIndex: min.row + rowIndex,
                      })
                    }
                  }
                }
              }

              const operations: Operation[] = [
                {
                  type: 'UPDATE',
                  fromRowIndex: min.row,
                  toRowIndex:
                    min.row +
                    pasteData.length -
                    (!lockRows && missingRows > 0 ? missingRows : 0),
                },
              ]

              if (missingRows > 0 && !lockRows) {
                operations.push({
                  type: 'CREATE',
                  fromRowIndex: min.row + pasteData.length - missingRows,
                  toRowIndex: min.row + pasteData.length,
                })
              }

              onChange(newData, operations)
              setActiveCell({ col: min.col, row: min.row })
              setSelectionCell({
                col: Math.min(
                  min.col + pasteData[0].length - 1,
                  columns.length - (hasStickyRightColumn ? 3 : 2)
                ),
                row: min.row + pasteData.length - 1,
              })
            }
          }
        },
        [
          columns,
          createRow,
          data,
          editing,
          hasStickyRightColumn,
          isCellDisabled,
          lockRows,
          onChange,
          selection?.max,
          selection?.min,
          setActiveCell,
          setSelectionCell,
        ]
      )

      const onPaste = useCallback(
        (event: ClipboardEvent) => {
          if (refs.current.activeCell && !editing) {
            let pasteData = [['']]
            if (event.clipboardData?.types.includes('text/html')) {
              pasteData = parseTextHtmlData(
                event.clipboardData?.getData('text/html')
              )
            } else if (event.clipboardData?.types.includes('text/plain')) {
              pasteData = parseTextPlainData(
                event.clipboardData?.getData('text/plain')
              )
            } else if (event.clipboardData?.types.includes('text')) {
              pasteData = parseTextPlainData(
                event.clipboardData?.getData('text')
              )
            }
            applyPasteDataToDatasheet(pasteData)
            event.preventDefault()
          }
        },
        [applyPasteDataToDatasheet, editing]
      )

      useDocumentEventListener('paste', onPaste)

      const contextMenuItemsRef = useRef(contextMenuItems)
      contextMenuItemsRef.current = contextMenuItems

      const getContextMenuItems = useCallback(
        () => contextMenuItemsRef.current,
        []
      )

      const getRowId = useCallback(
        (rowIndex: number) =>
          dataRef.current[rowIndex] === null
            ? getLoadingKey(rowIndex)
            : typeof rowKey === 'function'
              ? rowKey({
                  rowIndex: rowIndex,
                  rowData: dataRef.current[rowIndex],
                })
              : (rowKey ?? rowIndex.toString()),
        [rowKey]
      )

      const toggleSelection = useCallback(
        (rowIndex: number) => {
          const rowId = getRowId(rowIndex)

          selectRows((prev) => {
            if (prev.includes(rowId)) {
              return prev.filter((id) => id !== rowId)
            } else {
              return [...prev, rowId]
            }
          })
        },
        [getRowId, selectRows]
      )

      const selectAllRows = useCallback(() => {
        selectRows((prev) => {
          return [...new Set([...prev, ...data.map((_, i) => getRowId(i))])]
        })
      }, [data, getRowId, selectRows])

      const lastCursorIndex = useRef<Cell | null>(null)

      const refs = useRef({
        expandingSelectionFromRowIndex,
        selectionMode,
        editing,
        selectionCell,
        activeCell,
        lastEditingCellRef,
        selection,

        contextMenu,
      })

      refs.current = {
        expandingSelectionFromRowIndex,
        selectionMode,
        editing,
        selectionCell,
        activeCell,
        lastEditingCellRef,
        selection,

        contextMenu,
      }

      const onMouseDown = useCallback(
        (event: MouseEvent) => {
          if (refs.current.contextMenu && contextMenuItems.length) {
            return
          }

          const rightClick =
            event.button === 2 || (event.button === 0 && event.ctrlKey)
          const clickInside =
            innerRef.current?.contains(event.target as Node) || false

          const cursorIndex = clickInside
            ? getCursorIndex(event, true, true)
            : null

          if (
            !clickInside &&
            editing &&
            refs.current.activeCell &&
            columns[refs.current.activeCell.col + 1].keepFocus
          ) {
            return
          }

          // If the cell is null, a.k.a., not loaded, we should not do anything
          if (cursorIndex?.row && dataRef.current[cursorIndex?.row] === null) {
            return
          }

          if (
            event.target instanceof HTMLElement &&
            event.target.className.includes('dsg-expand-rows-indicator')
          ) {
            setExpandingSelectionFromRowIndex(
              Math.max(
                refs.current.activeCell?.row ?? 0,
                refs.current.selection?.max.row ?? 0
              )
            )
            return
          }

          const clickOnActiveCell =
            cursorIndex &&
            refs.current.activeCell &&
            refs.current.activeCell.col === cursorIndex.col &&
            refs.current.activeCell.row === cursorIndex.row &&
            !isCellDisabled(refs.current.activeCell)

          if (clickOnActiveCell && editing) {
            return
          }

          const clickOnStickyRightColumn =
            cursorIndex?.col === columns.length - 2 && hasStickyRightColumn

          const rightClickInSelection =
            rightClick &&
            refs.current.selection &&
            cursorIndex &&
            cursorIndex.row >= refs.current.selection.min.row &&
            cursorIndex.row <= refs.current.selection.max.row &&
            cursorIndex.col >= refs.current.selection.min.col &&
            cursorIndex.col <= refs.current.selection.max.col

          const rightClickOnSelectedHeaders =
            rightClick &&
            refs.current.selection &&
            cursorIndex &&
            cursorIndex.row === -1 &&
            cursorIndex.col >= refs.current.selection.min.col &&
            cursorIndex.col <= refs.current.selection.max.col

          const rightClickOnSelectedGutter =
            rightClick &&
            refs.current.selection &&
            cursorIndex &&
            cursorIndex.row >= refs.current.selection.min.row &&
            cursorIndex.row <= refs.current.selection.max.row &&
            cursorIndex.col === -1

          const clickOnSelectedStickyRightColumn =
            clickOnStickyRightColumn &&
            refs.current.selection &&
            cursorIndex &&
            cursorIndex.row >= refs.current.selection.min.row &&
            cursorIndex.row <= refs.current.selection.max.row

          if (rightClick && !disableContextMenu) {
            setContextMenu({
              x: event.clientX,
              y: event.clientY,
              cursorIndex: cursorIndex as Cell,
            })
          }

          if (
            (!(event.shiftKey && refs.current.activeCell) || rightClick) &&
            data.length > 0
          ) {
            setActiveCell(
              cursorIndex && {
                col:
                  (rightClickInSelection || rightClickOnSelectedHeaders) &&
                  refs.current.activeCell
                    ? refs.current.activeCell.col
                    : Math.max(
                        0,
                        clickOnStickyRightColumn ? 0 : cursorIndex.col
                      ),
                row:
                  (rightClickInSelection ||
                    rightClickOnSelectedGutter ||
                    clickOnSelectedStickyRightColumn) &&
                  refs.current.activeCell
                    ? refs.current.activeCell.row
                    : Math.max(0, cursorIndex.row),
                doNotScrollX: Boolean(
                  (rightClickInSelection && refs.current.activeCell) ||
                    clickOnStickyRightColumn ||
                    cursorIndex.col === -1
                ),
                doNotScrollY: Boolean(
                  (rightClickInSelection && refs.current.activeCell) ||
                    cursorIndex.row === -1
                ),
              }
            )
          }

          if (clickOnActiveCell && !rightClick) {
            lastEditingCellRef.current = refs.current.activeCell
          }

          // Looking up if editing is disabled on the column
          const activeCol = refs.current.activeCell
            ? columns[refs.current.activeCell?.col + 1]
            : null
          setEditing(
            Boolean(
              clickOnActiveCell && !rightClick && !activeCol?.disableEditing
            )
          )
          setSelectionMode(
            cursorIndex && !rightClick
              ? {
                  columns:
                    (cursorIndex.col !== -1 && !clickOnStickyRightColumn) ||
                    Boolean(event.shiftKey && refs.current.activeCell),
                  rows:
                    cursorIndex.row !== -1 ||
                    Boolean(event.shiftKey && refs.current.activeCell),
                  active: true,
                }
              : {
                  columns: false,
                  rows: false,
                  active: false,
                }
          )

          if (event.shiftKey && refs.current.activeCell && !rightClick) {
            setSelectionCell(
              cursorIndex && {
                col: Math.max(
                  0,
                  cursorIndex.col - (clickOnStickyRightColumn ? 1 : 0)
                ),
                row: Math.max(0, cursorIndex.row),
              }
            )
          } else if (!rightClickInSelection) {
            if (
              cursorIndex &&
              (cursorIndex?.col === -1 ||
                cursorIndex?.row === -1 ||
                clickOnStickyRightColumn)
            ) {
              let col = cursorIndex.col
              let row = cursorIndex.row
              let doNotScrollX = false
              let doNotScrollY = false

              if (cursorIndex.col === -1 || clickOnStickyRightColumn) {
                col = columns.length - (hasStickyRightColumn ? 3 : 2)
                doNotScrollX = true
              }

              if (cursorIndex.row === -1) {
                row = data.length - 1
                doNotScrollY = true
              }

              if (rightClickOnSelectedHeaders && refs.current.selectionCell) {
                col = refs.current.selectionCell.col
                doNotScrollY = true
              }

              if (
                (rightClickOnSelectedGutter ||
                  clickOnSelectedStickyRightColumn) &&
                refs.current.selectionCell
              ) {
                row = refs.current.selectionCell.row
                doNotScrollX = true
              }

              setSelectionCell({ col, row, doNotScrollX, doNotScrollY })
            } else {
              setSelectionCell(null)
            }

            if (clickInside) {
              event.preventDefault()
            }
          }
        },
        [
          contextMenuItems.length,
          getCursorIndex,
          editing,
          columns,
          isCellDisabled,
          hasStickyRightColumn,
          disableContextMenu,
          data.length,
          setSelectionMode,
          setActiveCell,
          setSelectionCell,
        ]
      )
      useDocumentEventListener('mousedown', onMouseDown)

      const onMouseUp = useCallback(() => {
        if (expandingSelectionFromRowIndex !== null) {
          if (expandSelectionRowsCount > 0 && activeCell) {
            let copyData: Array<Array<string>> = []

            const min: Cell = refs.current.selection?.min || activeCell
            const max: Cell = refs.current.selection?.max || activeCell

            for (let row = min.row; row <= max.row; ++row) {
              copyData.push([])

              for (let col = min.col; col <= max.col; ++col) {
                const { copyValue = () => null } = columns[col + 1]
                copyData[row - min.row].push(
                  String(copyValue({ rowData: data[row], rowIndex: row }) ?? '')
                )
              }
            }

            Promise.all(
              copyData[0].map((_, columnIndex) => {
                const prePasteValues =
                  columns[min.col + columnIndex + 1]?.prePasteValues

                const values = copyData.map((row) => row[columnIndex])
                return prePasteValues?.(values) ?? values
              })
            ).then((results) => {
              copyData = copyData.map((_, rowIndex) =>
                results.map((column) => column[rowIndex])
              )

              const newData = [...data]

              for (
                let columnIndex = 0;
                columnIndex < copyData[0].length;
                columnIndex++
              ) {
                const pasteValue =
                  columns[min.col + columnIndex + 1]?.pasteValue

                if (pasteValue) {
                  for (
                    let rowIndex = max.row + 1;
                    rowIndex <= max.row + expandSelectionRowsCount;
                    rowIndex++
                  ) {
                    if (
                      !isCellDisabled({
                        col: columnIndex + min.col,
                        row: rowIndex,
                      })
                    ) {
                      newData[rowIndex] = pasteValue({
                        rowData: newData[rowIndex],
                        value:
                          copyData[(rowIndex - max.row - 1) % copyData.length][
                            columnIndex
                          ],
                        rowIndex,
                      })
                    }
                  }
                }
              }

              onChange(newData, [
                {
                  type: 'UPDATE',
                  fromRowIndex: max.row + 1,
                  toRowIndex: max.row + 1 + expandSelectionRowsCount,
                },
              ])
            })

            setExpandSelectionRowsCount(0)
            setActiveCell({
              col: Math.min(
                activeCell?.col ?? Infinity,
                refs.current.selection?.min.col ?? Infinity
              ),
              row: Math.min(
                activeCell?.row ?? Infinity,
                refs.current.selection?.min.row ?? Infinity
              ),
              doNotScrollX: true,
              doNotScrollY: true,
            })
            setSelectionCell({
              col: Math.max(
                activeCell?.col ?? 0,
                refs.current.selection?.max.col ?? 0
              ),
              row:
                Math.max(
                  activeCell?.row ?? 0,
                  refs.current.selection?.max.row ?? 0
                ) + expandSelectionRowsCount,
            })
          }
          setExpandingSelectionFromRowIndex(null)
        }

        setSelectionMode({
          columns: false,
          rows: false,
          active: false,
        })
      }, [
        expandingSelectionFromRowIndex,
        setSelectionMode,
        expandSelectionRowsCount,
        activeCell,
        data,
        onChange,
        setActiveCell,
        setSelectionCell,
        columns,
        isCellDisabled,
      ])
      useDocumentEventListener('mouseup', onMouseUp)

      // eslint-disable-next-line react-hooks/exhaustive-deps
      const onMouseMove = useCallback(
        throttle(25, (event: MouseEvent) => {
          const cursorIndex = getCursorIndex(event)

          if (cursorIndex === lastCursorIndex.current) {
            return
          }

          lastCursorIndex.current = cursorIndex

          if (refs.current.expandingSelectionFromRowIndex !== null) {
            if (cursorIndex) {
              setExpandSelectionRowsCount(
                Math.max(
                  0,
                  cursorIndex.row - refs.current.expandingSelectionFromRowIndex
                )
              )

              // Commenting might cause weird behavior
              /*
              scrollTo({
                col: cursorIndex.col,
                row: Math.max(
                  cursorIndex.row,
                  expandingSelectionFromRowIndexRef.current
                ),
              })*/
            }
          }

          if (refs.current.selectionMode.active) {
            const lastColumnIndex =
              columns.length - (hasStickyRightColumn ? 3 : 2)

            setSelectionCell(
              cursorIndex && {
                col: refs.current.selectionMode.columns
                  ? Math.max(0, Math.min(lastColumnIndex, cursorIndex.col))
                  : lastColumnIndex,
                row: refs.current.selectionMode.rows
                  ? Math.max(0, cursorIndex.row)
                  : data.length - 1,
                doNotScrollX: !refs.current.selectionMode.columns,
                doNotScrollY: !refs.current.selectionMode.rows,
              }
            )
            if (refs.current.editing !== false) setEditing(false)
          }
        }),
        [
          getCursorIndex,
          columns.length,
          hasStickyRightColumn,
          setSelectionCell,
          data.length,
        ]
      )
      useDocumentEventListener('mousemove', onMouseMove)

      const onCellKeyDown = useCallback(
        (
          rowId: React.Key,
          columnId: React.Key,
          e: React.KeyboardEvent,
          isActive: boolean
        ) => {
          const rowIndex = dataRef.current.findIndex(
            (row) => getRowId(dataRef.current.indexOf(row)) === rowId
          )
          const columnIndex = columns.findIndex(
            (column) => column.id === columnId
          )

          const fn = columns[columnIndex]?.onCellKeyDown

          if (fn) {
            fn(
              {
                rowData: dataRef.current[rowIndex],
                rowId: rowId.toString(),
                columnId: columnId.toString(),
                setRowData: () =>
                  setRowData(rowIndex, dataRef.current[rowIndex]),
                stopEditing,
                deleteRow: () => deleteRows(rowIndex),
                duplicateRow: () => duplicateRows(rowIndex),
                insertRowBelow: () => insertRowAfter(rowIndex),
                toggleSelection: () => toggleSelection(rowIndex),
                selected: selectedRowsRef.current.has(getRowId(rowIndex)),
                getContextMenuItems,
                selectRows,
                getRowId,
                table: tableCallbacks.current,

                isActive,
              },
              e
            )
          }
        },
        [
          columns,
          deleteRows,
          duplicateRows,
          getContextMenuItems,
          getRowId,
          insertRowAfter,
          selectRows,
          setRowData,
          stopEditing,
          toggleSelection,
        ]
      )

      const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
          if (!refs.current.activeCell) {
            return
          }

          if (event.isComposing) {
            console.log('is composing')
            return
          }

          // Tab from last cell of a row
          if (
            event.key === 'Tab' &&
            !event.shiftKey &&
            refs.current.activeCell.col ===
              columns.length - (hasStickyRightColumn ? 3 : 2) &&
            !columns[refs.current.activeCell.col + 1].disableKeys
          ) {
            // Last row
            if (refs.current.activeCell.row === data.length - 1) {
              if (afterTabIndexRef.current) {
                event.preventDefault()

                setActiveCell(null)
                setSelectionCell(null)
                setEditing(false)

                const allElements = getAllTabbableElements()
                const index = allElements.indexOf(afterTabIndexRef.current)

                allElements[(index + 1) % allElements.length].focus()

                return
              }
            } else {
              setActiveCell((cell) => ({ col: 0, row: (cell?.row ?? 0) + 1 }))
              setSelectionCell(null)
              setEditing(false)
              event.preventDefault()

              return
            }
          }

          // Shift+Tab from first cell of a row
          if (
            event.key === 'Tab' &&
            event.shiftKey &&
            refs.current.activeCell.col === 0 &&
            !columns[refs.current.activeCell.col + 1].disableKeys
          ) {
            // First row
            if (refs.current.activeCell.row === 0) {
              if (beforeTabIndexRef.current) {
                event.preventDefault()

                setActiveCell(null)
                setSelectionCell(null)
                setEditing(false)

                const allElements = getAllTabbableElements()
                const index = allElements.indexOf(beforeTabIndexRef.current)

                allElements[
                  (index - 1 + allElements.length) % allElements.length
                ].focus()

                return
              }
            } else {
              setActiveCell((cell) => ({
                col: columns.length - (hasStickyRightColumn ? 3 : 2),
                row: (cell?.row ?? 1) - 1,
              }))
              setSelectionCell(null)
              setEditing(false)
              event.preventDefault()

              return
            }
          }

          if (event.key?.startsWith('Arrow') || event.key === 'Tab') {
            if (
              editing &&
              columns[refs.current.activeCell.col + 1].disableKeys
            ) {
              return
            }

            if (editing && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
              return
            }

            const add = (
              [x, y]: [number, number],
              cell: Cell | null
            ): Cell | null =>
              cell && {
                col: Math.max(
                  0,
                  Math.min(
                    columns.length - (hasStickyRightColumn ? 3 : 2),
                    cell.col + x
                  )
                ),
                row: Math.max(0, Math.min(data.length - 1, cell.row + y)),
              }

            if (event.key === 'Tab' && event.shiftKey) {
              setActiveCell((cell) => add([-1, 0], cell))
              setSelectionCell(null)
            } else {
              const direction = {
                ArrowDown: [0, 1],
                ArrowUp: [0, -1],
                ArrowLeft: [-1, 0],
                ArrowRight: [1, 0],
                Tab: [1, 0],
              }[event.key] as [number, number]

              if (event.ctrlKey || event.metaKey) {
                direction[0] *= columns.length
                direction[1] *= data.length
              }

              if (event.shiftKey) {
                setSelectionCell((cell) =>
                  add(direction, cell || refs.current.activeCell)
                )
              } else {
                setActiveCell((cell) => add(direction, cell))
                setSelectionCell(null)
              }
            }
            setEditing(false)

            event.preventDefault()
          } else if (event.key === 'Escape') {
            if (!editing && !refs.current.selectionCell) {
              setActiveCell(null)
            }

            setSelectionCell(null)
            setEditing(false)
          } else if (
            (event.key === 'Enter' || event.key === 'F2') &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            !event.shiftKey
          ) {
            setSelectionCell(null)

            if (editing) {
              if (!columns[refs.current.activeCell.col + 1].disableKeys) {
                stopEditing()
                event.preventDefault()
              }
            } else if (!isCellDisabled(refs.current.activeCell)) {
              lastEditingCellRef.current = refs.current.activeCell
              setEditing(true)
              scrollTo(refs.current.activeCell)
              event.preventDefault()
            }
          } else if (
            event.key === 'Enter' &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            event.shiftKey
          ) {
            insertRowAfter(
              refs.current.selection?.max.row || refs.current.activeCell.row
            )
          } else if (
            event.key === 'd' &&
            (event.ctrlKey || event.metaKey) &&
            !event.altKey &&
            !event.shiftKey
          ) {
            duplicateRows(
              refs.current.selection?.min.row || refs.current.activeCell.row,
              refs.current.selection?.max.row
            )
            event.preventDefault()
          } else if (
            (isPrintableUnicode(event.key) || event.code.match(/Key[A-Z]$/)) &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey
          ) {
            if (!editing && !isCellDisabled(refs.current.activeCell)) {
              lastEditingCellRef.current = refs.current.activeCell
              setSelectionCell(null)
              setEditing(true)
              scrollTo(refs.current.activeCell)
            }
          } else if (['Backspace', 'Delete'].includes(event.key)) {
            if (!editing) {
              deleteSelection()
              event.preventDefault()
            }
          } else if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
            if (!editing) {
              setActiveCell({
                col: 0,
                row: 0,
                doNotScrollY: true,
                doNotScrollX: true,
              })
              setSelectionCell({
                col: columns.length - (hasStickyRightColumn ? 3 : 2),
                row: data.length - 1,
                doNotScrollY: true,
                doNotScrollX: true,
              })
              event.preventDefault()
            }
          }

          const activeColumn = columns[refs.current.activeCell.col + 1]
          onCellKeyDown(
            getRowId(refs.current.activeCell.row),
            activeColumn.id ?? (refs.current.activeCell.col + 1).toString(),
            event as unknown as React.KeyboardEvent,
            refs.current.activeCell.row === refs.current.selection?.max.row
          )
        },
        [
          columns,
          hasStickyRightColumn,
          onCellKeyDown,
          getRowId,
          data.length,
          setActiveCell,
          setSelectionCell,
          editing,
          isCellDisabled,
          stopEditing,
          scrollTo,
          insertRowAfter,
          duplicateRows,
          deleteSelection,
        ]
      )
      useDocumentEventListener('keydown', onKeyDown)

      const onContextMenu = useCallback(
        (event: MouseEvent) => {
          const clickInside =
            innerRef.current?.contains(event.target as Node) || false

          const cursorIndex = clickInside
            ? getCursorIndex(event, true, true)
            : null

          const clickOnActiveCell =
            cursorIndex &&
            refs.current.activeCell &&
            refs.current.activeCell.col === cursorIndex.col &&
            refs.current.activeCell.row === cursorIndex.row &&
            editing

          if (clickInside && !clickOnActiveCell) {
            event.preventDefault()
          }
        },
        [getCursorIndex, editing]
      )
      useDocumentEventListener('contextmenu', onContextMenu)

      useEffect(() => {
        if (!refs.current.contextMenu) return
        const items: ContextMenuItem[] = []

        if (activeCell?.row !== undefined) {
          items.push(
            {
              type: 'COPY',
              action: (): void => {
                onCopy()
                setContextMenu(null)
              },
            },
            {
              type: 'CUT',
              action: (): void => {
                onCut()
                setContextMenu(null)
              },
            },
            {
              type: 'PASTE',
              action: async (): Promise<void> => {
                if (navigator.clipboard.read !== undefined) {
                  const items = await navigator.clipboard.read()
                  items.forEach(async (item) => {
                    let pasteData = [['']]
                    if (item.types.includes('text/html')) {
                      const htmlTextData = await item.getType('text/html')
                      pasteData = parseTextHtmlData(await htmlTextData.text())
                    } else if (item.types.includes('text/plain')) {
                      const plainTextData = await item.getType('text/plain')
                      pasteData = parseTextPlainData(await plainTextData.text())
                    } else if (item.types.includes('text')) {
                      const htmlTextData = await item.getType('text')
                      pasteData = parseTextHtmlData(await htmlTextData.text())
                    }
                    applyPasteDataToDatasheet(pasteData)
                  })
                } else if (navigator.clipboard.readText !== undefined) {
                  const text = await navigator.clipboard.readText()
                  applyPasteDataToDatasheet(parseTextPlainData(text))
                } else {
                  alert(
                    'This action is unavailable in your browser, but you can still use Ctrl+V for paste'
                  )
                }
                setContextMenu(null)
              },
            }
          )
        }

        if (selection?.max.row !== undefined) {
          items.push({
            type: 'INSERT_ROW_BELLOW',
            action: () => {
              setContextMenu(null)
              insertRowAfter(selection.max.row)
            },
          })
        } else if (activeCell?.row !== undefined) {
          items.push({
            type: 'INSERT_ROW_BELLOW',
            action: () => {
              setContextMenu(null)
              insertRowAfter(activeCell.row)
            },
          })
        }

        if (
          selection?.min.row !== undefined &&
          selection.min.row !== selection.max.row
        ) {
          items.push({
            type: 'DUPLICATE_ROWS',
            fromRow: selection.min.row + 1,
            toRow: selection.max.row + 1,
            action: () => {
              setContextMenu(null)
              duplicateRows(selection.min.row, selection.max.row)
            },
          })
        } else if (activeCell?.row !== undefined) {
          items.push({
            type: 'DUPLICATE_ROW',
            action: () => {
              setContextMenu(null)
              duplicateRows(activeCell.row)
            },
          })
        }

        if (
          selection?.min.row !== undefined &&
          selection.min.row !== selection.max.row
        ) {
          items.push({
            type: 'DELETE_ROWS',
            fromRow: selection.min.row + 1,
            toRow: selection.max.row + 1,
            action: () => {
              setContextMenu(null)
              deleteRows(selection.min.row, selection.max.row)
            },
          })
        } else if (activeCell?.row !== undefined) {
          items.push({
            type: 'DELETE_ROW',
            action: () => {
              setContextMenu(null)
              deleteRows(activeCell.row)
            },
          })
        }

        setContextMenuItems(items)
        if (!items.length) {
          setContextMenu(null)
        }
      }, [
        selection,
        activeCell,
        deleteRows,
        duplicateRows,
        insertRowAfter,
        onCut,
        onCopy,
        applyPasteDataToDatasheet,
      ])

      const _setActiveCell = useCallback(
        (value: CellWithIdInput | null) => {
          const cell = getCell(
            value,
            columns.length - (hasStickyRightColumn ? 2 : 1),
            data.length,
            columns
          )

          setActiveCell(cell)
          setEditing(false)
          setSelectionMode({ columns: false, active: false, rows: false })
          setSelectionCell(null)
        },
        [
          columns,
          data.length,
          hasStickyRightColumn,
          setActiveCell,
          setSelectionCell,
          setSelectionMode,
        ]
      )

      const _setSelection = useCallback(
        (value: SelectionWithIdInput | null) => {
          const selection = getSelection(
            value,
            columns.length - (hasStickyRightColumn ? 2 : 1),
            data.length,
            columns
          )

          setActiveCell(selection?.min || null)
          setEditing(false)
          setSelectionMode({ columns: false, active: false, rows: false })
          setSelectionCell(selection?.max || null)
        }, // eslint-disable-next-line react-hooks/exhaustive-deps
        [columns, data.length, hasStickyRightColumn]
      )

      useImperativeHandle(ref, () => ({
        activeCell: getCellWithId(activeCell, columns),
        selection: getSelectionWithId(
          selection ??
            (activeCell ? { min: activeCell, max: activeCell } : null),
          columns
        ),
        setSelection: _setSelection,
        setActiveCell: _setActiveCell,
      }))

      const callbacksRef = useRef({
        onFocus,
        onBlur,
        onActiveCellChange,
        onSelectionChange,
      })
      callbacksRef.current.onFocus = onFocus
      callbacksRef.current.onBlur = onBlur
      callbacksRef.current.onActiveCellChange = onActiveCellChange
      callbacksRef.current.onSelectionChange = onSelectionChange

      const columnWidthsRef = useRef(columnWidths)
      columnWidthsRef.current = columnWidths

      const tableCallbacks = useRef<TableCallbackProps>({
        setSelection: _setSelection,
        setActiveCell: _setActiveCell,
        getRowId,
        getRowData: (rowIndex: number) => dataRef.current[rowIndex],

        getActiveCell: () => refs.current.activeCell,
        getCellSelection: () => selectionRef.current,

        getColumnVisibilityModel: () =>
          columnVisibilityModelRef.current ?? new Set(),
        setColumnVisibilityModel:
          onColumnVisibilityChangeRef.current ?? (() => undefined),

        getColumnWidths: () => columnWidthsRef.current,
      })

      tableCallbacks.current.setSelection = _setSelection
      tableCallbacks.current.setActiveCell = _setActiveCell

      useEffect(() => {
        if (lastEditingCellRef.current) {
          if (editing) {
            callbacksRef.current.onFocus({
              cell: getCellWithId(lastEditingCellRef.current, columns),
            })
          } else {
            callbacksRef.current.onBlur({
              cell: getCellWithId(lastEditingCellRef.current, columns),
            })
          }
        }
      }, [editing, columns])

      useEffect(() => {
        callbacksRef.current.onActiveCellChange({
          cell: getCellWithId(activeCell, columns),
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [activeCell?.col, activeCell?.row, columns])

      useEffect(() => {
        callbacksRef.current.onSelectionChange({
          selection: getSelectionWithId(
            selection ??
              (activeCell ? { min: activeCell, max: activeCell } : null),
            columns
          ),
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selection?.min.col ?? activeCell?.col,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selection?.min.row ?? activeCell?.row,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selection?.max.col ?? activeCell?.col,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selection?.max.row ?? activeCell?.row,
        activeCell?.col,
        activeCell?.row,
        columns,
      ])

      const getStickyColumnWidth = useCallback(
        (side: 'left' | 'right') => {
          if (side === 'right' && !hasStickyRightColumn) {
            return 0
          }

          if (side === 'left' && !hasStickyLeftColumn) {
            return 0
          }

          let width = 0

          for (let i = 0; i < columns.length; i++) {
            if (columns[i].sticky === side) {
              width += columnWidths?.[i] ?? 100
            }
          }

          return width
        },
        [columnWidths, columns, hasStickyLeftColumn, hasStickyRightColumn]
      )

      const getStickyColumnMaxIndex = useCallback(
        (side: 'left' | 'right') => {
          let index = 0

          if (!hasStickyLeftColumn && side === 'left') return undefined
          if (!hasStickyRightColumn && side === 'right') return undefined

          if (side === 'left') {
            for (let i = 0; i < columns.length; i++) {
              if (columns[i].sticky === 'left') {
                index = i
              }
            }

            return index
          } else {
            // Return first right
            for (let i = columns.length - 1; i >= 0; i--) {
              if (columns[i].sticky === 'right') {
                return i
              }
            }
          }
          return undefined
        },
        [columns, hasStickyLeftColumn, hasStickyRightColumn]
      )

      const beforeTabIndexFocus = useCallback(
        (event: React.FocusEvent<HTMLDivElement, Element>) => {
          event.target.blur()
          setActiveCell({ col: 0, row: 0 })
        },
        [setActiveCell]
      )

      const afterTabIndexFocus = useCallback(
        (event: React.FocusEvent<HTMLDivElement, Element>) => {
          event.target.blur()
          setActiveCell({
            col: columns.length - (hasStickyRightColumn ? 3 : 2),
            row: data.length - 1,
          })
        },
        [columns.length, data.length, hasStickyRightColumn, setActiveCell]
      )

      return (
        <div className={className} style={style}>
          <div
            ref={beforeTabIndexRef}
            tabIndex={rawColumns.length && data.length ? 0 : undefined}
            onFocus={beforeTabIndexFocus}
          />

          <Grid
            columns={columns}
            outerRef={outerRef}
            columnWidths={columnWidths}
            hasStickyRightColumn={hasStickyRightColumn}
            hasStickyLeftColumn={hasStickyLeftColumn}
            outerHeight={height}
            data={data}
            fullWidth={fullWidth}
            headerRowHeight={headerRowHeight}
            activeCell={activeCell}
            innerRef={innerRef}
            rowHeight={getRowSize}
            rowKey={rowKey}
            selection={selection}
            rowClassName={rowClassName}
            editing={editing}
            getContextMenuItems={getContextMenuItems}
            setRowData={setRowData}
            deleteRows={deleteRows}
            insertRowAfter={insertRowAfter}
            duplicateRows={duplicateRows}
            stopEditing={stopEditing}
            cellClassName={cellClassName}
            onScroll={onScroll}
            loading={loading}
            loadingRowComponent={loadingRowComponent}
            loadingRowCount={loadingRowCount}
            loadingRowHeight={loadingRowHeight}
            selectedRows={selectedRows}
            selectRows={selectRows}
            toggleSelection={toggleSelection}
            selectAllRows={selectAllRows}
            getRowId={getRowId}
            table={tableCallbacks.current}
            getStickyColumnWidth={getStickyColumnWidth}
            bottomReachedBuffer={bottomReachedBuffer}
            onBottomReached={onBottomReached}
            onBottomDataReached={onBottomDataReached}
            onBottomThrottleRate={onBottomThrottleRate}
            overscanRows={overscanRows}
          >
            <SelectionRect
              columnRights={columnRights}
              columnWidths={columnWidths}
              activeCell={activeCell}
              selection={selection}
              headerRowHeight={headerRowHeight}
              rowHeight={getRowSize}
              hasStickyRightColumn={hasStickyRightColumn}
              hasStickyLeftColumn={hasStickyLeftColumn}
              dataLength={loading ? loadingRowCount : data.length}
              viewHeight={height}
              viewWidth={width}
              contentWidth={fullWidth ? undefined : contentWidth}
              edges={edges}
              editing={editing}
              isCellDisabled={isCellDisabled}
              isCellInteractive={isCellInteractive}
              expandSelection={expandSelection}
              getStickyColumnWidth={getStickyColumnWidth}
              getStickyColumnMaxIndex={getStickyColumnMaxIndex}
            />
          </Grid>
          <div
            ref={afterTabIndexRef}
            tabIndex={rawColumns.length && data.length ? 0 : undefined}
            onFocus={afterTabIndexFocus}
          />
          {!lockRows && AddRowsComponent && (
            <AddRowsComponent
              addRows={(count) => insertRowAfter(data.length - 1, count)}
            />
          )}
          {contextMenu && contextMenuItems.length > 0 && (
            <ContextMenu
              clientX={contextMenu.x}
              clientY={contextMenu.y}
              cursorIndex={contextMenu.cursorIndex}
              items={contextMenuItems}
              close={() => setContextMenu(null)}
            />
          )}
        </div>
      )
    }
  )
) as <T extends any>(
  props: DataSheetGridProps<T> & { ref?: React.ForwardedRef<DataSheetGridRef> }
) => JSX.Element

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
DataSheetGrid.displayName = 'DataSheetGrid'
