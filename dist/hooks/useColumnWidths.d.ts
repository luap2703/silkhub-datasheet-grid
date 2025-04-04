import { Column } from '../types';
export declare const getColumnWidths: (containerWidth: number, columns: Pick<Column<any, any, any>, "basis" | "grow" | "shrink" | "minWidth" | "maxWidth">[]) => number[];
export declare const useColumnWidths: (columns: Column<any, any, any>[], width?: number, fullWidth?: boolean) => {
    fullWidth: boolean;
    columnWidths: undefined;
    columnRights: undefined;
    totalWidth: undefined;
} | {
    fullWidth: boolean;
    columnWidths: number[];
    columnRights: number[];
    totalWidth: number;
};
//# sourceMappingURL=useColumnWidths.d.ts.map