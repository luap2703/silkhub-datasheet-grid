"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDebounceState = void 0;
const react_1 = require("react");
const throttle_debounce_1 = require("throttle-debounce");
const useDebounceState = (defaultValue, delay) => {
    const [debouncedValue, setDebouncedValue] = (0, react_1.useState)(defaultValue);
    const cancelRef = (0, react_1.useRef)(undefined);
    (0, react_1.useEffect)(() => () => { var _a; return (_a = cancelRef.current) === null || _a === void 0 ? void 0 : _a.cancel(); }, []);
    const setValue = (0, react_1.useMemo)(() => (cancelRef.current = (0, throttle_debounce_1.debounce)(delay, (newValue) => {
        setDebouncedValue(newValue);
    })), [delay]);
    return [debouncedValue, setValue];
};
exports.useDebounceState = useDebounceState;
//# sourceMappingURL=useDebounceState.js.map