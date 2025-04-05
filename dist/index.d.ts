import { Column as ColumnBase, CellComponent as CellComponentBase, CellProps as CellPropsBase, DataSheetGridProps as DataSheetGridPropsBase, AddRowsComponentProps as AddRowsComponentPropsBase, SimpleColumn as SimpleColumnBase, ContextMenuComponentProps as ContextMenuComponentPropsBase, ContextMenuItem as ContextMenuItemBase, DataSheetGridRef as DataSheetGridRefBase, RowType } from './types';
export type Column<T = any, C = any, PasteValue = string> = Partial<ColumnBase<T, C, PasteValue>>;
export type CellComponent<T = any, C = any> = CellComponentBase<T, C>;
export type CellProps<T = any, C = any> = CellPropsBase<T, C>;
export type DataSheetGridProps<T extends RowType = any> = DataSheetGridPropsBase<T>;
export type AddRowsComponentProps = AddRowsComponentPropsBase;
export type SimpleColumn<T = any, C = any> = SimpleColumnBase<T, C>;
export type ContextMenuComponentProps = ContextMenuComponentPropsBase;
export type ContextMenuItem = ContextMenuItemBase;
export type DataSheetGridRef = DataSheetGridRefBase;
export declare const DynamicDataSheetGrid: <T extends RowType>(props: DataSheetGridPropsBase<T> & {
    ref?: React.ForwardedRef<DataSheetGridRefBase>;
}) => import("react").JSX.Element;
export declare const DataSheetGrid: <T extends RowType>(props: DataSheetGridPropsBase<T> & {
    ref?: React.ForwardedRef<DataSheetGridRefBase>;
}) => import("react").JSX.Element;
export { textColumn, createTextColumn } from './columns/textColumn';
export { checkboxColumn } from './columns/checkboxColumn';
export { floatColumn } from './columns/floatColumn';
export { intColumn } from './columns/intColumn';
export { percentColumn } from './columns/percentColumn';
export { dateColumn } from './columns/dateColumn';
export { isoDateColumn } from './columns/isoDateColumn';
export { keyColumn } from './columns/keyColumn';
export { createAddRowsComponent } from './components/AddRows';
export { createContextMenuComponent, defaultRenderItem as renderContextMenuItem, } from './components/ContextMenu';
//# sourceMappingURL=index.d.ts.map