"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGetBoundingClientRect = void 0;
const react_1 = require("react");
const throttle_debounce_1 = require("throttle-debounce");
// Cache bounding rect in a ref and only recompute every <delay>ms
const useGetBoundingClientRect = (ref, delay = 200) => {
    const boundingRect = (0, react_1.useRef)(null);
    const throttledCompute = (0, react_1.useMemo)(() => (0, throttle_debounce_1.throttle)(delay, () => {
        setTimeout(() => {
            var _a;
            return (boundingRect.current =
                ((_a = ref.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect()) || null);
        }, 0);
    }), [ref, delay]);
    return (0, react_1.useCallback)((force = false) => {
        var _a;
        if (force) {
            boundingRect.current = ((_a = ref.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect()) || null;
        }
        else {
            throttledCompute();
        }
        return boundingRect.current;
    }, [ref, throttledCompute]);
};
exports.useGetBoundingClientRect = useGetBoundingClientRect;
//# sourceMappingURL=useGetBoundingClientRect.js.map