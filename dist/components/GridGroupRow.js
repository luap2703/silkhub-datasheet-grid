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
exports.GridGroupRow = void 0;
const react_1 = __importStar(require("react"));
const Cell_1 = require("./Cell");
const classnames_1 = __importDefault(require("classnames"));
const GridGroupRow = ({ colVirtualizer, columns, data, row, rowIndex, loading, LoadingComponent, hasStickyLeftColumn, hasStickyRightColumn, activeCell, editing, getContextMenuItems, deleteGivenRow, duplicateGivenRow, stopEditing, insertAfterGivenRow, setGivenRowData, rowSelected, selectRows, toggleGivenRow, getRowId, table, groupRowComponentProps, GroupRowComponent, cellClassName, fullWidth, rowActive, }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const firstCol = (_a = colVirtualizer.getVirtualItems()) === null || _a === void 0 ? void 0 : _a[0];
    const lastCol = colVirtualizer.getVirtualItems()[colVirtualizer.getVirtualItems().length - 1];
    const keepLeftRows = (_b = groupRowComponentProps === null || groupRowComponentProps === void 0 ? void 0 : groupRowComponentProps.keepColsLeft) !== null && _b !== void 0 ? _b : 0;
    const keepRightRows = (_c = groupRowComponentProps === null || groupRowComponentProps === void 0 ? void 0 : groupRowComponentProps.keepColsRight) !== null && _c !== void 0 ? _c : 0;
    const leftOffset = (_j = (_f = (_e = (_d = colVirtualizer.getVirtualItems()) === null || _d === void 0 ? void 0 : _d[keepLeftRows + 1]) === null || _e === void 0 ? void 0 : _e.start) !== null && _f !== void 0 ? _f : (_h = (_g = colVirtualizer.getVirtualItems()) === null || _g === void 0 ? void 0 : _g[keepLeftRows]) === null || _h === void 0 ? void 0 : _h.start) !== null && _j !== void 0 ? _j : 0;
    const cols = colVirtualizer.getVirtualItems();
    const totalSize = colVirtualizer.getTotalSize();
    const width = (0, react_1.useMemo)(() => {
        var _a;
        const lastCol = Math.min(columns.length - 1 - keepRightRows, cols.length - 1 - keepRightRows);
        return (
        // Get the size until the keepColRight
        cols[lastCol].start + cols[lastCol].size - ((_a = cols === null || cols === void 0 ? void 0 : cols[keepLeftRows + 1]) === null || _a === void 0 ? void 0 : _a.start));
    }, [totalSize, cols, keepLeftRows, keepRightRows, columns]);
    console.log('widths', cols.map((c) => c.start), cols.reduce((acc, c) => acc + c.size, 0), totalSize, width);
    const groupCellClassName = groupRowComponentProps === null || groupRowComponentProps === void 0 ? void 0 : groupRowComponentProps.cellClassName;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        colVirtualizer
            .getVirtualItems()
            .filter((i) => i.index <= keepLeftRows)
            .map((col) => {
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
            const cellIsActive = (activeCell === null || activeCell === void 0 ? void 0 : activeCell.row) === row.index && activeCell.col === col.index - 1;
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
                    : undefined), width: col.size, left: col.start }, loading || data[rowIndex] === null ? (LoadingComponent) : (react_1.default.createElement(Component, { rowData: data[row.index], getContextMenuItems: getContextMenuItems, disabled: cellDisabled, rowId: row.key.toString(), active: cellIsActive, columnIndex: col.index - 1, rowIndex: row.index, focus: cellIsActive && editing, deleteRow: deleteGivenRow(row.index), duplicateRow: duplicateGivenRow(row.index), stopEditing: stopEditing, insertRowBelow: insertAfterGivenRow(row.index), setRowData: setGivenRowData(row.index), columnData: columns[col.index].columnData, selected: Boolean(rowSelected), selectRows: selectRows, toggleSelection: toggleGivenRow(row.index), getRowId: getRowId, table: table }))));
        }),
        react_1.default.createElement(Cell_1.Cell, { gutter: false, stickyRight: false, stickyLeft: 
            // If the replaced column (i.e., the column after keepLeftRows, is still sticky)
            false, 
            // Width and right should be the remaining cols that are now replaced by the group row
            width: width, left: leftOffset, className: (0, classnames_1.default)('dsg-cell-subheader', Boolean(rowSelected) && 'dsg-cell-subheader-selected', (activeCell === null || activeCell === void 0 ? void 0 : activeCell.row) === rowIndex && 'dsg-cell-subheader-active', typeof groupCellClassName === 'function'
                ? groupCellClassName({
                    rowData: data[rowIndex],
                    rowIndex: rowIndex,
                })
                : groupCellClassName), disabled: (_k = ((groupRowComponentProps === null || groupRowComponentProps === void 0 ? void 0 : groupRowComponentProps.disabled) === true ||
                (typeof (groupRowComponentProps === null || groupRowComponentProps === void 0 ? void 0 : groupRowComponentProps.disabled) === 'function' &&
                    groupRowComponentProps.disabled({
                        rowData: data[rowIndex],
                        rowIndex: rowIndex,
                    })))) !== null && _k !== void 0 ? _k : undefined, interactive: (_l = ((groupRowComponentProps === null || groupRowComponentProps === void 0 ? void 0 : groupRowComponentProps.interactive) === true ||
                (typeof (groupRowComponentProps === null || groupRowComponentProps === void 0 ? void 0 : groupRowComponentProps.interactive) === 'function' &&
                    groupRowComponentProps.interactive({
                        rowData: data[rowIndex],
                        rowIndex: rowIndex,
                    })))) !== null && _l !== void 0 ? _l : undefined }, loading || data[rowIndex] === null ? (LoadingComponent) : (react_1.default.createElement(GroupRowComponent, { rowData: data[rowIndex], rowIndex: rowIndex }))),
        colVirtualizer
            .getVirtualItems()
            .filter((i) => i.index > columns.length - 1 - keepRightRows)
            .map((col) => {
            const colCellClassName = columns[col.index].cellClassName;
            const cellClassName = columns[col.index].cellClassName;
            const disabled = columns[col.index].disabled;
            const Component = columns[col.index].component;
            const cellDisabled = disabled === true ||
                (typeof disabled === 'function' &&
                    disabled({
                        rowData: data[rowIndex],
                        rowIndex: rowIndex,
                    }));
            const interactive = columns[col.index].interactive;
            const cellInteractive = interactive === true ||
                (typeof interactive === 'function' &&
                    interactive({
                        rowData: data[rowIndex],
                        rowIndex: rowIndex,
                    }));
            const cellIsActive = (activeCell === null || activeCell === void 0 ? void 0 : activeCell.row) === rowIndex && activeCell.col === col.index - 1;
            const isStickyLeft = hasStickyLeftColumn && columns[col.index].sticky === 'left';
            const isLoading = loading || data[rowIndex] === null;
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
                    : undefined), width: col.size, left: col.start }, loading || data[rowIndex] === null ? (LoadingComponent) : (react_1.default.createElement(Component, { rowData: data[row.index], getContextMenuItems: getContextMenuItems, disabled: cellDisabled, rowId: row.key.toString(), active: cellIsActive, columnIndex: col.index - 1, rowIndex: row.index, focus: cellIsActive && editing, deleteRow: deleteGivenRow(row.index), duplicateRow: duplicateGivenRow(row.index), stopEditing: stopEditing, insertRowBelow: insertAfterGivenRow(row.index), setRowData: setGivenRowData(row.index), columnData: columns[col.index].columnData, selected: Boolean(rowSelected), selectRows: selectRows, toggleSelection: toggleGivenRow(row.index), getRowId: getRowId, table: table }))));
        })));
};
exports.GridGroupRow = GridGroupRow;
//# sourceMappingURL=GridGroupRow.js.map