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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyColumn = void 0;
const react_1 = __importStar(require("react"));
const KeyComponent = (_a) => {
    var { columnData: { key, id, original, }, rowData, setRowData } = _a, rest = __rest(_a, ["columnData", "rowData", "setRowData"]);
    // We use a ref so useCallback does not produce a new setKeyData function every time the rowData changes
    const rowDataRef = (0, react_1.useRef)(rowData);
    rowDataRef.current = rowData;
    // We wrap the setRowData function to assign the value to the desired key
    const setKeyData = (0, react_1.useCallback)((value) => {
        setRowData(mergeRowDataWithKey(rowDataRef.current, key, id, value));
    }, [id, key, setRowData]);
    const keyColumnRowData = (0, react_1.useMemo)(() => {
        return getKeyRowData(rowData, key);
    }, [key, rowData]);
    if (!original.component) {
        return react_1.default.createElement(react_1.default.Fragment, null);
    }
    const Component = original.component;
    return (react_1.default.createElement(Component, Object.assign({ columnData: original.columnData, setRowData: setKeyData, 
        // We only pass the value of the desired key, this is why each cell does not have to re-render everytime
        // another cell in the same row changes!
        rowData: keyColumnRowData }, rest)));
};
/**
 * Extracts the value from the data object based on the key or selector function
 *
 * @param rowData - Data object from which the value is extracted
 * @param key - Data key or selector function
 * @returns Selected value of type ResultType
 */
const getKeyRowData = (rowData, key) => {
    if (typeof key === 'function') {
        return key(rowData);
    }
    if (typeof key === 'string') {
        if (key.includes('.')) {
            const keys = key.split('.');
            let result = rowData;
            for (const k of keys) {
                if (result == null)
                    return undefined;
                result = result[k];
            }
            return result;
        }
        return rowData[key];
    }
    return null; // Should never be reached
};
/**
 * @param selector - The selector of the column. This can be:
 *   - A direct key
 *   - A nested key
 *   - A selector function
 *
 * Important: If the selector is a function, it must return a value of type T.
 * If the selector is a string, it serves as a fallback key if no id is specified.
 *
 * **Important**: Since we cannot map the selector (or arbitrary id) to the row data back
 * on changes, we pass the updated value in an $operationValue object. This ensures that the
 * value is not lost when the row data is updated.
 *
 * @param column - The column definition to be used.
 * @returns - Returns a ColumnReturn object.
 */
const keyColumn = (selector, column) => {
    var _a;
    // If the column has an id, we use it as the key
    const id = (_a = column.id) !== null && _a !== void 0 ? _a : selector;
    return Object.assign(Object.assign({ id: id }, column), { 
        // We pass the key and the original column as columnData to be able to retrieve them in the cell component
        columnData: { key: selector, id, original: column }, component: KeyComponent, 
        // Here we simply wrap all functions to only pass the value of the desired key to the column, and not the entire row
        copyValue: ({ rowData, rowIndex }) => {
            var _a, _b;
            return (_b = (_a = column.copyValue) === null || _a === void 0 ? void 0 : _a.call(column, {
                rowData: getKeyRowData(rowData, selector),
                rowIndex,
            })) !== null && _b !== void 0 ? _b : null;
        }, deleteValue: ({ rowData, rowIndex }) => {
            var _a, _b;
            return mergeRowDataWithKey(rowData, selector, id, (_b = (_a = column.deleteValue) === null || _a === void 0 ? void 0 : _a.call(column, {
                rowData: getKeyRowData(rowData, selector),
                rowIndex,
            })) !== null && _b !== void 0 ? _b : null);
        }, pasteValue: ({ rowData, value, rowIndex }) => {
            var _a, _b;
            return mergeRowDataWithKey(rowData, selector, id, (_b = (_a = column.pasteValue) === null || _a === void 0 ? void 0 : _a.call(column, {
                rowData: getKeyRowData(rowData, selector),
                value,
                rowIndex,
            })) !== null && _b !== void 0 ? _b : null);
        }, disabled: typeof column.disabled === 'function'
            ? ({ rowData, rowIndex }) => {
                var _a;
                return typeof column.disabled === 'function'
                    ? column.disabled({
                        rowData: getKeyRowData(rowData, selector),
                        rowIndex,
                    })
                    : (_a = column.disabled) !== null && _a !== void 0 ? _a : false;
            }
            : column.disabled, cellClassName: typeof column.cellClassName === 'function'
            ? ({ rowData, rowIndex, columnId }) => {
                var _a;
                return typeof column.cellClassName === 'function'
                    ? column.cellClassName({
                        rowData: getKeyRowData(rowData, selector),
                        rowIndex,
                        columnId,
                    })
                    : (_a = column.cellClassName) !== null && _a !== void 0 ? _a : undefined;
            }
            : column.cellClassName, isCellEmpty: ({ rowData, rowIndex }) => {
            var _a, _b;
            return (_b = (_a = column.isCellEmpty) === null || _a === void 0 ? void 0 : _a.call(column, {
                rowData: getKeyRowData(rowData, selector),
                rowIndex,
            })) !== null && _b !== void 0 ? _b : false;
        }, interactive: typeof column.interactive === 'function'
            ? ({ rowData, rowIndex }) => {
                var _a;
                return typeof column.interactive === 'function'
                    ? column.interactive({
                        rowData: getKeyRowData(rowData, selector),
                        rowIndex,
                    })
                    : (_a = column.interactive) !== null && _a !== void 0 ? _a : false;
            }
            : column.interactive, onCellKeyDown(opt, e) {
            if (column.onCellKeyDown && selector) {
                column.onCellKeyDown(Object.assign(Object.assign({}, opt), { rowData: getKeyRowData(opt.rowData, selector) }), e);
            }
        } });
};
exports.keyColumn = keyColumn;
const mergeRowDataWithKey = (rowData, key, id, newValue) => {
    const res = (obj) => (Object.assign(Object.assign({}, obj), { $operationValue: Object.assign(Object.assign({}, obj.$operationValue), { [id]: newValue }) }));
    if (typeof key === 'string') {
        // Check if the key is an indirect key
        if (key in rowData)
            res(Object.assign(Object.assign({}, rowData), { [key]: newValue }));
        const keys = key.split('.');
        let result = rowData;
        let isValidIndirectKey = true;
        for (const k of keys) {
            if (result == null || typeof result !== 'object' || !(k in result)) {
                isValidIndirectKey = false;
                break;
            }
            result = result[k];
        }
        if (isValidIndirectKey) {
            const mergeDeep = (obj, path, value) => {
                if (path.length === 1) {
                    obj[path[0]] = value;
                    return;
                }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const key = path.shift();
                if (!(key in obj) || typeof obj[key] !== 'object') {
                    obj[key] = {};
                }
                mergeDeep(obj[key], path, value);
            };
            const newData = structuredClone(rowData);
            mergeDeep(newData, keys, newValue);
            return res(newData);
        }
        // Check if the key is a direct key
    }
    return res(rowData);
};
/**
 * Creates a column with a key and a column definition
 * @param key - Key of the column
 * @param column - Column definition
 * @returns Column definition with key and original column
 * @description It is important to note that, if the key is a function, on an update, the updated value is not returned in a prop, but as "operationValue" in the operation object.
 */
//# sourceMappingURL=keyColumn.js.map