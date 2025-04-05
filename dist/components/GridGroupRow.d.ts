import React from 'react';
import { Virtualizer } from '@tanstack/react-virtual';
import { Cell, Column, ContextMenuItem, DataSheetGridProps, GroupRowComponent, GroupRowComponentProps, RowType } from '../types';
export declare const GridGroupRow: <T extends RowType>({ colVirtualizer, columns, data, row, rowIndex, loading, LoadingComponent, hasStickyLeftColumn, hasStickyRightColumn, activeCell, editing, getContextMenuItems, deleteGivenRow, duplicateGivenRow, stopEditing, insertAfterGivenRow, setGivenRowData, rowSelected, selectRows, toggleGivenRow, getRowId, table, groupRowComponentProps, GroupRowComponent, cellClassName, fullWidth, rowActive, }: {
    colVirtualizer: Virtualizer<HTMLDivElement, Element>;
    columns: Column<T, any, any>[];
    data: T[];
    row: {
        key: React.Key;
        index: number;
        size: number;
        start: number;
    };
    rowIndex: number;
    loading?: boolean;
    LoadingComponent: React.ReactNode;
    hasStickyLeftColumn: boolean;
    hasStickyRightColumn: boolean;
    activeCell: Cell | null;
    editing: boolean;
    getContextMenuItems: () => ContextMenuItem[];
    deleteGivenRow: (index: number) => () => void;
    duplicateGivenRow: (index: number) => () => void;
    stopEditing: (opts?: {
        nextRow?: boolean;
    }) => void;
    insertAfterGivenRow: (index: number) => () => void;
    setGivenRowData: (index: number) => (rowData: T) => void;
    rowSelected?: boolean;
    selectRows: (rowSelection: string[] | ((prev: string[]) => string[])) => void;
    toggleGivenRow: (index: number) => () => void;
    getRowId: (rowIndex: number) => React.Key;
    table: any;
    groupRowComponentProps?: GroupRowComponentProps<T>;
    GroupRowComponent: GroupRowComponent<T>;
    cellClassName: DataSheetGridProps<T>["cellClassName"];
    rowActive: boolean;
    fullWidth: boolean;
}) => React.JSX.Element;
//# sourceMappingURL=GridGroupRow.d.ts.map