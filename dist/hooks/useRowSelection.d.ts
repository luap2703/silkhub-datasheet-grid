export declare const useRowSelection: <T extends any>(rowSelection: string[] | undefined, onRowSelectionChange: ((rowSelection: string[] | ((prev: string[]) => string[])) => void) | undefined) => {
    selectedRows: Set<string>;
    handleRowSelection: (rowId: string) => void;
    selectRows: (rowSelection: string[] | ((prev: string[]) => string[])) => void;
};
//# sourceMappingURL=useRowSelection.d.ts.map