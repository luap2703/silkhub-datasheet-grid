"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDeepEqualState = void 0;
const react_1 = require("react");
const fast_deep_equal_1 = __importDefault(require("fast-deep-equal"));
const useDeepEqualState = (defaultValue) => {
    const [value, setValue] = (0, react_1.useState)(defaultValue);
    const customSetValue = (0, react_1.useCallback)((newValue) => {
        setValue((prevValue) => {
            const nextValue = typeof newValue === 'function'
                ? newValue(prevValue)
                : newValue;
            return (0, fast_deep_equal_1.default)(nextValue, prevValue) ? prevValue : nextValue;
        });
    }, []);
    return [value, customSetValue];
};
exports.useDeepEqualState = useDeepEqualState;
//# sourceMappingURL=useDeepEqualState.js.map