"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRowSelection = void 0;
const react_1 = require("react");
const useRowSelection = (rowSelection, onRowSelectionChange) => {
    const [internalSelection, setInternalSelection] = (0, react_1.useState)([]);
    const onRowSelectionChangeRef = (0, react_1.useRef)(onRowSelectionChange);
    const handleRowSelectionChange = (0, react_1.useCallback)((rowId) => {
        var _a;
        if (rowSelection) {
            (_a = onRowSelectionChangeRef.current) === null || _a === void 0 ? void 0 : _a.call(onRowSelectionChangeRef, rowSelection.includes(rowId)
                ? rowSelection.filter((id) => id !== rowId)
                : [...rowSelection, rowId]);
        }
        else {
            setInternalSelection((prev) => prev.includes(rowId)
                ? prev.filter((id) => id !== rowId)
                : [...prev, rowId]);
        }
    }, [rowSelection]);
    const selectRows = (0, react_1.useMemo)(() => { var _a; return (_a = onRowSelectionChangeRef.current) !== null && _a !== void 0 ? _a : setInternalSelection; }, []);
    (0, react_1.useEffect)(() => {
        if (rowSelection) {
            setInternalSelection(rowSelection);
        }
    }, [rowSelection]);
    (0, react_1.useEffect)(() => {
        var _a;
        if (!rowSelection) {
            (_a = onRowSelectionChangeRef.current) === null || _a === void 0 ? void 0 : _a.call(onRowSelectionChangeRef, internalSelection);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [internalSelection]);
    const selectedRows = (0, react_1.useMemo)(() => {
        // Make map for faster lookup
        const selectionMap = new Set(rowSelection !== null && rowSelection !== void 0 ? rowSelection : internalSelection);
        return selectionMap;
    }, [rowSelection, internalSelection]);
    return {
        selectedRows,
        handleRowSelection: handleRowSelectionChange,
        selectRows,
    };
};
exports.useRowSelection = useRowSelection;
//# sourceMappingURL=useRowSelection.js.map