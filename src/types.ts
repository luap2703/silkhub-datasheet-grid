import React, { ReactNode, RefObject } from 'react'

export type Cell = {
  col: number
  row: number
}

export type Selection = { min: Cell; max: Cell }

export type CellProps<T, C> = {
  rowData: T
  rowIndex: number
  rowId: string
  columnIndex: number
  active: boolean
  focus: boolean
  disabled: boolean
  columnData: C
} & CellHandlersProps<T>

export type CellHandlersProps<T> = {
  setRowData: (rowData: T) => void
  stopEditing: (opts?: { nextRow?: boolean }) => void
  insertRowBelow: () => void
  duplicateRow: () => void
  deleteRow: () => void
  getContextMenuItems: () => ContextMenuItem[]

  selected: boolean
  toggleSelection: ToggleSelectionHandler
  selectRows: SelectRowsHandler

  getRowId: (rowIndex: number) => React.Key

  table: TableCallbackProps
}

export type ToggleSelectionHandler = () => void
export type SelectRowsHandler = (
  rowSelection: string[] | ((prev: string[]) => string[])
) => void

export type CellComponent<T, C> = React.FC<CellProps<T, C>>
export type HeaderCellComponent<C> = React.FC<{
  columnData: C
  selectedRows: string[]
  selectRows: SelectRowsHandler
  selectAllRows: () => void

  table: TableCallbackProps
}>

/**
 * Result type of a key selector function
 * @description This type is used to merge the updated value with the original row data.
 * @param operationValue - Is used when the key prop of the column is a selector function. Then we want to result an updated value in the operation object. (We can't return it in the original key prop, because we don't have one)
 */
export type OperationResult<T> =
  | T
  | ({ $operationValue?: Record<string, any> } & T)

export type Column<T, C, PasteValue> = {
  id?: string
  headerClassName?: string
  title?: HeaderCellComponent<C>

  /** @deprecated Use `basis`, `grow`, and `shrink` instead */
  width?: string | number
  basis: number
  grow: number
  shrink: number
  minWidth: number
  maxWidth?: number
  component: CellComponent<T, C>
  columnData?: C
  disableKeys: boolean
  disabled: boolean | ((opt: { rowData: T; rowIndex: number }) => boolean)
  interactive: boolean | ((opt: { rowData: T; rowIndex: number }) => boolean)
  cellClassName?:
    | string
    | ((opt: {
        rowData: T
        rowIndex: number
        columnId?: string
      }) => string | undefined)
  keepFocus: boolean
  deleteValue: (opt: { rowData: T; rowIndex: number }) => OperationResult<T>
  copyValue: (opt: { rowData: T; rowIndex: number }) => number | string | null
  pasteValue: (opt: {
    rowData: T
    value: PasteValue
    rowIndex: number
  }) => OperationResult<T>
  prePasteValues: (values: string[]) => PasteValue[] | Promise<PasteValue[]>
  isCellEmpty: (opt: { rowData: T; rowIndex: number }) => boolean

  onCellKeyDown?: (
    opt: {
      rowData: T
      rowId: string
      columnId?: string
      isActive: boolean
    } & CellHandlersProps<T>,
    e: React.KeyboardEvent
  ) => void

  disableEditing: boolean

  disablePadding: boolean

  sticky?: 'left' | 'right'

  contextMenuComponent?: ContextMenuType
}

export type ContextMenuType = (
  props: ContextMenuComponentProps
) => React.ReactElement<any> | null

export type SelectionContextType = {
  columnRights?: number[]
  columnWidths?: number[]
  activeCell: Cell | null
  selection: Selection | null
  dataLength: number
  rowHeight: (index: number) => { height: number; top: number }
  hasStickyRightColumn: boolean
  hasStickyLeftColumn: boolean
  editing: boolean
  isCellDisabled: (cell: Cell) => boolean
  isCellInteractive: (cell: Cell) => boolean
  headerRowHeight: number
  viewWidth?: number
  viewHeight?: number
  contentWidth?: number
  edges: { top: boolean; right: boolean; bottom: boolean; left: boolean }
  expandSelection: number | null

  getStickyColumnWidth: (side: 'left' | 'right') => number
  getStickyColumnMaxIndex: (side: 'left' | 'right') => number | undefined
}

export type SimpleColumn<T, C> = Partial<
  Pick<
    Column<T, C, string>,
    | 'title'
    | 'maxWidth'
    | 'minWidth'
    | 'basis'
    | 'grow'
    | 'shrink'
    | 'component'
    | 'columnData'
  >
>

export type AddRowsComponentProps = {
  addRows: (count?: number) => void
}

export type ContextMenuItem =
  | {
      type:
        | 'INSERT_ROW_BELLOW'
        | 'DELETE_ROW'
        | 'DUPLICATE_ROW'
        | 'COPY'
        | 'CUT'
        | 'PASTE'
      action: () => void
    }
  | {
      type: 'DELETE_ROWS' | 'DUPLICATE_ROWS'
      action: () => void
      fromRow: number
      toRow: number
    }

