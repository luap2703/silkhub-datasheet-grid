"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grid = void 0;
const react_virtual_1 = require("@tanstack/react-virtual");
const react_1 = __importStar(require("react"));
const classnames_1 = __importDefault(require("classnames"));
const Cell_1 = require("./Cell");
const useMemoizedIndexCallback_1 = require("../hooks/useMemoizedIndexCallback");
const HorizontalScrollShadow_1 = require("./HorizontalScrollShadow");
const throttle_debounce_1 = require("throttle-debounce");
const loading_key_1 = require("../utils/loading-key");
const GridGroupRow_1 = require("./GridGroupRow");
const FallbackHeader = () => react_1.default.createElement(react_1.default.Fragment, null);
const Grid = ({ data, columns, outerRef, innerRef, columnWidths, hasStickyRightColumn, hasStickyLeftColumn, 
//displayHeight,
headerRowHeight, rowHeight, rowKey, fullWidth, selection, activeCell, rowClassName, cellClassName, children, editing, getContextMenuItems, setRowData, deleteRows, duplicateRows, insertRowAfter, stopEditing, onScroll, onBottomReached, onBottomDataReached, bottomReachedBuffer = 300, loading, loadingRowComponent, loadingRowCount = 10, loadingRowHeight, selectedRows, selectRows, toggleSelection, selectAllRows, getRowId, table, getStickyColumnWidth, outerHeight, overscanRows = 10, groupRowComponent, groupRowComponentProps, }) => {
    var _a, _b, _c, _d;
    const dataRef = (0, react_1.useRef)(data);
    dataRef.current = data;
    const onBottomDataReachedRef = (0, react_1.useRef)(onBottomDataReached);
    onBottomDataReachedRef.current = onBottomDataReached;
    const LoadingComponent = (0, react_1.useMemo)(() => loadingRowComponent !== null && loadingRowComponent !== void 0 ? loadingRowComponent : react_1.default.createElement("div", null, "Loading..."), [loadingRowComponent]);
    const rowVirtualizer = (0, react_virtual_1.useVirtualizer)({
        count: loading ? loadingRowCount : data.length,
        getScrollElement: () => outerRef.current,
        paddingStart: headerRowHeight,
        estimateSize: (index) => loading
            ? (loadingRowHeight !== null && loadingRowHeight !== void 0 ? loadingRowHeight : rowHeight(index).height)
            : rowHeight(index).height,
        getItemKey: (index) => {
            var _a;
            const row = data[index];
            if (row == null) {
                return (0, loading_key_1.getLoadingKey)(index);
            }
            if (rowKey && !loading) {
                if (typeof rowKey === 'function') {
                    return (_a = rowKey({ rowData: row, rowIndex: index })) !== null && _a !== void 0 ? _a : index;
                }
                else if (typeof rowKey === 'string' &&
                    row instanceof Object &&
                    rowKey in row) {
                    const key = row[rowKey];
                    if (typeof key === 'string' || typeof key === 'number') {
                        return key !== null && key !== void 0 ? key : index;
                    }
                }
            }
            return index;
        },
        overscan: overscanRows,
    });
    const colVirtualizer = (0, react_virtual_1.useVirtualizer)({
        count: columns.length,
        getScrollElement: () => outerRef.current,
        estimateSize: (index) => { var _a; return (_a = columnWidths === null || columnWidths === void 0 ? void 0 : columnWidths[index]) !== null && _a !== void 0 ? _a : 100; },
        horizontal: true,
        getItemKey: (index) => { var _a; return (_a = columns[index].id) !== null && _a !== void 0 ? _a : index; },
        overscan: 1,
        rangeExtractor: (range) => {
            let result = (0, react_virtual_1.defaultRangeExtractor)(range);
            // Make sure all left sticky columns are included
            if (hasStickyLeftColumn) {
                const leftColumns = [];
                for (let i = 0; i < columns.length; i++) {
                    if (columns[i].sticky !== 'left') {
                        break;
                    }
                    leftColumns.push(i);
                }
                // Now remove any left column from result to then add them back in the correct order
                result = result.filter((i) => !leftColumns.includes(i));
                result = [...leftColumns, ...result];
            }
            if (result[0] !== 0) {
                result.unshift(0);
            }
            // Make sure all right sticky columns are included
            if (hasStickyRightColumn) {
                const rightColumns = [];
                for (let i = columns.length - 1; i >= 0; i--) {
                    if (columns[i].sticky !== 'right') {
                        break;
                    }
                    rightColumns.push(i);
                }
                // Now remove any right column from result to then add them back in the correct order
                result = result.filter((i) => !rightColumns.includes(i));
                result = [...result, ...rightColumns];
            }
            return result;
        },
    });
    (0, react_1.useEffect)(() => {
        colVirtualizer.measure();
    }, [colVirtualizer, columnWidths]);
    const setGivenRowData = (0, useMemoizedIndexCallback_1.useMemoizedIndexCallback)(setRowData, 1);
    const deleteGivenRow = (0, useMemoizedIndexCallback_1.useMemoizedIndexCallback)(deleteRows, 0);
    const duplicateGivenRow = (0, useMemoizedIndexCallback_1.useMemoizedIndexCallback)(duplicateRows, 0);
    const insertAfterGivenRow = (0, useMemoizedIndexCallback_1.useMemoizedIndexCallback)(insertRowAfter, 0);
    const selectionColMin = (_a = selection === null || selection === void 0 ? void 0 : selection.min.col) !== null && _a !== void 0 ? _a : activeCell === null || activeCell === void 0 ? void 0 : activeCell.col;
    const selectionColMax = (_b = selection === null || selection === void 0 ? void 0 : selection.max.col) !== null && _b !== void 0 ? _b : activeCell === null || activeCell === void 0 ? void 0 : activeCell.col;
    const selectionMinRow = (_c = selection === null || selection === void 0 ? void 0 : selection.min.row) !== null && _c !== void 0 ? _c : activeCell === null || activeCell === void 0 ? void 0 : activeCell.row;
    const selectionMaxRow = (_d = selection === null || selection === void 0 ? void 0 : selection.max.row) !== null && _d !== void 0 ? _d : activeCell === null || activeCell === void 0 ? void 0 : activeCell.row;
    const toggleGivenRow = (0, useMemoizedIndexCallback_1.useMemoizedIndexCallback)(toggleSelection, 0);
    const _selectedRows = (0, react_1.useMemo)(() => {
        return Array.from(selectedRows);
    }, [selectedRows]);
    const [isHorizontallyScrolled, setIsScrolled] = react_1.default.useState(false);
    const nullValueCount = (0, react_1.useMemo)(() => {
        // Count the number of null's in the virtualized rows
        let nullCount = 0;
        for (let i = 0; i < rowVirtualizer.getVirtualItems().length; i++) {
            if (data[rowVirtualizer.getVirtualItems()[i].index] === null) {
                nullCount++;
            }
        }
        return nullCount;
    }, [data]);
    const bottomReachedHandler = (0, react_1.useCallback)((0, throttle_debounce_1.throttle)(bottomReachedBuffer, () => {
        const scrollableElement = outerRef.current;
        if (scrollableElement) {
            const { scrollHeight, scrollTop, clientHeight } = scrollableElement;
            if (scrollHeight - scrollTop - clientHeight < bottomReachedBuffer &&
                dataRef.current.length > 0) {
                if (!isAtBottom.current) {
                    onBottomReached === null || onBottomReached === void 0 ? void 0 : onBottomReached();
                    isAtBottom.current = true;
                }
            }
            else {
                isAtBottom.current = false;
            }
        }
    }), [bottomReachedBuffer, onBottomReached, outerRef]);
    const horizontallyScrolledHandler = (0, react_1.useCallback)(() => {
        if (outerRef.current) {
            const isScrolled = outerRef.current.scrollLeft > 0.01;
            if (isScrolled !== isHorizontallyScrolledRef.current)
                setIsScrolled(outerRef.current.scrollLeft > 0.01);
        }
    }, [outerRef]);
    const bottomReachedHandlerRef = (0, react_1.useRef)(bottomReachedHandler);
    bottomReachedHandlerRef.current = bottomReachedHandler;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const bottomDataReachedHandler = (0, react_1.useCallback)((0, throttle_debounce_1.throttle)(bottomReachedBuffer, () => {
        // This should be a handler to figure out if a data point that is NULL is reached, aka rendered. If so, we should trigger a fetch for more data
        // Get the index of the first row that is NULL
        var _a;
        if (!rowVirtualizerRef.current)
            return;
        const renderedElements = rowVirtualizerRef.current.getVirtualItems();
        if (!renderedElements.length)
            return;
        // Check if one of the indices is NULL
        let firstNullIndex = null;
        for (let i = 0; i < renderedElements.length; i++) {
            if (dataRef.current[renderedElements[i].index] === null) {
                firstNullIndex = renderedElements[i].index;
                break;
            }
        }
        if (firstNullIndex === null)
            return;
        // Now we know that smth is null. We should refetch with the firstNullIndex as the starting point
        (_a = onBottomDataReachedRef.current) === null || _a === void 0 ? void 0 : _a.call(onBottomDataReachedRef, firstNullIndex);
    }), []);
    // Also trigger onBottomDataReached if the number of null values in the view changes.
    (0, react_1.useEffect)(() => {
        if (!loading && nullValueCount > 0) {
            bottomDataReachedHandler();
        }
    }, [nullValueCount]);
    const isHorizontallyScrolledRef = (0, react_1.useRef)(isHorizontallyScrolled);
    isHorizontallyScrolledRef.current = isHorizontallyScrolled;
    const onScrollHandler = (0, react_1.useMemo)(() => {
        return (e) => {
            onScroll === null || onScroll === void 0 ? void 0 : onScroll(e);
            horizontallyScrolledHandler();
            bottomReachedHandler();
            bottomDataReachedHandler();
        };
    }, [onScroll, bottomReachedHandler, bottomDataReachedHandler]);
    const GroupRowComponent = (0, react_1.useMemo)(() => {
        return groupRowComponent;
    }, [groupRowComponent]);
    // Also trigger bottomReacheed if layouting is done and the container is not scrollable bc the content is smaller than the container
    (0, react_1.useEffect)(() => {
        var _a, _b;
        if (isAtBottom.current)
            return;
        if (outerRef.current &&
            innerRef.current &&
            ((_a = outerRef.current) === null || _a === void 0 ? void 0 : _a.offsetHeight) >= innerRef.current.offsetHeight) {
            (_b = bottomReachedHandlerRef.current) === null || _b === void 0 ? void 0 : _b.call(bottomReachedHandlerRef);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, loading, outerHeight]);
    const isAtBottom = (0, react_1.useRef)(false);
    const rowVirtualizerRef = (0, react_1.useRef)(rowVirtualizer);
    rowVirtualizerRef.current = rowVirtualizer;
    return (react_1.default.createElement("div", { ref: outerRef, className: (0, classnames_1.default)('dsg-container', 'group/container'), "data-state": loading ? 'loading' : 'loaded', onScroll: onScrollHandler },
        react_1.default.createElement("div", { className: "group/inner-container", ref: innerRef, style: {
                width: fullWidth ? '100%' : colVirtualizer.getTotalSize(),
                height: rowVirtualizer.getTotalSize(),
            } },
            headerRowHeight > 0 && (react_1.default.createElement("div", { className: (0, classnames_1.default)('dsg-row', 'group/row', 'dsg-row-header'), style: {
                    width: fullWidth ? '100%' : colVirtualizer.getTotalSize(),
                    height: headerRowHeight,
                } }, colVirtualizer.getVirtualItems().map((col) => {
                var _a;
                const Header = (_a = columns[col.index].title) !== null && _a !== void 0 ? _a : FallbackHeader;
                const isStickyLeft = hasStickyLeftColumn && columns[col.index].sticky === 'left';
                if (loading && col.index === 0)
                    return null;
                return (react_1.default.createElement(Cell_1.Cell, { key: col.key, gutter: !loading && col.index === 0, stickyRight: hasStickyRightColumn && col.index === columns.length - 1, width: col.size, left: col.start, padding: !columns[col.index].disablePadding && col.index !== 0, stickyLeft: isStickyLeft, className: (0, classnames_1.default)('dsg-cell-header', selectionColMin !== undefined &&
                        selectionColMax !== undefined &&
                        selectionColMin <= col.index - 1 &&
                        selectionColMax >= col.index - 1 &&
                        'dsg-cell-header-active', columns[col.index].headerClassName) },
                    react_1.default.createElement("div", { className: "dsg-cell-header-container" },
                        react_1.default.createElement(Header, { columnData: columns[col.index].columnData, selectedRows: _selectedRows, selectRows: selectRows, selectAllRows: selectAllRows, table: table }))));
            }))),
            rowVirtualizer.getVirtualItems().map((row) => {
                var _a;
                const rowActive = Boolean(row.index >= (selectionMinRow !== null && selectionMinRow !== void 0 ? selectionMinRow : Infinity) &&
                    row.index <= (selectionMaxRow !== null && selectionMaxRow !== void 0 ? selectionMaxRow : -Infinity));
                const rowSelected = selectedRows.has(row.key.toString());
                return (react_1.default.createElement("div", { key: row.key, className: (0, classnames_1.default)('dsg-row', 'group/row', rowSelected && 'dsg-row-selected', typeof rowClassName === 'string' ? rowClassName : null, typeof rowClassName === 'function'
                        ? rowClassName({
                            rowData: data[row.index],
                            rowIndex: row.index,
                        })
                        : null), style: {
                        height: row.size,
                        top: row.start,
                        width: fullWidth ? '100%' : colVirtualizer.getTotalSize(),
                    } }, ((_a = data[row.index]) === null || _a === void 0 ? void 0 : _a.isGroup) && GroupRowComponent ? (react_1.default.createElement(GridGroupRow_1.GridGroupRow, { colVirtualizer: colVirtualizer, columns: columns, data: data, row: row, rowIndex: row.index, loading: loading, LoadingComponent: LoadingComponent, hasStickyLeftColumn: hasStickyLeftColumn, hasStickyRightColumn: hasStickyRightColumn, activeCell: activeCell, editing: editing, getContextMenuItems: getContextMenuItems, deleteGivenRow: deleteGivenRow, duplicateGivenRow: duplicateGivenRow, stopEditing: stopEditing, insertAfterGivenRow: insertAfterGivenRow, setGivenRowData: setGivenRowData, rowSelected: Boolean(rowSelected), selectRows: selectRows, toggleGivenRow: toggleGivenRow, getRowId: getRowId, table: table, groupRowComponentProps: groupRowComponentProps, GroupRowComponent: GroupRowComponent, rowActive: rowActive, fullWidth: fullWidth, cellClassName: cellClassName })) : (colVirtualizer.getVirtualItems().map((col) => {
                    const colCellClassName = columns[col.index].cellClassName;
                    const disabled = columns[col.index].disabled;
                    const Component = columns[col.index].component;
                    const cellDisabled = disabled === true ||
                        (typeof disabled === 'function' &&
                            disabled({
                                rowData: data[row.index],
                                rowIndex: row.index,
                            }));
                    const interactive = columns[col.index].interactive;
                    const cellInteractive = interactive === true ||
                        (typeof interactive === 'function' &&
                            interactive({
                                rowData: data[row.index],
                                rowIndex: row.index,
                            }));
                    const cellIsActive = (activeCell === null || activeCell === void 0 ? void 0 : activeCell.row) === row.index &&
                        activeCell.col === col.index - 1;
                    const isStickyLeft = hasStickyLeftColumn && columns[col.index].sticky === 'left';
                    const isLoading = loading || data[row.index] === null;
                    if (isLoading && col.index === 0)
                        return null;
                    return (react_1.default.createElement(Cell_1.Cell, { key: col.key, gutter: !isLoading && col.index === 0, stickyRight: hasStickyRightColumn && col.index === columns.length - 1, stickyLeft: isStickyLeft, active: col.index === 0 && rowActive, disabled: cellDisabled, interactive: cellInteractive, padding: !columns[col.index].disablePadding && col.index !== 0, className: (0, classnames_1.default)(!isLoading
                            ? typeof colCellClassName === 'function' // Disable when isLoading to prevent any special behavior for isLoading view
                                ? colCellClassName({
                                    rowData: data[row.index],
                                    rowIndex: row.index,
                                    columnId: columns[col.index].id,
                                })
                                : colCellClassName
                            : undefined, !isLoading
                            ? typeof cellClassName === 'function'
                                ? cellClassName({
                                    rowData: data[row.index],
                                    rowIndex: row.index,
                                    columnId: columns[col.index].id,
                                })
                                : cellClassName
                            : undefined), width: col.size, left: col.start }, isLoading && col.index !== 0 ? (LoadingComponent) : (react_1.default.createElement(Component, { rowData: data[row.index], getContextMenuItems: getContextMenuItems, disabled: cellDisabled, rowId: row.key.toString(), active: cellIsActive, columnIndex: col.index - 1, rowIndex: row.index, focus: cellIsActive && editing, deleteRow: deleteGivenRow(row.index), duplicateRow: duplicateGivenRow(row.index), stopEditing: stopEditing, insertRowBelow: insertAfterGivenRow(row.index), setRowData: setGivenRowData(row.index), columnData: columns[col.index].columnData, selected: Boolean(rowSelected), selectRows: selectRows, toggleSelection: toggleGivenRow(row.index), getRowId: getRowId, table: table }))));
                }))));
            }),
            children,
            react_1.default.createElement(HorizontalScrollShadow_1.HorizontalScrollShadow, { hasStickyLeftColumn: hasStickyLeftColumn, getStickyColumnWidth: getStickyColumnWidth, isHorizontallyScrolled: isHorizontallyScrolled, headerHeight: headerRowHeight }))));
};
exports.Grid = Grid;
//# sourceMappingURL=Grid.js.map