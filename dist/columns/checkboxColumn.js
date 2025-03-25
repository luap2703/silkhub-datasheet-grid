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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkboxColumn = void 0;
const react_1 = __importStar(require("react"));
// Those values are used when pasting values, all those values will be considered false, any other true
const FALSY = [
    '',
    'false',
    'no',
    'off',
    'disabled',
    '0',
    'n',
    'f',
    'unchecked',
    'undefined',
    'null',
    'wrong',
    'negative',
];
const CheckboxComponent = react_1.default.memo(({ focus, rowData, setRowData, active, stopEditing, disabled }) => {
    const ref = (0, react_1.useRef)(null);
    // When cell becomes focus we immediately toggle the checkbox and blur the cell by calling `stopEditing`
    // Notice the `nextRow: false` to make sure the active cell does not go to the cell below and stays on this cell
    // This way the user can keep pressing Enter to toggle the checkbox on and off multiple times
    (0, react_1.useLayoutEffect)(() => {
        if (focus) {
            setRowData(!rowData);
            stopEditing({ nextRow: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focus, stopEditing]);
    return (react_1.default.createElement("input", { className: "dsg-checkbox", 
        // Important to prevent any undesired "tabbing"
        tabIndex: -1, type: "checkbox", ref: ref, disabled: disabled, checked: Boolean(rowData), 
        // When cell is not active, we allow the user to toggle the checkbox by clicking on it
        // When cell becomes active, we disable this feature and rely on focus instead (see `useLayoutEffect` above)
        onMouseDown: () => !active && setRowData(!rowData), onChange: () => null }));
});
CheckboxComponent.displayName = 'CheckboxComponent';
exports.checkboxColumn = {
    component: CheckboxComponent,
    deleteValue: () => false,
    // We can customize what value is copied: when the checkbox is checked we copy YES, otherwise we copy NO
    copyValue: ({ rowData }) => (rowData ? 'YES' : 'NO'),
    // Since we copy custom values, we have to make sure pasting gives us the expected result
    // Here NO is included in the FALSY array, so it will be converted to false, YES is not, so it will be converted to true
    pasteValue: ({ value }) => !FALSY.includes(value.toLowerCase()),
    isCellEmpty: ({ rowData }) => !rowData,
};
//# sourceMappingURL=checkboxColumn.js.map