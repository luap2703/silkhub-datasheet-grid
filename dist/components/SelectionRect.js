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
exports.SelectionRect = void 0;
const react_1 = __importStar(require("react"));
const classnames_1 = __importDefault(require("classnames"));
const buildSquare = (top, right, bottom, left) => {
    return [
        [right, top],
        [left, top],
        [left, bottom],
        [right, bottom],
        [right, top],
    ];
};
const buildThreeSidedClipPath = (top, right, bottom, left) => {
    const buildLine = (...points) => points;
    const values = [
        ...buildLine([right, top], [left, top]), // Top line
        ...buildLine([left, top], [left, bottom]), // Left line
        ...buildLine([left, bottom], [right, bottom]), // Bottom line
    ];
    return `polygon(${values
        .map(([x, y]) => `${typeof x === 'number' ? x + 'px' : x} ${typeof y === 'number' ? y + 'px' : y}`)
        .join(', ')})`;
};
const buildClipPath = (top, right, bottom, left) => {
    const values = [
        ...buildSquare(0, '100%', '100%', 0),
        ...buildSquare(top, right, bottom, left),
    ];
    return `polygon(evenodd, ${values
        .map((pair) => pair
        .map((value) => typeof value === 'number' && value !== 0 ? value + 'px' : value)
        .join(' '))
        .join(',')})`;
};
exports.SelectionRect = react_1.default.memo(({ columnWidths, columnRights, headerRowHeight, selection, rowHeight, activeCell, hasStickyRightColumn, dataLength, viewWidth, viewHeight, contentWidth, edges, isCellDisabled, isCellInteractive, editing, expandSelection, getStickyColumnWidth, getStickyColumnMaxIndex, }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const activeCellIsDisabled = activeCell ? isCellDisabled(activeCell) : false;
    const activeCellIsInteractive = activeCell
        ? isCellInteractive(activeCell)
        : false;
    const selectionIsDisabled = (0, react_1.useMemo)(() => {
        if (!selection) {
            return activeCellIsDisabled;
        }
        for (let col = selection.min.col; col <= selection.max.col; ++col) {
            for (let row = selection.min.row; row <= selection.max.row; ++row) {
                if (!isCellDisabled({ col, row })) {
                    return false;
                }
            }
        }
        return true;
    }, [activeCellIsDisabled, isCellDisabled, selection]);
    const maxStickyLeft = (0, react_1.useMemo)(() => {
        var _a;
        return (_a = getStickyColumnMaxIndex('left')) !== null && _a !== void 0 ? _a : 0;
    }, [getStickyColumnMaxIndex]);
    const maxStickyRight = (0, react_1.useMemo)(() => {
        var _a, _b, _c;
        return ((_c = (_b = (_a = getStickyColumnMaxIndex('right')) !== null && _a !== void 0 ? _a : columnWidths === null || columnWidths === void 0 ? void 0 : columnWidths.length) !== null && _b !== void 0 ? _b : 0 - 1) !== null && _c !== void 0 ? _c : 0);
    }, [columnWidths === null || columnWidths === void 0 ? void 0 : columnWidths.length, getStickyColumnMaxIndex]);
    // If a sticky Column is in selection, we have to increase z-index
    const isStickySelected = (0, react_1.useMemo)(() => {
        if (!columnWidths || (!selection && !activeCell))
            return false;
        const cells = selection
            ? [selection.min, selection.max]
            : activeCell
                ? [activeCell]
                : [];
        const minCol = Math.min(...cells.map((cell) => cell.col));
        const maxCol = Math.max(...cells.map((cell) => cell.col));
        const isLeftSticky = minCol + 1 <= maxStickyLeft;
        const isRightSticky = maxCol - 1 >= maxStickyRight;
        // Check if the MAX column is also sticky (left or right)
        const maxIsAlsoLeft = maxCol + 1 <= maxStickyLeft;
        const maxIsAlsoRight = maxCol - 1 >= maxStickyRight;
        if (isLeftSticky || isRightSticky) {
            return {
                left: isLeftSticky,
                right: isRightSticky,
                exclusively: maxIsAlsoLeft === isLeftSticky && maxIsAlsoRight === isRightSticky,
            };
        }
        return false;
    }, [columnWidths, selection, activeCell, maxStickyLeft, maxStickyRight]);
    const isActiveCellSticky = (0, react_1.useMemo)(() => {
        if (!activeCell)
            return false;
        return (activeCell.col + 1 <= maxStickyLeft ||
            activeCell.col - 1 >= maxStickyRight);
    }, [activeCell, maxStickyLeft, maxStickyRight]);
    const extraPixelV = (0, react_1.useCallback)((rowI) => {
        return rowI < dataLength - 1 ? 1 : 0;
    }, [dataLength]);
    const extraPixelH = (0, react_1.useCallback)((colI) => {
        var _a;
        return colI <
            ((_a = columnWidths === null || columnWidths === void 0 ? void 0 : columnWidths.length) !== null && _a !== void 0 ? _a : 0) - (hasStickyRightColumn ? 3 : 2)
            ? 1
            : 0;
    }, [columnWidths === null || columnWidths === void 0 ? void 0 : columnWidths.length, hasStickyRightColumn]);
    const activeCellRect = activeCell && {
        width: ((_a = columnWidths === null || columnWidths === void 0 ? void 0 : columnWidths[activeCell.col + 1]) !== null && _a !== void 0 ? _a : 0) + extraPixelH(activeCell.col),
        height: rowHeight(activeCell.row).height + extraPixelV(activeCell.row),
        left: (_b = columnRights === null || columnRights === void 0 ? void 0 : columnRights[activeCell.col]) !== null && _b !== void 0 ? _b : 0,
        top: rowHeight(activeCell.row).top + headerRowHeight,
    };
    const selectionRect = selection && {
        width: ((_d = (_c = columnWidths === null || columnWidths === void 0 ? void 0 : columnWidths.slice(selection.min.col + 1, selection.max.col + 2)) === null || _c === void 0 ? void 0 : _c.reduce((a, b) => a + b)) !== null && _d !== void 0 ? _d : 0) + extraPixelH(selection.max.col),
        height: rowHeight(selection.max.row).top +
            rowHeight(selection.max.row).height -
            rowHeight(selection.min.row).top +
            extraPixelV(selection.max.row),
        left: (_e = columnRights === null || columnRights === void 0 ? void 0 : columnRights[selection.min.col]) !== null && _e !== void 0 ? _e : 0,
        top: rowHeight(selection.min.row).top + headerRowHeight,
    };
    const leftStickyColumnWidth = (0, react_1.useMemo)(() => {
        return getStickyColumnWidth('left');
    }, [getStickyColumnWidth]);
    const rightStickyColumnWidth = (0, react_1.useMemo)(() => {
        return getStickyColumnWidth('right');
    }, [getStickyColumnWidth]);
    if (!columnWidths || !columnRights) {
        return null;
    }
    /**
     * When using sticky columns, we need to create separate selection rects for the sticky columns.
     * This is bc the normal selection lays between z-index 20, while sticky columns are z-index 30.
     * We can't change z-indexes, as selection is scrolling as well, so we need to imiate a non-scrolling
     * selection for the sticky columns.
     */
    const stickyLeftSelectionRect = selectionRect &&
        isStickySelected &&
        isStickySelected.left &&
        !isStickySelected.exclusively
        ? Object.assign(Object.assign({}, selectionRect), { width: leftStickyColumnWidth -
                columnWidths
                    .slice(0, selection.min.col + 1)
                    .reduce((a, b) => a + b) }) : null;
    const stickyRightSelectionRect = selectionRect &&
        isStickySelected &&
        isStickySelected.right &&
        !isStickySelected.exclusively
        ? Object.assign(Object.assign({}, selectionRect), { left: rightStickyColumnWidth, width: columnRights[selection.max.col] - rightStickyColumnWidth }) : null;
    const minSelection = (selection === null || selection === void 0 ? void 0 : selection.min) || activeCell;
    const maxSelection = (selection === null || selection === void 0 ? void 0 : selection.max) || activeCell;
    const expandRowsIndicator = maxSelection &&
        expandSelection !== null && {
        left: columnRights[maxSelection.col] + columnWidths[maxSelection.col + 1],
        top: rowHeight(maxSelection.row).top +
            rowHeight(maxSelection.row).height +
            headerRowHeight,
        transform: `translate(-${maxSelection.col <
            columnWidths.length - (hasStickyRightColumn ? 3 : 2)
            ? 50
            : 100}%, -${maxSelection.row < dataLength - 1 ? 50 : 100}%)`,
    };
    const expandRowsRect = minSelection &&
        maxSelection &&
        expandSelection !== null && {
        width: columnWidths
            .slice(minSelection.col + 1, maxSelection.col + 2)
            .reduce((a, b) => a + b) + extraPixelH(maxSelection.col),
        height: rowHeight(maxSelection.row + expandSelection).top +
            rowHeight(maxSelection.row + expandSelection).height -
            rowHeight(maxSelection.row + 1).top +
            extraPixelV(maxSelection.row + expandSelection) -
            1,
        left: columnRights[minSelection.col],
        top: rowHeight(maxSelection.row).top +
            rowHeight(maxSelection.row).height +
            headerRowHeight +
            1,
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", { className: "dsg-scrollable-view-container", style: {
                height: rowHeight(dataLength - 1).top +
                    rowHeight(dataLength - 1).height +
                    headerRowHeight,
                width: contentWidth ? contentWidth : '100%',
            } },
            react_1.default.createElement("div", { className: (0, classnames_1.default)({
                    'dsg-scrollable-view': true,
                    'dsg-scrollable-view-t': !edges.top,
                    'dsg-scrollable-view-r': !edges.right,
                    'dsg-scrollable-view-b': !edges.bottom,
                    'dsg-scrollable-view-l': !edges.left,
                }), style: {
                    top: headerRowHeight,
                    left: columnWidths[0],
                    height: viewHeight ? viewHeight - headerRowHeight : 0,
                    width: contentWidth && viewWidth
                        ? viewWidth -
                            columnWidths[0] -
                            (hasStickyRightColumn
                                ? columnWidths[columnWidths.length - 1]
                                : 0)
                        : `calc(100% - ${columnWidths[0] +
                            (hasStickyRightColumn
                                ? columnWidths[columnWidths.length - 1]
                                : 0)}px)`,
                } })),
        (selectionRect || activeCellRect) && (react_1.default.createElement("div", { className: "dsg-selection-col-marker-container", style: {
                left: (_f = selectionRect === null || selectionRect === void 0 ? void 0 : selectionRect.left) !== null && _f !== void 0 ? _f : activeCellRect === null || activeCellRect === void 0 ? void 0 : activeCellRect.left,
                width: (_g = selectionRect === null || selectionRect === void 0 ? void 0 : selectionRect.width) !== null && _g !== void 0 ? _g : activeCellRect === null || activeCellRect === void 0 ? void 0 : activeCellRect.width,
                height: rowHeight(dataLength - 1).top +
                    rowHeight(dataLength - 1).height +
                    headerRowHeight,
            } },
            react_1.default.createElement("div", { className: (0, classnames_1.default)('dsg-selection-col-marker', selectionIsDisabled && 'dsg-selection-col-marker-disabled'), style: { top: headerRowHeight } }))),
        (selectionRect || activeCellRect) && (react_1.default.createElement("div", { className: "dsg-selection-row-marker-container", style: {
                top: (_h = selectionRect === null || selectionRect === void 0 ? void 0 : selectionRect.top) !== null && _h !== void 0 ? _h : activeCellRect === null || activeCellRect === void 0 ? void 0 : activeCellRect.top,
                height: (_j = selectionRect === null || selectionRect === void 0 ? void 0 : selectionRect.height) !== null && _j !== void 0 ? _j : activeCellRect === null || activeCellRect === void 0 ? void 0 : activeCellRect.height,
                width: contentWidth ? contentWidth : '100%',
            } },
            react_1.default.createElement("div", { className: (0, classnames_1.default)('dsg-selection-row-marker', selectionIsDisabled && 'dsg-selection-row-marker-disabled'), style: { left: columnWidths[0] } }))),
        activeCellRect && activeCell && (react_1.default.createElement("div", { className: "dsg-active-cell-container", style: {
                position: isActiveCellSticky ? 'absolute' : undefined,
                left: isActiveCellSticky ? 0 : undefined,
                top: activeCellRect === null || activeCellRect === void 0 ? void 0 : activeCellRect.top,
                height: 0,
                width: contentWidth ? contentWidth : '100%',
            } },
            react_1.default.createElement("div", { className: (0, classnames_1.default)('dsg-active-cell', {
                    'dsg-active-cell-focus': editing,
                    'dsg-active-cell-disabled': activeCellIsDisabled,
                    'dsg-active-cell-passive': !activeCellIsInteractive,
                }), style: Object.assign(Object.assign({}, activeCellRect), { position: isActiveCellSticky ? 'sticky' : undefined, top: isActiveCellSticky ? undefined : activeCellRect.top }) }))),
        selectionRect && activeCellRect && (react_1.default.createElement("div", { className: (0, classnames_1.default)('dsg-selection-rect', selectionIsDisabled && 'dsg-selection-rect-disabled'), style: Object.assign(Object.assign({}, selectionRect), { zIndex: isStickySelected && isStickySelected.exclusively
                    ? 30
                    : undefined, clipPath: buildClipPath(activeCellRect.top - selectionRect.top, activeCellRect.left - selectionRect.left, activeCellRect.top + activeCellRect.height - selectionRect.top, activeCellRect.left + activeCellRect.width - selectionRect.left) }) })),
        react_1.default.createElement("div", { className: "dsg-selection-rect-sticky-container dsg-selection-rect-sticky-container-left", style: {
                height: (_k = selectionRect === null || selectionRect === void 0 ? void 0 : selectionRect.height) !== null && _k !== void 0 ? _k : activeCellRect === null || activeCellRect === void 0 ? void 0 : activeCellRect.height,
                width: contentWidth ? contentWidth : '100%',
            } }, stickyLeftSelectionRect && activeCellRect && selectionRect && (react_1.default.createElement("div", { className: (0, classnames_1.default)('dsg-selection-rect', 'dsg-selection-rect-sticky', 'dsg-selection-rect-left-sticky', selectionIsDisabled && 'dsg-selection-rect-disabled'), style: Object.assign(Object.assign({}, stickyLeftSelectionRect), { top: undefined, 
                // Using marginTop here instead of top: value on container. This is necessary to make the animation (when selection from bottom => top) smooth,
                // Bc it would otherwise jump to the top of the container and then animate downwards, which looks weird
                marginTop: stickyLeftSelectionRect.top - headerRowHeight, clipPath: isActiveCellSticky
                    ? buildClipPath(activeCellRect.top - selectionRect.top, activeCellRect.left - selectionRect.left, activeCellRect.top +
                        activeCellRect.height -
                        selectionRect.top, activeCellRect.left +
                        activeCellRect.width -
                        selectionRect.left)
                    : undefined }) }))),
        react_1.default.createElement("div", { className: "dsg-selection-rect-sticky-container dsg-selection-rect-sticky-container-right", style: {
                height: (_l = selectionRect === null || selectionRect === void 0 ? void 0 : selectionRect.height) !== null && _l !== void 0 ? _l : activeCellRect === null || activeCellRect === void 0 ? void 0 : activeCellRect.height,
                width: contentWidth ? contentWidth : '100%',
            } }, stickyRightSelectionRect && activeCellRect && selectionRect && (react_1.default.createElement("div", { className: (0, classnames_1.default)('dsg-selection-rect', 'dsg-selection-rect-sticky', 'dsg-selection-rect-right-sticky', selectionIsDisabled && 'dsg-selection-rect-disabled'), style: Object.assign(Object.assign({}, stickyRightSelectionRect), { top: undefined, 
                // See reason for this above above
                marginTop: stickyRightSelectionRect.top - headerRowHeight, clipPath: isActiveCellSticky
                    ? buildClipPath(activeCellRect.top - selectionRect.top, activeCellRect.left - selectionRect.left, activeCellRect.top +
                        activeCellRect.height -
                        selectionRect.top, activeCellRect.left +
                        activeCellRect.width -
                        selectionRect.left)
                    : undefined }) }))),
        expandRowsRect && (react_1.default.createElement("div", { className: (0, classnames_1.default)('dsg-expand-rows-rect'), style: expandRowsRect })),
        expandRowsIndicator && (react_1.default.createElement("div", { className: (0, classnames_1.default)('dsg-expand-rows-indicator', selectionIsDisabled && 'dsg-expand-rows-indicator-disabled'), style: expandRowsIndicator }))));
});
exports.SelectionRect.displayName = 'SelectionRect';
//# sourceMappingURL=SelectionRect.js.map