export type ContextMenuComponentProps = {
  clientX: number
  clientY: number
  items: ContextMenuItem[]
  cursorIndex: Cell
  close: () => void
}

export type Operation = {
  type: 'UPDATE' | 'DELETE' | 'CREATE'
  fromRowIndex: number
  toRowIndex: number
}

export type RowType =
  | {
      isGroup?: boolean
    }
  | null
  | undefined

export type DataSheetGridProps<T extends RowType> = {
  value?: T[]
  style?: React.CSSProperties
  className?: string
  rowClassName?:
    | string
    | ((opt: { rowData: T; rowIndex: number }) => string | undefined)
  cellClassName?:
    | string
    | ((opt: {
        rowData: unknown
        rowIndex: number
        columnId?: string
      }) => string | undefined)
  onChange?: (value: OperationResult<T>[], operations: Operation[]) => void
  columns?: Partial<Column<T, any, any>>[]
  gutterColumn?: SimpleColumn<T, any> | false

  rowKey?: string | ((opts: { rowData: T; rowIndex: number }) => string)
  height?: number
  rowHeight?: number | ((opt: { rowData: T; rowIndex: number }) => number)
  headerRowHeight?: number
  addRowsComponent?:
    | ((props: AddRowsComponentProps) => React.ReactElement<any> | null)
    | false
  createRow?: () => T
  duplicateRow?: (opts: { rowData: T; rowIndex: number }) => T
  autoAddRow?: boolean
  lockRows?: boolean
  disableContextMenu?: boolean
  disableExpandSelection?: boolean
  disableSmartDelete?: boolean
  contextMenuComponent?: (
    props: ContextMenuComponentProps
  ) => React.ReactElement<any> | null
  onFocus?: (opts: { cell: CellWithId }) => void
  onBlur?: (opts: { cell: CellWithId }) => void
  onActiveCellChange?: (opts: { cell: CellWithId | null }) => void
  onSelectionChange?: (opts: { selection: SelectionWithId | null }) => void
  onScroll?: React.UIEventHandler<HTMLDivElement> | undefined

  onBottomReached?: () => void

  onBottomDataReached?: (index: number) => void

  onBottomThrottleRate?: number

  bottomReachedBuffer?: number

  loading?: boolean
  enforceLoading?: boolean

  loadingRowCount?: number
  loadingRowHeight?: number
  loadingRowComponent?: ReactNode

  rowSelection?: string[]
  onRowSelectionChange?:
    | ((rowSelection: string[] | ((prev: string[]) => string[])) => void)
    | undefined

  columnVisibilityModel?: ColumnVisibilityModel
  onColumnVisibilityChange?: ColumnVisibilityModelChangeHandler

  onCellCopy?: (cells: Cell[], textPlain: string, textHtml: string) => void

  overscanRows?: number

  fullWidth?: boolean

  groupRowComponent?: GroupRowComponent<T>
  groupRowComponentProps?: GroupRowComponentProps<T>
}

export type GroupRowComponentProps<T> = Partial<
  Omit<Column<T, any, any>, 'component' | 'title'> & {
    keepColsLeft?: number
    keepColsRight?: number
  }
>

export type GroupRowComponent<T> = (v: {
  rowData: T
  rowIndex: number
}) => React.ReactNode

export type ColumnVisibilityModel = Set<string>
export type ColumnVisibilityModelChangeHandler = (
  columnVisibilityModel: ColumnVisibilityModel
) => void

export type CellWithIdInput = {
  col: number | string
  row: number
}

export type SelectionWithIdInput = {
  min: CellWithIdInput
  max: CellWithIdInput
}

export type CellWithId = {
  colId?: string
  col: number
  row: number
}

export type SelectionWithId = { min: CellWithId; max: CellWithId }

export type DataSheetGridRef = {
  activeCell: CellWithId | null
  selection: SelectionWithId | null
  setActiveCell: (activeCell: CellWithIdInput | null) => void
  setSelection: (selection: SelectionWithIdInput | null) => void
  scrollRef: RefObject<HTMLDivElement | null>
}

export type TableCallbackProps = {
  getCellSelection: () => SelectionWithId | null
  setSelection: (selection: SelectionWithId | null) => void

  getActiveCell: () => CellWithId | null
  setActiveCell: (activeCell: CellWithId | null) => void

  getColumnVisibilityModel: () => ColumnVisibilityModel
  setColumnVisibilityModel: (
    columnVisibilityModel: ColumnVisibilityModel
  ) => void

  getRowId: (rowIndex: number) => React.Key
  getRowData: (rowIndex: number) => unknown

  getColumnWidths: () => number[] | undefined
}
