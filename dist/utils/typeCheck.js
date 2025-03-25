"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelectionWithId = exports.getSelection = exports.getCellWithId = exports.getCell = void 0;
const getCell = (value, colMax, rowMax, columns) => {
    if (value === null || !colMax || !rowMax) {
        return null;
    }
    if (typeof value !== 'object') {
        throw new Error('Value must be an object or null');
    }
    const colIndex = columns.findIndex((column) => column.id === value.col);
    const cell = {
        col: Math.max(0, Math.min(colMax - 1, colIndex === -1 ? Number(value.col) : colIndex - 1)),
        row: Math.max(0, Math.min(rowMax - 1, Number(value.row))),
    };
    if (isNaN(cell.col) || isNaN(cell.row)) {
        throw new Error('col or cell are not valid positive numbers');
    }
    return cell;
};
exports.getCell = getCell;
const getCellWithId = (cell, columns) => {
    var _a;
    return cell
        ? {
            col: cell.col,
            row: cell.row,
            colId: (_a = columns[cell.col + 1]) === null || _a === void 0 ? void 0 : _a.id,
        }
        : null;
};
exports.getCellWithId = getCellWithId;
const getSelection = (value, colMax, rowMax, columns) => {
    if (value === null || !colMax || !rowMax) {
        return null;
    }
    if (typeof value !== 'object') {
        throw new Error('Value must be an object or null');
    }
    const selection = {
        min: (0, exports.getCell)(value.min, colMax, rowMax, columns),
        max: (0, exports.getCell)(value.max, colMax, rowMax, columns),
    };
    if (!selection.min || !selection.max) {
        throw new Error('min and max must be defined');
    }
    return selection;
};
exports.getSelection = getSelection;
const getSelectionWithId = (selection, columns) => selection
    ? {
        min: (0, exports.getCellWithId)(selection.min, columns),
        max: (0, exports.getCellWithId)(selection.max, columns),
    }
    : null;
exports.getSelectionWithId = getSelectionWithId;
//# sourceMappingURL=typeCheck.js.map