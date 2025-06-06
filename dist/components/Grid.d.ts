import React, { ReactNode, RefObject } from 'react';
import { Cell, Column, ContextMenuItem, DataSheetGridProps, GroupRowComponent, GroupRowComponentProps, RowType, Selection, TableCallbackProps } from '../types';
export declare const Grid: <T extends RowType>({ data, columns, outerRef, innerRef, columnWidths, hasStickyRightColumn, hasStickyLeftColumn, headerRowHeight, rowHeight, rowKey, fullWidth, selection, activeCell, rowClassName, cellClassName, children, editing, getContextMenuItems, setRowData, deleteRows, duplicateRows, insertRowAfter, stopEditing, onScroll, onBottomReached, onBottomDataReached, bottomReachedBuffer, loading, loadingRowComponent, loadingRowCount, loadingRowHeight, selectedRows, selectRows, toggleSelection, selectAllRows, getRowId, table, getStickyColumnWidth, outerHeight, overscanRows, groupRowComponent, groupRowComponentProps, }: {
    data: T[];
    columns: Column<T, any, any>[];
    outerRef: RefObject<HTMLDivElement | null>;
    innerRef: RefObject<HTMLDivElement | null>;
    columnWidths?: number[];
    hasStickyRightColumn: boolean;
    hasStickyLeftColumn: boolean;
    headerRowHeight: number;
    rowHeight: (index: number) => {
        height: number;
    };
    rowKey: DataSheetGridProps<T>["rowKey"];
    rowClassName: DataSheetGridProps<T>["rowClassName"];
    cellClassName: DataSheetGridProps<T>["cellClassName"];
    fullWidth: boolean;
    selection: Selection | null;
    activeCell: Cell | null;
    children: ReactNode;
    editing: boolean;
    getContextMenuItems: () => ContextMenuItem[];
    setRowData: (rowIndex: number, item: T) => void;
    deleteRows: (rowMin: number, rowMax?: number) => void;
    duplicateRows: (rowMin: number, rowMax?: number) => void;
    insertRowAfter: (row: number, count?: number) => void;
    stopEditing: (opts?: {
        nextRow?: boolean;
    }) => void;
    onScroll?: React.UIEventHandler<HTMLDivElement>;
    onBottomReached?: () => void;
    onBottomDataReached?: (index: number) => void;
    onBottomThrottleRate?: number;
    bottomReachedBuffer?: number;
    loading?: boolean;
    loadingRowCount?: number;
    loadingRowHeight?: number;
    loadingRowComponent?: ReactNode;
    selectedRows: Set<string>;
    outerHeight: number | undefined;
    selectRows: (rowSelection: string[] | ((prev: string[]) => string[])) => void;
    toggleSelection: (rowIndex: number) => void;
    getRowId: (rowIndex: number) => string;
    selectAllRows: () => void;
    table: TableCallbackProps;
    getStickyColumnWidth: (side: "left" | "right") => number;
    overscanRows: number | undefined;
    groupRowComponent?: GroupRowComponent<T>;
    groupRowComponentProps?: GroupRowComponentProps<T>;
}) => React.JSX.Element;
//# sourceMappingURL=Grid.d.ts.map