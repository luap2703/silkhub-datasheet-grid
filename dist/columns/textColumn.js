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
exports.textColumn = void 0;
exports.createTextColumn = createTextColumn;
const react_1 = __importStar(require("react"));
const classnames_1 = __importDefault(require("classnames"));
const useFirstRender_1 = require("../hooks/useFirstRender");
const TextComponent = react_1.default.memo(({ active, focus, rowData, setRowData, columnData: { placeholder, alignRight, formatInputOnFocus, formatBlurredInput, parseUserInput, continuousUpdates, InputComponent, }, }) => {
    const ref = (0, react_1.useRef)(null);
    const firstRender = (0, useFirstRender_1.useFirstRender)();
    // We create refs for async access so we don't have to add it to the useEffect dependencies
    const asyncRef = (0, react_1.useRef)({
        rowData,
        formatInputOnFocus,
        formatBlurredInput,
        setRowData,
        parseUserInput,
        continuousUpdates,
        firstRender,
        // Timestamp of last focus (when focus becomes true) and last change (input change)
        // used to prevent un-necessary updates when value was not changed
        focusedAt: 0,
        changedAt: 0,
        // This allows us to keep track of whether or not the user blurred the input using the Esc key
        // If the Esc key is used we do not update the row's value (only relevant when continuousUpdates is false)
        escPressed: false,
    });
    asyncRef.current = {
        rowData,
        formatInputOnFocus,
        formatBlurredInput,
        setRowData,
        parseUserInput,
        continuousUpdates,
        firstRender,
        // Keep the same values across renders
        focusedAt: asyncRef.current.focusedAt,
        changedAt: asyncRef.current.changedAt,
        escPressed: asyncRef.current.escPressed,
    };
    (0, react_1.useLayoutEffect)(() => {
        // When the cell gains focus we make sure to immediately select the text in the input:
        // - If the user gains focus by typing, it will replace the existing text, as expected
        // - If the user gains focus by clicking or pressing Enter, the text will be preserved and selected
        if (focus) {
            if (ref.current) {
                // Make sure to first format the input
                ref.current.value = asyncRef.current.formatInputOnFocus(asyncRef.current.rowData);
                ref.current.focus();
                ref.current.select();
            }
            // We immediately reset the escPressed
            asyncRef.current.escPressed = false;
            // Save current timestamp
            asyncRef.current.focusedAt = Date.now();
        }
        // When the cell looses focus (by pressing Esc, Enter, clicking away...) we make sure to blur the input
        // Otherwise the user would still see the cursor blinking
        else {
            if (ref.current) {
                // Update the row's value on blur only if the user did not press escape (only relevant when continuousUpdates is false)
                if (!asyncRef.current.escPressed &&
                    !asyncRef.current.continuousUpdates &&
                    !asyncRef.current.firstRender &&
                    // Make sure that focus was gained more than 10 ms ago, used to prevent flickering
                    asyncRef.current.changedAt >= asyncRef.current.focusedAt) {
                    asyncRef.current.setRowData(asyncRef.current.parseUserInput(ref.current.value));
                }
                ref.current.blur();
            }
        }
    }, [focus]);
    (0, react_1.useEffect)(() => {
        if (!focus && ref.current) {
            // On blur or when the data changes, format it for display
            ref.current.value = asyncRef.current.formatBlurredInput(rowData);
        }
    }, [focus, rowData]);
    (0, react_1.useLayoutEffect)(() => {
        // WHen the value from rowData changes a
    }, [rowData]);
    const Input = (InputComponent || 'input');
    (0, react_1.useEffect)(() => {
        console.log('rowData changed', rowData);
    }, [rowData]);
    console.log('rd', asyncRef.current);
    return (react_1.default.createElement(Input
    // We use an uncontrolled component for better performance
    , { 
        // We use an uncontrolled component for better performance
        defaultValue: formatBlurredInput(rowData), className: (0, classnames_1.default)('dsg-input', alignRight && 'dsg-input-align-right'), placeholder: active ? placeholder : undefined, 
        // Important to prevent any undesired "tabbing"
        tabIndex: -1, ref: ref, 
        // Make sure that while the cell is not focus, the user cannot interact with the input
        // The cursor will not change to "I", the style of the input will not change,
        // and the user cannot click and edit the input (this part is handled by DataSheetGrid itself)
        style: { pointerEvents: focus ? 'auto' : 'none' }, onChange: (e) => {
            asyncRef.current.changedAt = Date.now();
            // Only update the row's value as the user types if continuousUpdates is true
            if (continuousUpdates) {
                setRowData(parseUserInput(e.target.value));
            }
        }, onKeyDown: (e) => {
            // Track when user presses the Esc key
            if (e.key === 'Escape') {
                asyncRef.current.escPressed = true;
            }
        } }));
});
TextComponent.displayName = 'TextComponent';
exports.textColumn = createTextColumn();
function createTextColumn({ placeholder, alignRight = false, continuousUpdates = true, deletedValue = null, parseUserInput = (value) => (value.trim() || null), formatBlurredInput = (value) => String(value !== null && value !== void 0 ? value : ''), formatInputOnFocus = (value) => String(value !== null && value !== void 0 ? value : ''), formatForCopy = (value) => String(value !== null && value !== void 0 ? value : ''), parsePastedValue = (value) => (value.replace(/[\n\r]+/g, ' ').trim() || null), InputComponent = 'input', } = {}) {
    console.log('createTextColumn');
    return {
        component: TextComponent,
        columnData: {
            placeholder,
            alignRight,
            continuousUpdates,
            formatInputOnFocus,
            formatBlurredInput,
            parseUserInput,
            InputComponent,
        },
        deleteValue: () => deletedValue,
        copyValue: ({ rowData }) => formatForCopy(rowData),
        pasteValue: ({ value }) => parsePastedValue(value),
        isCellEmpty: ({ rowData }) => rowData === null || rowData === undefined,
    };
}
//# sourceMappingURL=textColumn.js.map