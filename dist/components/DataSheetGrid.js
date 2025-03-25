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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSheetGrid = void 0;
const react_1 = __importStar(require("react"));
const useColumnWidths_1 = require("../hooks/useColumnWidths");
const react_resize_detector_1 = require("react-resize-detector");
const useColumns_1 = require("../hooks/useColumns");
const useEdges_1 = require("../hooks/useEdges");
const useDeepEqualState_1 = require("../hooks/useDeepEqualState");
const useDocumentEventListener_1 = require("../hooks/useDocumentEventListener");
const useGetBoundingClientRect_1 = require("../hooks/useGetBoundingClientRect");
const AddRows_1 = require("./AddRows");
const fast_deep_equal_1 = __importDefault(require("fast-deep-equal"));
const ContextMenu_1 = require("./ContextMenu");
const copyPasting_1 = require("../utils/copyPasting");
const typeCheck_1 = require("../utils/typeCheck");
const tab_1 = require("../utils/tab");
const Grid_1 = require("./Grid");
const SelectionRect_1 = require("./SelectionRect");
const useRowHeights_1 = require("../hooks/useRowHeights");
const useRowSelection_1 = require("../hooks/useRowSelection");
const throttle_debounce_1 = require("throttle-debounce");
const loading_key_1 = require("../utils/loading-key");
const DEFAULT_DATA = [];
const DEFAULT_COLUMNS = [];
const DEFAULT_CREATE_ROW = () => ({});
const DEFAULT_EMPTY_CALLBACK = () => null;
const DEFAULT_DUPLICATE_ROW = ({ rowData, }) => (Object.assign({}, rowData));
// eslint-disable-next-line react/display-name
exports.DataSheetGrid = react_1.default.memo(react_1.default.forwardRef(({ value: data = DEFAULT_DATA, className, style, height: maxHeight = 400, onChange = DEFAULT_EMPTY_CALLBACK, columns: rawColumns = DEFAULT_COLUMNS, rowHeight = 40, headerRowHeight = typeof rowHeight === 'number' ? rowHeight : 40, gutterColumn, rowKey, addRowsComponent: AddRowsComponent = (props) => react_1.default.createElement(AddRows_1.AddRows, Object.assign({}, props)), createRow = DEFAULT_CREATE_ROW, autoAddRow = false, lockRows = false, disableExpandSelection = false, disableSmartDelete = false, duplicateRow = DEFAULT_DUPLICATE_ROW, contextMenuComponent: _ContextMenuComponent, disableContextMenu: disableContextMenuRaw = false, onFocus = DEFAULT_EMPTY_CALLBACK, onBlur = DEFAULT_EMPTY_CALLBACK, onActiveCellChange = DEFAULT_EMPTY_CALLBACK, onSelectionChange = DEFAULT_EMPTY_CALLBACK, rowClassName, cellClassName, onScroll, loading = false, loadingRowComponent = null, loadingRowCount = 10, loadingRowHeight, enforceLoading = false, rowSelection, onRowSelectionChange, onCellCopy, columnVisibilityModel, onColumnVisibilityChange, bottomReachedBuffer, onBottomReached, onBottomDataReached, onBottomThrottleRate = 1000, overscanRows, }, ref) => {
    var _a, _b, _c, _d, _e;
    if (!enforceLoading) {
        loading = loading && data.length === 0;
    }
    const lastEditingCellRef = (0, react_1.useRef)(null);
    const disableContextMenu = disableContextMenuRaw || lockRows;
    const columns = (0, useColumns_1.useColumns)(rawColumns, gutterColumn, columnVisibilityModel);
    const columnVisibilityModelRef = (0, react_1.useRef)(columnVisibilityModel);
    columnVisibilityModelRef.current = columnVisibilityModel;
    const onColumnVisibilityChangeRef = (0, react_1.useRef)(onColumnVisibilityChange);
    onColumnVisibilityChangeRef.current = onColumnVisibilityChange;
    const { hasStickyRightColumn, hasStickyLeftColumn } = (0, react_1.useMemo)(() => {
        return columns.reduce((acc, column) => {
            if (column.sticky === 'right')
                acc.hasStickyRightColumn = true;
            if (column.sticky === 'left')
                acc.hasStickyLeftColumn = true;
            return acc;
        }, { hasStickyRightColumn: false, hasStickyLeftColumn: false });
    }, [columns]);
    const innerRef = (0, react_1.useRef)(null);
    const outerRef = (0, react_1.useRef)(null);
    const beforeTabIndexRef = (0, react_1.useRef)(null);
    const afterTabIndexRef = (0, react_1.useRef)(null);
    const { selectedRows, selectRows } = (0, useRowSelection_1.useRowSelection)(rowSelection, onRowSelectionChange);
    const selectedRowsRef = (0, react_1.useRef)(selectedRows);
    selectedRowsRef.current = selectedRows;
    // Default value is 1 for the border
    //  const [heightDiff, setHeightDiff] = useDebounceState(1, 1000)
    const { getRowSize, totalSize, getRowIndex } = (0, useRowHeights_1.useRowHeights)({
        value: data,
        rowHeight,
    });
    // Height of the list (including scrollbars and borders) to display
    /* const displayHeight = Math.min(
      maxHeight,
      headerRowHeight + totalSize(maxHeight) + heightDiff
    )*/
    // Width and height of the scrollable area
    const { width, height } = (0, react_resize_detector_1.useResizeDetector)({
        targetRef: outerRef,
        refreshMode: 'throttle',
        refreshRate: 150,
    });
    //  setHeightDiff(height ? displayHeight - height : 0)
    const edges = (0, useEdges_1.useEdges)(outerRef, width, height);
    const { fullWidth, totalWidth: contentWidth, columnWidths, columnRights, } = (0, useColumnWidths_1.useColumnWidths)(columns, width);
    // x,y coordinates of the right click
    const [contextMenu, setContextMenu] = (0, react_1.useState)(null);
    // Items of the context menu
    const [contextMenuItems, setContextMenuItems] = (0, react_1.useState)([]);
    const ContextMenu = (0, react_1.useMemo)(() => {
        const col = contextMenu === null || contextMenu === void 0 ? void 0 : contextMenu.cursorIndex.col;
        if (col !== undefined) {
            const ColMenu = columns[col + 1].contextMenuComponent;
            if (ColMenu) {
                return ColMenu;
            }
        }
        return (_ContextMenuComponent !== null && _ContextMenuComponent !== void 0 ? _ContextMenuComponent : ((props) => react_1.default.createElement(ContextMenu_1.ContextMenu, Object.assign({}, props))));
    }, [_ContextMenuComponent, columns, contextMenu === null || contextMenu === void 0 ? void 0 : contextMenu.cursorIndex.col]);
    // True when the active cell is being edited
    const [editing, setEditing] = (0, react_1.useState)(false);
    // Number of rows the user is expanding the selection by, always a number, even when not expanding selection
    const [expandSelectionRowsCount, setExpandSelectionRowsCount] = (0, react_1.useState)(0);
    // When not null, represents the index of the row from which we are expanding
    const [expandingSelectionFromRowIndex, setExpandingSelectionFromRowIndex,] = (0, react_1.useState)(null);
    // Highlighted cell, null when not focused
    const [activeCell, setActiveCell] = (0, useDeepEqualState_1.useDeepEqualState)(null);
    // The selection cell and the active cell are the two corners of the selection, null when nothing is selected
    const [selectionCell, setSelectionCell] = (0, useDeepEqualState_1.useDeepEqualState)(null);
    // Min and max of the current selection (rectangle defined by the active cell and the selection cell), null when nothing is selected
    const selection = (0, react_1.useMemo)(() => activeCell &&
        selectionCell && {
        min: {
            col: Math.min(activeCell.col, selectionCell.col),
            row: Math.min(activeCell.row, selectionCell.row),
        },
        max: {
            col: Math.max(activeCell.col, selectionCell.col),
            row: Math.max(activeCell.row, selectionCell.row),
        },
    }, [activeCell, selectionCell]);
    const selectionRef = (0, react_1.useRef)(selection);
    selectionRef.current = selection;
    // Behavior of the selection when the user drags the mouse around
    const [selectionMode, setSelectionMode] = (0, useDeepEqualState_1.useDeepEqualState)({
        // True when the position of the cursor should impact the columns of the selection
        columns: false,
        // True when the position of the cursor should impact the rows of the selection
        rows: false,
        // True when the user is dragging the mouse around to select
        active: false,
    });
    // Same as expandSelectionRowsCount but is null when we should not be able to expand the selection
    const expandSelection = (0, react_1.useMemo)(() => {
        var _a, _b;
        return disableExpandSelection ||
            editing ||
            selectionMode.active ||
            (activeCell === null || activeCell === void 0 ? void 0 : activeCell.row) === (data === null || data === void 0 ? void 0 : data.length) - 1 ||
            (selection === null || selection === void 0 ? void 0 : selection.max.row) === (data === null || data === void 0 ? void 0 : data.length) - 1 ||
            (activeCell &&
                columns
                    .slice(((_a = selection === null || selection === void 0 ? void 0 : selection.min.col) !== null && _a !== void 0 ? _a : activeCell.col) + 1, ((_b = selection === null || selection === void 0 ? void 0 : selection.max.col) !== null && _b !== void 0 ? _b : activeCell.col) + 2)
                    .every((column) => column.disabled === true))
            ? null
            : expandSelectionRowsCount;
    }, [
        activeCell,
        columns,
        data,
        disableExpandSelection,
        editing,
        expandSelectionRowsCount,
        selection,
        selectionMode.active,
    ]);
    const getInnerBoundingClientRect = (0, useGetBoundingClientRect_1.useGetBoundingClientRect)(innerRef);
    const getOuterBoundingClientRect = (0, useGetBoundingClientRect_1.useGetBoundingClientRect)(outerRef);
    // Blur any element on focusing the grid
    (0, react_1.useEffect)(() => {
        var _a;
        if (activeCell !== null) {
            ;
            document.activeElement.blur();
            (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.removeAllRanges();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCell !== null]);
    // Extract the coordinates of the cursor from a mouse event
    const getCursorIndex = (0, react_1.useCallback)((event, force = false, includeSticky = false) => {
        const innerBoundingClientRect = getInnerBoundingClientRect(force);
        const outerBoundingClientRect = includeSticky && getOuterBoundingClientRect(force);
        if (innerBoundingClientRect && columnRights && columnWidths) {
            let x = event.clientX - innerBoundingClientRect.left;
            let y = event.clientY - innerBoundingClientRect.top;
            if (outerBoundingClientRect) {
                if (event.clientY - outerBoundingClientRect.top <=
                    headerRowHeight) {
                    y = 0;
                }
                if (event.clientX - outerBoundingClientRect.left <=
                    columnWidths[0]) {
                    x = 0;
                }
                if (hasStickyRightColumn &&
                    outerBoundingClientRect.right - event.clientX <=
                        columnWidths[columnWidths.length - 1]) {
                    x = columnRights[columnRights.length - 2] + 1;
                }
            }
            return {
                col: columnRights.findIndex((right) => x < right) - 1,
                row: getRowIndex(y - headerRowHeight),
            };
        }
        return null;
    }, [
        columnRights,
        columnWidths,
        getInnerBoundingClientRect,
        getOuterBoundingClientRect,
        headerRowHeight,
        hasStickyRightColumn,
        getRowIndex,
    ]);
    const dataRef = (0, react_1.useRef)(data);
    dataRef.current = data;
    const isCellDisabled = (0, react_1.useCallback)((cell) => {
        const disabled = columns[cell.col + 1].disabled;
        return Boolean(typeof disabled === 'function'
            ? disabled({
                rowData: dataRef.current[cell.row],
                rowIndex: cell.row,
            })
            : disabled);
    }, [columns]);
    const isCellInteractive = (0, react_1.useCallback)((cell) => {
        const interactive = columns[cell.col + 1].interactive;
        return Boolean(typeof interactive === 'function'
            ? interactive({
                rowData: dataRef.current[cell.row],
                rowIndex: cell.row,
            })
            : interactive);
    }, [columns]);
    const insertRowAfter = (0, react_1.useCallback)((row, count = 1) => {
        if (lockRows) {
            return;
        }
        setSelectionCell(null);
        setEditing(false);
        onChange([
            ...dataRef.current.slice(0, row + 1),
            ...new Array(count).fill(0).map(createRow),
            ...dataRef.current.slice(row + 1),
        ], [
            {
                type: 'CREATE',
                fromRowIndex: row + 1,
                toRowIndex: row + 1 + count,
            },
        ]);
        setActiveCell((a) => ({
            col: (a === null || a === void 0 ? void 0 : a.col) || 0,
            row: row + count,
            doNotScrollX: true,
        }));
    }, [createRow, lockRows, onChange, setActiveCell, setSelectionCell]);
    const duplicateRows = (0, react_1.useCallback)((rowMin, rowMax = rowMin) => {
        if (lockRows) {
            return;
        }
        onChange([
            ...dataRef.current.slice(0, rowMax + 1),
            ...dataRef.current
                .slice(rowMin, rowMax + 1)
                .map((rowData, i) => duplicateRow({ rowData, rowIndex: i + rowMin })),
            ...dataRef.current.slice(rowMax + 1),
        ], [
            {
                type: 'CREATE',
                fromRowIndex: rowMax + 1,
                toRowIndex: rowMax + 2 + rowMax - rowMin,
            },
        ]);
        setActiveCell({ col: 0, row: rowMax + 1, doNotScrollX: true });
        setSelectionCell({
            col: columns.length - (hasStickyRightColumn ? 3 : 2),
            row: 2 * rowMax - rowMin + 1,
            doNotScrollX: true,
        });
        setEditing(false);
    }, [
        columns.length,
        duplicateRow,
        lockRows,
        onChange,
        setActiveCell,
        setSelectionCell,
        hasStickyRightColumn,
    ]);
    // Scroll to any given cell making sure it is in view
    const scrollTo = (0, react_1.useCallback)((cell) => {
        if (!height || !width) {
            return;
        }
        if (!cell.doNotScrollY) {
            // Align top
            const topMax = getRowSize(cell.row).top;
            // Align bottom
            const topMin = getRowSize(cell.row).top +
                getRowSize(cell.row).height +
                headerRowHeight -
                height +
                1;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (!outerRef.current)
                return;
            const scrollTop = outerRef.current.scrollTop;
            if (scrollTop > topMax) {
                outerRef.current.scrollTop = topMax;
            }
            else if (scrollTop < topMin) {
                outerRef.current.scrollTop = topMin;
            }
        }
        if (columnRights &&
            columnWidths &&
            outerRef.current &&
            !cell.doNotScrollX) {
            // Align left
            const leftMax = columnRights[cell.col] - columnRights[0];
            // Align right
            const leftMin = columnRights[cell.col] +
                columnWidths[cell.col + 1] +
                (hasStickyRightColumn
                    ? columnWidths[columnWidths.length - 1]
                    : 0) -
                width +
                1;
            const scrollLeft = outerRef.current.scrollLeft;
            if (scrollLeft > leftMax) {
                outerRef.current.scrollLeft = leftMax;
            }
            else if (scrollLeft < leftMin) {
                outerRef.current.scrollLeft = leftMin;
            }
        }
    }, [
        height,
        width,
        headerRowHeight,
        columnRights,
        columnWidths,
        getRowSize,
        hasStickyRightColumn,
    ]);
    // Scroll to the selectionCell cell when it changes
    (0, react_1.useEffect)(() => {
        if (selectionCell) {
            scrollTo(selectionCell);
        }
    }, [selectionCell]);
    // Scroll to the active cell when it changes
    (0, react_1.useEffect)(() => {
        if (activeCell) {
            scrollTo(activeCell);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCell === null || activeCell === void 0 ? void 0 : activeCell.col, activeCell === null || activeCell === void 0 ? void 0 : activeCell.row]);
    // If the selected cells or activeCell isn't there anymore, we need to reset the selection
    (0, react_1.useLayoutEffect)(() => {
        if (selection &&
            (selection.min.row >= data.length ||
                selection.max.row >= data.length ||
                selection.min.col >= columns.length - 1 ||
                selection.max.col >= columns.length - 1)) {
            console.debug('Selection out of bounds, resetting');
            setSelectionCell(null);
        }
    }, [columns.length, data.length, selection, setSelectionCell]);
    (0, react_1.useLayoutEffect)(() => {
        if (activeCell &&
            (activeCell.row >= data.length ||
                activeCell.col >= columns.length - 1)) {
            console.debug('Active cell out of bounds, resetting');
            setActiveCell(null);
        }
    }, [activeCell, columns.length, data.length, setActiveCell]);
    const setRowData = (0, react_1.useCallback)((rowIndex, item) => {
        var _a, _b;
        onChange([
            ...(_a = dataRef.current) === null || _a === void 0 ? void 0 : _a.slice(0, rowIndex),
            item,
            ...(_b = dataRef.current) === null || _b === void 0 ? void 0 : _b.slice(rowIndex + 1),
        ], [
            {
                type: 'UPDATE',
                fromRowIndex: rowIndex,
                toRowIndex: rowIndex + 1,
            },
        ]);
    }, [onChange]);
    const deleteRows = (0, react_1.useCallback)((rowMin, rowMax = rowMin) => {
        if (lockRows) {
            return;
        }
        setEditing(false);
        setActiveCell((a) => {
            const row = Math.min(dataRef.current.length - 2 - rowMax + rowMin, rowMin);
            if (row < 0) {
                return null;
            }
            return a && { col: a.col, row };
        });
        setSelectionCell(null);
        onChange([
            ...dataRef.current.slice(0, rowMin),
            ...dataRef.current.slice(rowMax + 1),
        ], [
            {
                type: 'DELETE',
                fromRowIndex: rowMin,
                toRowIndex: rowMax + 1,
            },
        ]);
    }, [lockRows, onChange, setActiveCell, setSelectionCell]);
    const deleteSelection = (0, react_1.useCallback)((_smartDelete = true) => {
        const smartDelete = _smartDelete && !disableSmartDelete;
        if (!refs.current.activeCell) {
            return;
        }
        const min = (selection === null || selection === void 0 ? void 0 : selection.min) || refs.current.activeCell;
        const max = (selection === null || selection === void 0 ? void 0 : selection.max) || refs.current.activeCell;
        if (data
            .slice(min.row, max.row + 1)
            .every((rowData, i) => columns.every((column) => column.isCellEmpty({ rowData, rowIndex: i + min.row })))) {
            if (smartDelete) {
                deleteRows(min.row, max.row);
            }
            return;
        }
        const newData = [...data];
        for (let row = min.row; row <= max.row; ++row) {
            for (let col = min.col; col <= max.col; ++col) {
                if (!isCellDisabled({ col, row })) {
                    const { deleteValue = ({ rowData }) => rowData } = columns[col + 1];
                    newData[row] = deleteValue({
                        rowData: newData[row],
                        rowIndex: row,
                    });
                }
            }
        }
        if (smartDelete && (0, fast_deep_equal_1.default)(newData, data)) {
            setActiveCell({ col: 0, row: min.row, doNotScrollX: true });
            setSelectionCell({
                col: columns.length - (hasStickyRightColumn ? 3 : 2),
                row: max.row,
                doNotScrollX: true,
            });
            return;
        }
        onChange(newData, [
            {
                type: 'UPDATE',
                fromRowIndex: min.row,
                toRowIndex: max.row + 1,
            },
        ]);
    }, [
        disableSmartDelete,
        selection === null || selection === void 0 ? void 0 : selection.min,
        selection === null || selection === void 0 ? void 0 : selection.max,
        data,
        onChange,
        columns,
        deleteRows,
        isCellDisabled,
        setActiveCell,
        setSelectionCell,
        hasStickyRightColumn,
    ]);
    const stopEditing = (0, react_1.useCallback)(({ nextRow = true } = {}) => {
        var _a, _b;
        if (((_a = refs.current.activeCell) === null || _a === void 0 ? void 0 : _a.row) === dataRef.current.length - 1) {
            if (nextRow && autoAddRow) {
                insertRowAfter((_b = refs.current.activeCell) === null || _b === void 0 ? void 0 : _b.row);
            }
            else {
                setEditing(false);
            }
        }
        else {
            setEditing(false);
            if (nextRow) {
                setActiveCell((a) => a && { col: a.col, row: a.row + 1 });
            }
        }
    }, [autoAddRow, insertRowAfter, setActiveCell]);
    const onCellCopyRef = (0, react_1.useRef)(onCellCopy);
    onCellCopyRef.current = onCellCopy;
    const onCopy = (0, react_1.useCallback)((event) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        if (!editing && refs.current.activeCell) {
            const copyData = [];
            const min = (selection === null || selection === void 0 ? void 0 : selection.min) || refs.current.activeCell;
            const max = (selection === null || selection === void 0 ? void 0 : selection.max) || refs.current.activeCell;
            const copiedCells = [];
            for (let row = min.row; row <= max.row; ++row) {
                if (dataRef.current[row] !== null) {
                    // Insert nulls
                    copyData.push(Array(max.col - min.col + 1).fill(null));
                    continue;
                }
                copyData.push([]);
                for (let col = min.col; col <= max.col; ++col) {
                    const { copyValue = () => null } = columns[col + 1];
                    copyData[row - min.row].push(copyValue({ rowData: data[row], rowIndex: row }));
                    copiedCells.push({ col, row });
                }
            }
            const textPlain = copyData.map((row) => row.join('\t')).join('\n');
            const textHtml = `<table>${copyData
                .map((row) => `<tr>${row
                .map((cell) => `<td>${(0, copyPasting_1.encodeHtml)(String(cell !== null && cell !== void 0 ? cell : '')).replace(/\n/g, '<br/>')}</td>`)
                .join('')}</tr>`)
                .join('')}</table>`;
            if (event !== undefined) {
                (_a = event.clipboardData) === null || _a === void 0 ? void 0 : _a.setData('text/plain', textPlain);
                (_b = event.clipboardData) === null || _b === void 0 ? void 0 : _b.setData('text/html', textHtml);
                event.preventDefault();
            }
            else {
                let success = false;
                if (navigator.clipboard.write !== undefined) {
                    const textBlob = new Blob([textPlain], {
                        type: 'text/plain',
                    });
                    const htmlBlob = new Blob([textHtml], { type: 'text/html' });
                    const clipboardData = [
                        new ClipboardItem({
                            'text/plain': textBlob,
                            'text/html': htmlBlob,
                        }),
                    ];
                    yield navigator.clipboard.write(clipboardData).then(() => {
                        success = true;
                    });
                }
                else if (navigator.clipboard.writeText !== undefined) {
                    yield navigator.clipboard.writeText(textPlain).then(() => {
                        success = true;
                    });
                }
                else if (document.execCommand !== undefined) {
                    const result = document.execCommand('copy');
                    if (result) {
                        success = true;
                    }
                }
                if (!success) {
                    alert('This action is unavailable in your browser, but you can still use Ctrl+C for copy or Ctrl+X for cut');
                }
            }
            (_c = onCellCopyRef.current) === null || _c === void 0 ? void 0 : _c.call(onCellCopyRef, copiedCells, textPlain, textHtml);
        }
    }), [columns, data, editing, selection]);
    (0, useDocumentEventListener_1.useDocumentEventListener)('copy', onCopy);
    const onCut = (0, react_1.useCallback)((event) => {
        if (!editing && refs.current.activeCell) {
            onCopy(event);
            deleteSelection(false);
        }
    }, [deleteSelection, editing, onCopy]);
    (0, useDocumentEventListener_1.useDocumentEventListener)('cut', onCut);
    const applyPasteDataToDatasheet = (0, react_1.useCallback)((pasteData) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (!editing && refs.current.activeCell) {
            const min = (selection === null || selection === void 0 ? void 0 : selection.min) || refs.current.activeCell;
            const max = (selection === null || selection === void 0 ? void 0 : selection.max) || refs.current.activeCell;
            const results = yield Promise.all(pasteData[0].map((_, columnIndex) => {
                var _a, _b;
                const prePasteValues = (_a = columns[min.col + columnIndex + 1]) === null || _a === void 0 ? void 0 : _a.prePasteValues;
                const values = pasteData.map((row) => row[columnIndex]);
                return (_b = prePasteValues === null || prePasteValues === void 0 ? void 0 : prePasteValues(values)) !== null && _b !== void 0 ? _b : values;
            }));
            pasteData = pasteData.map((_, rowIndex) => results.map((column) => column[rowIndex]));
            // Paste single row
            if (pasteData.length === 1) {
                const newData = [...data];
                for (let columnIndex = 0; columnIndex < pasteData[0].length; columnIndex++) {
                    const pasteValue = (_a = columns[min.col + columnIndex + 1]) === null || _a === void 0 ? void 0 : _a.pasteValue;
                    if (pasteValue) {
                        for (let rowIndex = min.row; rowIndex <= max.row; rowIndex++) {
                            if (!isCellDisabled({
                                col: columnIndex + min.col,
                                row: rowIndex,
                            })) {
                                newData[rowIndex] = yield pasteValue({
                                    rowData: newData[rowIndex],
                                    value: pasteData[0][columnIndex],
                                    rowIndex,
                                });
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
                ]);
                setActiveCell({ col: min.col, row: min.row });
                setSelectionCell({
                    col: Math.min(min.col + pasteData[0].length - 1, columns.length - (hasStickyRightColumn ? 3 : 2)),
                    row: max.row,
                });
            }
            else {
                // Paste multiple rows
                let newData = [...data];
                const missingRows = min.row + pasteData.length - data.length;
                if (missingRows > 0) {
                    if (!lockRows) {
                        newData = [
                            ...newData,
                            ...new Array(missingRows).fill(0).map(() => createRow()),
                        ];
                    }
                    else {
                        pasteData.splice(pasteData.length - missingRows, missingRows);
                    }
                }
                for (let columnIndex = 0; columnIndex < pasteData[0].length &&
                    min.col + columnIndex <
                        columns.length - (hasStickyRightColumn ? 2 : 1); columnIndex++) {
                    const pasteValue = (_b = columns[min.col + columnIndex + 1]) === null || _b === void 0 ? void 0 : _b.pasteValue;
                    if (pasteValue) {
                        for (let rowIndex = 0; rowIndex < pasteData.length; rowIndex++) {
                            if (!isCellDisabled({
                                col: min.col + columnIndex,
                                row: min.row + rowIndex,
                            })) {
                                newData[min.row + rowIndex] = yield pasteValue({
                                    rowData: newData[min.row + rowIndex],
                                    value: pasteData[rowIndex][columnIndex],
                                    rowIndex: min.row + rowIndex,
                                });
                            }
                        }
                    }
                }
                const operations = [
                    {
                        type: 'UPDATE',
                        fromRowIndex: min.row,
                        toRowIndex: min.row +
                            pasteData.length -
                            (!lockRows && missingRows > 0 ? missingRows : 0),
                    },
                ];
                if (missingRows > 0 && !lockRows) {
                    operations.push({
                        type: 'CREATE',
                        fromRowIndex: min.row + pasteData.length - missingRows,
                        toRowIndex: min.row + pasteData.length,
                    });
                }
                onChange(newData, operations);
                setActiveCell({ col: min.col, row: min.row });
                setSelectionCell({
                    col: Math.min(min.col + pasteData[0].length - 1, columns.length - (hasStickyRightColumn ? 3 : 2)),
                    row: min.row + pasteData.length - 1,
                });
            }
        }
    }), [
        columns,
        createRow,
        data,
        editing,
        hasStickyRightColumn,
        isCellDisabled,
        lockRows,
        onChange,
        selection === null || selection === void 0 ? void 0 : selection.max,
        selection === null || selection === void 0 ? void 0 : selection.min,
        setActiveCell,
        setSelectionCell,
    ]);
    const onPaste = (0, react_1.useCallback)((event) => {
        var _a, _b, _c, _d, _e, _f;
        if (refs.current.activeCell && !editing) {
            let pasteData = [['']];
            if ((_a = event.clipboardData) === null || _a === void 0 ? void 0 : _a.types.includes('text/html')) {
                pasteData = (0, copyPasting_1.parseTextHtmlData)((_b = event.clipboardData) === null || _b === void 0 ? void 0 : _b.getData('text/html'));
            }
            else if ((_c = event.clipboardData) === null || _c === void 0 ? void 0 : _c.types.includes('text/plain')) {
                pasteData = (0, copyPasting_1.parseTextPlainData)((_d = event.clipboardData) === null || _d === void 0 ? void 0 : _d.getData('text/plain'));
            }
            else if ((_e = event.clipboardData) === null || _e === void 0 ? void 0 : _e.types.includes('text')) {
                pasteData = (0, copyPasting_1.parseTextPlainData)((_f = event.clipboardData) === null || _f === void 0 ? void 0 : _f.getData('text'));
            }
            applyPasteDataToDatasheet(pasteData);
            event.preventDefault();
        }
    }, [applyPasteDataToDatasheet, editing]);
    (0, useDocumentEventListener_1.useDocumentEventListener)('paste', onPaste);
    const contextMenuItemsRef = (0, react_1.useRef)(contextMenuItems);
    contextMenuItemsRef.current = contextMenuItems;
    const getContextMenuItems = (0, react_1.useCallback)(() => contextMenuItemsRef.current, []);
    const getRowId = (0, react_1.useCallback)((rowIndex) => dataRef.current[rowIndex] === null
        ? (0, loading_key_1.getLoadingKey)(rowIndex)
        : typeof rowKey === 'function'
            ? rowKey({
                rowIndex: rowIndex,
                rowData: dataRef.current[rowIndex],
            })
            : (rowKey !== null && rowKey !== void 0 ? rowKey : rowIndex.toString()), [rowKey]);
    const toggleSelection = (0, react_1.useCallback)((rowIndex) => {
        const rowId = getRowId(rowIndex);
        selectRows((prev) => {
            if (prev.includes(rowId)) {
                return prev.filter((id) => id !== rowId);
            }
            else {
                return [...prev, rowId];
            }
        });
    }, [getRowId, selectRows]);
    const selectAllRows = (0, react_1.useCallback)(() => {
        selectRows((prev) => {
            return [...new Set([...prev, ...data.map((_, i) => getRowId(i))])];
        });
    }, [data, getRowId, selectRows]);
    const lastCursorIndex = (0, react_1.useRef)(null);
    const refs = (0, react_1.useRef)({
        expandingSelectionFromRowIndex,
        selectionMode,
        editing,
        selectionCell,
        activeCell,
        lastEditingCellRef,
        selection,
        contextMenu,
    });
    refs.current = {
        expandingSelectionFromRowIndex,
        selectionMode,
        editing,
        selectionCell,
        activeCell,
        lastEditingCellRef,
        selection,
        contextMenu,
    };
    const onMouseDown = (0, react_1.useCallback)((event) => {
        var _a, _b, _c, _d, _e, _f;
        if (refs.current.contextMenu && contextMenuItems.length) {
            return;
        }
        const clickInside = ((_a = innerRef.current) === null || _a === void 0 ? void 0 : _a.contains(event.target)) || false;
        if (!clickInside)
            return;
        const rightClick = event.button === 2 || (event.button === 0 && event.ctrlKey);
        const cursorIndex = clickInside
            ? getCursorIndex(event, true, true)
            : null;
        if (!clickInside &&
            editing &&
            refs.current.activeCell &&
            columns[refs.current.activeCell.col + 1].keepFocus) {
            return;
        }
        // If the cell is null, a.k.a., not loaded, we should not do anything
        if ((cursorIndex === null || cursorIndex === void 0 ? void 0 : cursorIndex.row) && dataRef.current[cursorIndex === null || cursorIndex === void 0 ? void 0 : cursorIndex.row] === null) {
            return;
        }
        if (event.target instanceof HTMLElement &&
            event.target.className.includes('dsg-expand-rows-indicator')) {
            setExpandingSelectionFromRowIndex(Math.max((_c = (_b = refs.current.activeCell) === null || _b === void 0 ? void 0 : _b.row) !== null && _c !== void 0 ? _c : 0, (_e = (_d = refs.current.selection) === null || _d === void 0 ? void 0 : _d.max.row) !== null && _e !== void 0 ? _e : 0));
            return;
        }
        const clickOnActiveCell = cursorIndex &&
            refs.current.activeCell &&
            refs.current.activeCell.col === cursorIndex.col &&
            refs.current.activeCell.row === cursorIndex.row &&
            !isCellDisabled(refs.current.activeCell);
        if (clickOnActiveCell && editing) {
            return;
        }
        const clickOnStickyRightColumn = (cursorIndex === null || cursorIndex === void 0 ? void 0 : cursorIndex.col) === columns.length - 2 && hasStickyRightColumn;
        const rightClickInSelection = rightClick &&
            refs.current.selection &&
            cursorIndex &&
            cursorIndex.row >= refs.current.selection.min.row &&
            cursorIndex.row <= refs.current.selection.max.row &&
            cursorIndex.col >= refs.current.selection.min.col &&
            cursorIndex.col <= refs.current.selection.max.col;
        const rightClickOnSelectedHeaders = rightClick &&
            refs.current.selection &&
            cursorIndex &&
            cursorIndex.row === -1 &&
            cursorIndex.col >= refs.current.selection.min.col &&
            cursorIndex.col <= refs.current.selection.max.col;
        const rightClickOnSelectedGutter = rightClick &&
            refs.current.selection &&
            cursorIndex &&
            cursorIndex.row >= refs.current.selection.min.row &&
            cursorIndex.row <= refs.current.selection.max.row &&
            cursorIndex.col === -1;
        const clickOnSelectedStickyRightColumn = clickOnStickyRightColumn &&
            refs.current.selection &&
            cursorIndex &&
            cursorIndex.row >= refs.current.selection.min.row &&
            cursorIndex.row <= refs.current.selection.max.row;
        if (rightClick && !disableContextMenu) {
            setContextMenu({
                x: event.clientX,
                y: event.clientY,
                cursorIndex: cursorIndex,
            });
        }
        if ((!(event.shiftKey && refs.current.activeCell) || rightClick) &&
            data.length > 0) {
            setActiveCell(cursorIndex && {
                col: (rightClickInSelection || rightClickOnSelectedHeaders) &&
                    refs.current.activeCell
                    ? refs.current.activeCell.col
                    : Math.max(0, clickOnStickyRightColumn ? 0 : cursorIndex.col),
                row: (rightClickInSelection ||
                    rightClickOnSelectedGutter ||
                    clickOnSelectedStickyRightColumn) &&
                    refs.current.activeCell
                    ? refs.current.activeCell.row
                    : Math.max(0, cursorIndex.row),
                doNotScrollX: Boolean((rightClickInSelection && refs.current.activeCell) ||
                    clickOnStickyRightColumn ||
                    cursorIndex.col === -1),
                doNotScrollY: Boolean((rightClickInSelection && refs.current.activeCell) ||
                    cursorIndex.row === -1),
            });
        }
        if (clickOnActiveCell && !rightClick) {
            lastEditingCellRef.current = refs.current.activeCell;
        }
        const activeCol = refs.current.activeCell
            ? columns[((_f = refs.current.activeCell) === null || _f === void 0 ? void 0 : _f.col) + 1]
            : null;
        setEditing(Boolean(clickOnActiveCell && !rightClick && !(activeCol === null || activeCol === void 0 ? void 0 : activeCol.disableEditing)));
        setSelectionMode(cursorIndex && !rightClick
            ? {
                columns: (cursorIndex.col !== -1 && !clickOnStickyRightColumn) ||
                    Boolean(event.shiftKey && refs.current.activeCell),
                rows: cursorIndex.row !== -1 ||
                    Boolean(event.shiftKey && refs.current.activeCell),
                active: true,
            }
            : {
                columns: false,
                rows: false,
                active: false,
            });
        if (event.shiftKey && refs.current.activeCell && !rightClick) {
            setSelectionCell(cursorIndex && {
                col: Math.max(0, cursorIndex.col - (clickOnStickyRightColumn ? 1 : 0)),
                row: Math.max(0, cursorIndex.row),
            });
        }
        else if (!rightClickInSelection) {
            if (cursorIndex &&
                ((cursorIndex === null || cursorIndex === void 0 ? void 0 : cursorIndex.col) === -1 ||
                    (cursorIndex === null || cursorIndex === void 0 ? void 0 : cursorIndex.row) === -1 ||
                    clickOnStickyRightColumn)) {
                let col = cursorIndex.col;
                let row = cursorIndex.row;
                let doNotScrollX = false;
                let doNotScrollY = false;
                if (cursorIndex.col === -1 || clickOnStickyRightColumn) {
                    col = columns.length - (hasStickyRightColumn ? 3 : 2);
                    doNotScrollX = true;
                }
                if (cursorIndex.row === -1) {
                    row = data.length - 1;
                    doNotScrollY = true;
                }
                if (rightClickOnSelectedHeaders && refs.current.selectionCell) {
                    col = refs.current.selectionCell.col;
                    doNotScrollY = true;
                }
                if ((rightClickOnSelectedGutter ||
                    clickOnSelectedStickyRightColumn) &&
                    refs.current.selectionCell) {
                    row = refs.current.selectionCell.row;
                    doNotScrollX = true;
                }
                setSelectionCell({ col, row, doNotScrollX, doNotScrollY });
            }
            else {
                setSelectionCell(null);
            }
            if (clickInside) {
                event.preventDefault();
            }
        }
    }, [
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
    ]);
    (0, useDocumentEventListener_1.useDocumentEventListener)('mousedown', onMouseDown);
    const onMouseUp = (0, react_1.useCallback)(() => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        if (expandingSelectionFromRowIndex !== null) {
            if (expandSelectionRowsCount > 0 && activeCell) {
                let copyData = [];
                const min = ((_a = refs.current.selection) === null || _a === void 0 ? void 0 : _a.min) || activeCell;
                const max = ((_b = refs.current.selection) === null || _b === void 0 ? void 0 : _b.max) || activeCell;
                for (let row = min.row; row <= max.row; ++row) {
                    copyData.push([]);
                    for (let col = min.col; col <= max.col; ++col) {
                        const { copyValue = () => null } = columns[col + 1];
                        copyData[row - min.row].push(String((_c = copyValue({ rowData: data[row], rowIndex: row })) !== null && _c !== void 0 ? _c : ''));
                    }
                }
                Promise.all(copyData[0].map((_, columnIndex) => {
                    var _a, _b;
                    const prePasteValues = (_a = columns[min.col + columnIndex + 1]) === null || _a === void 0 ? void 0 : _a.prePasteValues;
                    const values = copyData.map((row) => row[columnIndex]);
                    return (_b = prePasteValues === null || prePasteValues === void 0 ? void 0 : prePasteValues(values)) !== null && _b !== void 0 ? _b : values;
                })).then((results) => {
                    var _a;
                    copyData = copyData.map((_, rowIndex) => results.map((column) => column[rowIndex]));
                    const newData = [...data];
                    for (let columnIndex = 0; columnIndex < copyData[0].length; columnIndex++) {
                        const pasteValue = (_a = columns[min.col + columnIndex + 1]) === null || _a === void 0 ? void 0 : _a.pasteValue;
                        if (pasteValue) {
                            for (let rowIndex = max.row + 1; rowIndex <= max.row + expandSelectionRowsCount; rowIndex++) {
                                if (!isCellDisabled({
                                    col: columnIndex + min.col,
                                    row: rowIndex,
                                })) {
                                    newData[rowIndex] = pasteValue({
                                        rowData: newData[rowIndex],
                                        value: copyData[(rowIndex - max.row - 1) % copyData.length][columnIndex],
                                        rowIndex,
                                    });
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
                    ]);
                });
                setExpandSelectionRowsCount(0);
                setActiveCell({
                    col: Math.min((_d = activeCell === null || activeCell === void 0 ? void 0 : activeCell.col) !== null && _d !== void 0 ? _d : Infinity, (_f = (_e = refs.current.selection) === null || _e === void 0 ? void 0 : _e.min.col) !== null && _f !== void 0 ? _f : Infinity),
                    row: Math.min((_g = activeCell === null || activeCell === void 0 ? void 0 : activeCell.row) !== null && _g !== void 0 ? _g : Infinity, (_j = (_h = refs.current.selection) === null || _h === void 0 ? void 0 : _h.min.row) !== null && _j !== void 0 ? _j : Infinity),
                    doNotScrollX: true,
                    doNotScrollY: true,
                });
                setSelectionCell({
                    col: Math.max((_k = activeCell === null || activeCell === void 0 ? void 0 : activeCell.col) !== null && _k !== void 0 ? _k : 0, (_m = (_l = refs.current.selection) === null || _l === void 0 ? void 0 : _l.max.col) !== null && _m !== void 0 ? _m : 0),
                    row: Math.max((_o = activeCell === null || activeCell === void 0 ? void 0 : activeCell.row) !== null && _o !== void 0 ? _o : 0, (_q = (_p = refs.current.selection) === null || _p === void 0 ? void 0 : _p.max.row) !== null && _q !== void 0 ? _q : 0) + expandSelectionRowsCount,
                });
            }
            setExpandingSelectionFromRowIndex(null);
        }
        setSelectionMode({
            columns: false,
            rows: false,
            active: false,
        });
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
    ]);
    (0, useDocumentEventListener_1.useDocumentEventListener)('mouseup', onMouseUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onMouseMove = (0, react_1.useCallback)((0, throttle_debounce_1.throttle)(25, (event) => {
        const cursorIndex = getCursorIndex(event);
        if (cursorIndex === lastCursorIndex.current) {
            return;
        }
        lastCursorIndex.current = cursorIndex;
        if (refs.current.expandingSelectionFromRowIndex !== null) {
            if (cursorIndex) {
                setExpandSelectionRowsCount(Math.max(0, cursorIndex.row - refs.current.expandingSelectionFromRowIndex));
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
            const lastColumnIndex = columns.length - (hasStickyRightColumn ? 3 : 2);
            setSelectionCell(cursorIndex && {
                col: refs.current.selectionMode.columns
                    ? Math.max(0, Math.min(lastColumnIndex, cursorIndex.col))
                    : lastColumnIndex,
                row: refs.current.selectionMode.rows
                    ? Math.max(0, cursorIndex.row)
                    : data.length - 1,
                doNotScrollX: !refs.current.selectionMode.columns,
                doNotScrollY: !refs.current.selectionMode.rows,
            });
            if (refs.current.editing !== false)
                setEditing(false);
        }
    }), [
        getCursorIndex,
        columns.length,
        hasStickyRightColumn,
        setSelectionCell,
        data.length,
    ]);
    (0, useDocumentEventListener_1.useDocumentEventListener)('mousemove', onMouseMove);
    const onCellKeyDown = (0, react_1.useCallback)((rowId, columnId, e, isActive) => {
        var _a;
        const rowIndex = dataRef.current.findIndex((row) => getRowId(dataRef.current.indexOf(row)) === rowId);
        const columnIndex = columns.findIndex((column) => column.id === columnId);
        const fn = (_a = columns[columnIndex]) === null || _a === void 0 ? void 0 : _a.onCellKeyDown;
        if (fn) {
            fn({
                rowData: dataRef.current[rowIndex],
                rowId: rowId.toString(),
                columnId: columnId.toString(),
                setRowData: () => setRowData(rowIndex, dataRef.current[rowIndex]),
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
            }, e);
        }
    }, [
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
    ]);
    const onKeyDown = (0, react_1.useCallback)((event) => {
        var _a, _b, _c, _d, _e, _f;
        if (!refs.current.activeCell) {
            return;
        }
        if (event.isComposing) {
            console.log('is composing');
            return;
        }
        // Tab from last cell of a row
        if (event.key === 'Tab' &&
            !event.shiftKey &&
            refs.current.activeCell.col ===
                columns.length - (hasStickyRightColumn ? 3 : 2) &&
            !columns[refs.current.activeCell.col + 1].disableKeys) {
            // Last row
            if (refs.current.activeCell.row === data.length - 1) {
                if (afterTabIndexRef.current) {
                    event.preventDefault();
                    setActiveCell(null);
                    setSelectionCell(null);
                    setEditing(false);
                    const allElements = (0, tab_1.getAllTabbableElements)();
                    const index = allElements.indexOf(afterTabIndexRef.current);
                    allElements[(index + 1) % allElements.length].focus();
                    return;
                }
            }
            else {
                setActiveCell((cell) => { var _a; return ({ col: 0, row: ((_a = cell === null || cell === void 0 ? void 0 : cell.row) !== null && _a !== void 0 ? _a : 0) + 1 }); });
                setSelectionCell(null);
                setEditing(false);
                event.preventDefault();
                return;
            }
        }
        // Shift+Tab from first cell of a row
        if (event.key === 'Tab' &&
            event.shiftKey &&
            refs.current.activeCell.col === 0 &&
            !columns[refs.current.activeCell.col + 1].disableKeys) {
            // First row
            if (refs.current.activeCell.row === 0) {
                if (beforeTabIndexRef.current) {
                    event.preventDefault();
                    setActiveCell(null);
                    setSelectionCell(null);
                    setEditing(false);
                    const allElements = (0, tab_1.getAllTabbableElements)();
                    const index = allElements.indexOf(beforeTabIndexRef.current);
                    allElements[(index - 1 + allElements.length) % allElements.length].focus();
                    return;
                }
            }
            else {
                setActiveCell((cell) => {
                    var _a;
                    return ({
                        col: columns.length - (hasStickyRightColumn ? 3 : 2),
                        row: ((_a = cell === null || cell === void 0 ? void 0 : cell.row) !== null && _a !== void 0 ? _a : 1) - 1,
                    });
                });
                setSelectionCell(null);
                setEditing(false);
                event.preventDefault();
                return;
            }
        }
        if (((_a = event.key) === null || _a === void 0 ? void 0 : _a.startsWith('Arrow')) || event.key === 'Tab') {
            if (editing &&
                columns[refs.current.activeCell.col + 1].disableKeys) {
                return;
            }
            if (editing && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                return;
            }
            const add = ([x, y], cell) => cell && {
                col: Math.max(0, Math.min(columns.length - (hasStickyRightColumn ? 3 : 2), cell.col + x)),
                row: Math.max(0, Math.min(data.length - 1, cell.row + y)),
            };
            if (event.key === 'Tab' && event.shiftKey) {
                setActiveCell((cell) => add([-1, 0], cell));
                setSelectionCell(null);
            }
            else {
                const direction = {
                    ArrowDown: [0, 1],
                    ArrowUp: [0, -1],
                    ArrowLeft: [-1, 0],
                    ArrowRight: [1, 0],
                    Tab: [1, 0],
                }[event.key];
                if (event.ctrlKey || event.metaKey) {
                    direction[0] *= columns.length;
                    direction[1] *= data.length;
                }
                if (event.shiftKey) {
                    setSelectionCell((cell) => add(direction, cell || refs.current.activeCell));
                }
                else {
                    setActiveCell((cell) => add(direction, cell));
                    setSelectionCell(null);
                }
            }
            setEditing(false);
            event.preventDefault();
        }
        else if (event.key === 'Escape') {
            if (!editing && !refs.current.selectionCell) {
                setActiveCell(null);
            }
            setSelectionCell(null);
            setEditing(false);
        }
        else if ((event.key === 'Enter' || event.key === 'F2') &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            !event.shiftKey) {
            setSelectionCell(null);
            if (editing) {
                if (!columns[refs.current.activeCell.col + 1].disableKeys) {
                    stopEditing();
                    event.preventDefault();
                }
            }
            else if (!isCellDisabled(refs.current.activeCell)) {
                lastEditingCellRef.current = refs.current.activeCell;
                setEditing(true);
                scrollTo(refs.current.activeCell);
                event.preventDefault();
            }
        }
        else if (event.key === 'Enter' &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            event.shiftKey) {
            insertRowAfter(((_b = refs.current.selection) === null || _b === void 0 ? void 0 : _b.max.row) || refs.current.activeCell.row);
        }
        else if (event.key === 'd' &&
            (event.ctrlKey || event.metaKey) &&
            !event.altKey &&
            !event.shiftKey) {
            duplicateRows(((_c = refs.current.selection) === null || _c === void 0 ? void 0 : _c.min.row) || refs.current.activeCell.row, (_d = refs.current.selection) === null || _d === void 0 ? void 0 : _d.max.row);
            event.preventDefault();
        }
        else if (((0, copyPasting_1.isPrintableUnicode)(event.key) || event.code.match(/Key[A-Z]$/)) &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey) {
            if (!editing && !isCellDisabled(refs.current.activeCell)) {
                lastEditingCellRef.current = refs.current.activeCell;
                setSelectionCell(null);
                setEditing(true);
                scrollTo(refs.current.activeCell);
            }
        }
        else if (['Backspace', 'Delete'].includes(event.key)) {
            if (!editing) {
                deleteSelection();
                event.preventDefault();
            }
        }
        else if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
            if (!editing) {
                setActiveCell({
                    col: 0,
                    row: 0,
                    doNotScrollY: true,
                    doNotScrollX: true,
                });
                setSelectionCell({
                    col: columns.length - (hasStickyRightColumn ? 3 : 2),
                    row: data.length - 1,
                    doNotScrollY: true,
                    doNotScrollX: true,
                });
                event.preventDefault();
            }
        }
        const activeColumn = columns[refs.current.activeCell.col + 1];
        onCellKeyDown(getRowId(refs.current.activeCell.row), (_e = activeColumn.id) !== null && _e !== void 0 ? _e : (refs.current.activeCell.col + 1).toString(), event, refs.current.activeCell.row === ((_f = refs.current.selection) === null || _f === void 0 ? void 0 : _f.max.row));
    }, [
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
    ]);
    (0, useDocumentEventListener_1.useDocumentEventListener)('keydown', onKeyDown);
    const onContextMenu = (0, react_1.useCallback)((event) => {
        var _a;
        const clickInside = ((_a = innerRef.current) === null || _a === void 0 ? void 0 : _a.contains(event.target)) || false;
        const cursorIndex = clickInside
            ? getCursorIndex(event, true, true)
            : null;
        const clickOnActiveCell = cursorIndex &&
            refs.current.activeCell &&
            refs.current.activeCell.col === cursorIndex.col &&
            refs.current.activeCell.row === cursorIndex.row &&
            editing;
        if (clickInside && !clickOnActiveCell) {
            event.preventDefault();
        }
    }, [getCursorIndex, editing]);
    (0, useDocumentEventListener_1.useDocumentEventListener)('contextmenu', onContextMenu);
    (0, react_1.useEffect)(() => {
        if (!refs.current.contextMenu)
            return;
        const items = [];
        if ((activeCell === null || activeCell === void 0 ? void 0 : activeCell.row) !== undefined) {
            items.push({
                type: 'COPY',
                action: () => {
                    onCopy();
                    setContextMenu(null);
                },
            }, {
                type: 'CUT',
                action: () => {
                    onCut();
                    setContextMenu(null);
                },
            }, {
                type: 'PASTE',
                action: () => __awaiter(void 0, void 0, void 0, function* () {
                    if (navigator.clipboard.read !== undefined) {
                        const items = yield navigator.clipboard.read();
                        items.forEach((item) => __awaiter(void 0, void 0, void 0, function* () {
                            let pasteData = [['']];
                            if (item.types.includes('text/html')) {
                                const htmlTextData = yield item.getType('text/html');
                                pasteData = (0, copyPasting_1.parseTextHtmlData)(yield htmlTextData.text());
                            }
                            else if (item.types.includes('text/plain')) {
                                const plainTextData = yield item.getType('text/plain');
                                pasteData = (0, copyPasting_1.parseTextPlainData)(yield plainTextData.text());
                            }
                            else if (item.types.includes('text')) {
                                const htmlTextData = yield item.getType('text');
                                pasteData = (0, copyPasting_1.parseTextHtmlData)(yield htmlTextData.text());
                            }
                            applyPasteDataToDatasheet(pasteData);
                        }));
                    }
                    else if (navigator.clipboard.readText !== undefined) {
                        const text = yield navigator.clipboard.readText();
                        applyPasteDataToDatasheet((0, copyPasting_1.parseTextPlainData)(text));
                    }
                    else {
                        alert('This action is unavailable in your browser, but you can still use Ctrl+V for paste');
                    }
                    setContextMenu(null);
                }),
            });
        }
        if ((selection === null || selection === void 0 ? void 0 : selection.max.row) !== undefined) {
            items.push({
                type: 'INSERT_ROW_BELLOW',
                action: () => {
                    setContextMenu(null);
                    insertRowAfter(selection.max.row);
                },
            });
        }
        else if ((activeCell === null || activeCell === void 0 ? void 0 : activeCell.row) !== undefined) {
            items.push({
                type: 'INSERT_ROW_BELLOW',
                action: () => {
                    setContextMenu(null);
                    insertRowAfter(activeCell.row);
                },
            });
        }
        if ((selection === null || selection === void 0 ? void 0 : selection.min.row) !== undefined &&
            selection.min.row !== selection.max.row) {
            items.push({
                type: 'DUPLICATE_ROWS',
                fromRow: selection.min.row + 1,
                toRow: selection.max.row + 1,
                action: () => {
                    setContextMenu(null);
                    duplicateRows(selection.min.row, selection.max.row);
                },
            });
        }
        else if ((activeCell === null || activeCell === void 0 ? void 0 : activeCell.row) !== undefined) {
            items.push({
                type: 'DUPLICATE_ROW',
                action: () => {
                    setContextMenu(null);
                    duplicateRows(activeCell.row);
                },
            });
        }
        if ((selection === null || selection === void 0 ? void 0 : selection.min.row) !== undefined &&
            selection.min.row !== selection.max.row) {
            items.push({
                type: 'DELETE_ROWS',
                fromRow: selection.min.row + 1,
                toRow: selection.max.row + 1,
                action: () => {
                    setContextMenu(null);
                    deleteRows(selection.min.row, selection.max.row);
                },
            });
        }
        else if ((activeCell === null || activeCell === void 0 ? void 0 : activeCell.row) !== undefined) {
            items.push({
                type: 'DELETE_ROW',
                action: () => {
                    setContextMenu(null);
                    deleteRows(activeCell.row);
                },
            });
        }
        setContextMenuItems(items);
        if (!items.length) {
            setContextMenu(null);
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
    ]);
    const _setActiveCell = (0, react_1.useCallback)((value) => {
        const cell = (0, typeCheck_1.getCell)(value, columns.length - (hasStickyRightColumn ? 2 : 1), data.length, columns);
        setActiveCell(cell);
        setEditing(false);
        setSelectionMode({ columns: false, active: false, rows: false });
        setSelectionCell(null);
    }, [
        columns,
        data.length,
        hasStickyRightColumn,
        setActiveCell,
        setSelectionCell,
        setSelectionMode,
    ]);
    const _setSelection = (0, react_1.useCallback)((value) => {
        const selection = (0, typeCheck_1.getSelection)(value, columns.length - (hasStickyRightColumn ? 2 : 1), data.length, columns);
        setActiveCell((selection === null || selection === void 0 ? void 0 : selection.min) || null);
        setEditing(false);
        setSelectionMode({ columns: false, active: false, rows: false });
        setSelectionCell((selection === null || selection === void 0 ? void 0 : selection.max) || null);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, data.length, hasStickyRightColumn]);
    (0, react_1.useImperativeHandle)(ref, () => ({
        activeCell: (0, typeCheck_1.getCellWithId)(activeCell, columns),
        selection: (0, typeCheck_1.getSelectionWithId)(selection !== null && selection !== void 0 ? selection : (activeCell ? { min: activeCell, max: activeCell } : null), columns),
        setSelection: _setSelection,
        setActiveCell: _setActiveCell,
    }));
    const callbacksRef = (0, react_1.useRef)({
        onFocus,
        onBlur,
        onActiveCellChange,
        onSelectionChange,
    });
    callbacksRef.current.onFocus = onFocus;
    callbacksRef.current.onBlur = onBlur;
    callbacksRef.current.onActiveCellChange = onActiveCellChange;
    callbacksRef.current.onSelectionChange = onSelectionChange;
    const columnWidthsRef = (0, react_1.useRef)(columnWidths);
    columnWidthsRef.current = columnWidths;
    const tableCallbacks = (0, react_1.useRef)({
        setSelection: _setSelection,
        setActiveCell: _setActiveCell,
        getRowId,
        getRowData: (rowIndex) => dataRef.current[rowIndex],
        getActiveCell: () => refs.current.activeCell,
        getCellSelection: () => selectionRef.current,
        getColumnVisibilityModel: () => { var _a; return (_a = columnVisibilityModelRef.current) !== null && _a !== void 0 ? _a : new Set(); },
        setColumnVisibilityModel: (_a = onColumnVisibilityChangeRef.current) !== null && _a !== void 0 ? _a : (() => undefined),
        getColumnWidths: () => columnWidthsRef.current,
    });
    tableCallbacks.current.setSelection = _setSelection;
    tableCallbacks.current.setActiveCell = _setActiveCell;
    (0, react_1.useEffect)(() => {
        if (lastEditingCellRef.current) {
            if (editing) {
                callbacksRef.current.onFocus({
                    cell: (0, typeCheck_1.getCellWithId)(lastEditingCellRef.current, columns),
                });
            }
            else {
                callbacksRef.current.onBlur({
                    cell: (0, typeCheck_1.getCellWithId)(lastEditingCellRef.current, columns),
                });
            }
        }
    }, [editing, columns]);
    (0, react_1.useEffect)(() => {
        callbacksRef.current.onActiveCellChange({
            cell: (0, typeCheck_1.getCellWithId)(activeCell, columns),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCell === null || activeCell === void 0 ? void 0 : activeCell.col, activeCell === null || activeCell === void 0 ? void 0 : activeCell.row, columns]);
    (0, react_1.useEffect)(() => {
        callbacksRef.current.onSelectionChange({
            selection: (0, typeCheck_1.getSelectionWithId)(selection !== null && selection !== void 0 ? selection : (activeCell ? { min: activeCell, max: activeCell } : null), columns),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        (_b = selection === null || selection === void 0 ? void 0 : selection.min.col) !== null && _b !== void 0 ? _b : activeCell === null || activeCell === void 0 ? void 0 : activeCell.col,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        (_c = selection === null || selection === void 0 ? void 0 : selection.min.row) !== null && _c !== void 0 ? _c : activeCell === null || activeCell === void 0 ? void 0 : activeCell.row,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        (_d = selection === null || selection === void 0 ? void 0 : selection.max.col) !== null && _d !== void 0 ? _d : activeCell === null || activeCell === void 0 ? void 0 : activeCell.col,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        (_e = selection === null || selection === void 0 ? void 0 : selection.max.row) !== null && _e !== void 0 ? _e : activeCell === null || activeCell === void 0 ? void 0 : activeCell.row,
        activeCell === null || activeCell === void 0 ? void 0 : activeCell.col,
        activeCell === null || activeCell === void 0 ? void 0 : activeCell.row,
        columns,
    ]);
    const getStickyColumnWidth = (0, react_1.useCallback)((side) => {
        var _a;
        if (side === 'right' && !hasStickyRightColumn) {
            return 0;
        }
        if (side === 'left' && !hasStickyLeftColumn) {
            return 0;
        }
        let width = 0;
        for (let i = 0; i < columns.length; i++) {
            if (columns[i].sticky === side) {
                width += (_a = columnWidths === null || columnWidths === void 0 ? void 0 : columnWidths[i]) !== null && _a !== void 0 ? _a : 100;
            }
        }
        return width;
    }, [columnWidths, columns, hasStickyLeftColumn, hasStickyRightColumn]);
    const getStickyColumnMaxIndex = (0, react_1.useCallback)((side) => {
        let index = 0;
        if (!hasStickyLeftColumn && side === 'left')
            return undefined;
        if (!hasStickyRightColumn && side === 'right')
            return undefined;
        if (side === 'left') {
            for (let i = 0; i < columns.length; i++) {
                if (columns[i].sticky === 'left') {
                    index = i;
                }
            }
            return index;
        }
        else {
            // Return first right
            for (let i = columns.length - 1; i >= 0; i--) {
                if (columns[i].sticky === 'right') {
                    return i;
                }
            }
        }
        return undefined;
    }, [columns, hasStickyLeftColumn, hasStickyRightColumn]);
    const beforeTabIndexFocus = (0, react_1.useCallback)((event) => {
        event.target.blur();
        setActiveCell({ col: 0, row: 0 });
    }, [setActiveCell]);
    const afterTabIndexFocus = (0, react_1.useCallback)((event) => {
        event.target.blur();
        setActiveCell({
            col: columns.length - (hasStickyRightColumn ? 3 : 2),
            row: data.length - 1,
        });
    }, [columns.length, data.length, hasStickyRightColumn, setActiveCell]);
    return (react_1.default.createElement("div", { className: className, style: style },
        react_1.default.createElement("div", { ref: beforeTabIndexRef, tabIndex: rawColumns.length && data.length ? 0 : undefined, onFocus: beforeTabIndexFocus }),
        react_1.default.createElement(Grid_1.Grid, { columns: columns, outerRef: outerRef, columnWidths: columnWidths, hasStickyRightColumn: hasStickyRightColumn, hasStickyLeftColumn: hasStickyLeftColumn, outerHeight: height, data: data, fullWidth: fullWidth, headerRowHeight: headerRowHeight, activeCell: activeCell, innerRef: innerRef, rowHeight: getRowSize, rowKey: rowKey, selection: selection, rowClassName: rowClassName, editing: editing, getContextMenuItems: getContextMenuItems, setRowData: setRowData, deleteRows: deleteRows, insertRowAfter: insertRowAfter, duplicateRows: duplicateRows, stopEditing: stopEditing, cellClassName: cellClassName, onScroll: onScroll, loading: loading, loadingRowComponent: loadingRowComponent, loadingRowCount: loadingRowCount, loadingRowHeight: loadingRowHeight, selectedRows: selectedRows, selectRows: selectRows, toggleSelection: toggleSelection, selectAllRows: selectAllRows, getRowId: getRowId, table: tableCallbacks.current, getStickyColumnWidth: getStickyColumnWidth, bottomReachedBuffer: bottomReachedBuffer, onBottomReached: onBottomReached, onBottomDataReached: onBottomDataReached, onBottomThrottleRate: onBottomThrottleRate, overscanRows: overscanRows },
            react_1.default.createElement(SelectionRect_1.SelectionRect, { columnRights: columnRights, columnWidths: columnWidths, activeCell: activeCell, selection: selection, headerRowHeight: headerRowHeight, rowHeight: getRowSize, hasStickyRightColumn: hasStickyRightColumn, hasStickyLeftColumn: hasStickyLeftColumn, dataLength: loading ? loadingRowCount : data.length, viewHeight: height, viewWidth: width, contentWidth: fullWidth ? undefined : contentWidth, edges: edges, editing: editing, isCellDisabled: isCellDisabled, isCellInteractive: isCellInteractive, expandSelection: expandSelection, getStickyColumnWidth: getStickyColumnWidth, getStickyColumnMaxIndex: getStickyColumnMaxIndex })),
        react_1.default.createElement("div", { ref: afterTabIndexRef, tabIndex: rawColumns.length && data.length ? 0 : undefined, onFocus: afterTabIndexFocus }),
        !lockRows && AddRowsComponent && (react_1.default.createElement(AddRowsComponent, { addRows: (count) => insertRowAfter(data.length - 1, count) })),
        contextMenu && contextMenuItems.length > 0 && (react_1.default.createElement(ContextMenu, { clientX: contextMenu.x, clientY: contextMenu.y, cursorIndex: contextMenu.cursorIndex, items: contextMenuItems, close: () => setContextMenu(null) }))));
}));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
exports.DataSheetGrid.displayName = 'DataSheetGrid';
//# sourceMappingURL=DataSheetGrid.js.map