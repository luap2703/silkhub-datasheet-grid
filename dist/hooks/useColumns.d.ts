import { Column, ColumnVisibilityModel, SimpleColumn } from '../types';
export declare const parseFlexValue: (value: string | number) => {
    basis: number;
    grow: number;
    shrink: number;
};
export declare const useColumns: <T extends any>(columns: Partial<Column<T, any, any>>[], gutterColumn?: SimpleColumn<T, any> | false, columnVisibilityModel?: ColumnVisibilityModel) => Column<T, any, any>[];
//# sourceMappingURL=useColumns.d.ts.map