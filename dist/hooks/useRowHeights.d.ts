import { DataSheetGridProps, RowType } from '../types';
type RowSize = {
    height: number;
    top: number;
};
export declare const useRowHeights: <T extends RowType>({ value, rowHeight, }: Required<Pick<DataSheetGridProps<T>, "value" | "rowHeight">>) => {
    resetAfter: (index: number) => void;
    getRowSize: (index: number) => RowSize;
    getRowIndex: (top: number) => number;
    totalSize: (maxHeight: number) => number;
};
export {};
//# sourceMappingURL=useRowHeights.d.ts.map