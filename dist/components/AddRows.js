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
exports.AddRows = exports.createAddRowsComponent = void 0;
const react_1 = __importStar(require("react"));
const createAddRowsComponent = (translationKeys = {}) => 
// eslint-disable-next-line react/display-name
({ addRows }) => {
    var _a, _b;
    const [value, setValue] = (0, react_1.useState)(1);
    const [rawValue, setRawValue] = (0, react_1.useState)(String(value));
    return (react_1.default.createElement("div", { className: "dsg-add-row" },
        react_1.default.createElement("button", { type: "button", className: "dsg-add-row-btn", onClick: () => addRows(value) }, (_a = translationKeys.button) !== null && _a !== void 0 ? _a : 'Add'),
        ' ',
        react_1.default.createElement("input", { className: "dsg-add-row-input", value: rawValue, onBlur: () => setRawValue(String(value)), type: "number", min: 1, onChange: (e) => {
                setRawValue(e.target.value);
                setValue(Math.max(1, Math.round(parseInt(e.target.value) || 0)));
            }, onKeyDown: (event) => {
                if (event.key === 'Enter') {
                    addRows(value);
                }
            } }),
        ' ', (_b = translationKeys.unit) !== null && _b !== void 0 ? _b : 'rows'));
};
exports.createAddRowsComponent = createAddRowsComponent;
exports.AddRows = (0, exports.createAddRowsComponent)();
exports.AddRows.displayName = 'AddRows';
//# sourceMappingURL=AddRows.js.map