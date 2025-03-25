"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMemoizedDoubleIndexCallback = exports.useMemoizedIndexCallback = void 0;
const react_1 = require("react");
const useMemoizedIndexCallback = (callbackFn, argsLength) => {
    return (0, react_1.useMemo)(() => {
        const cache = new Map();
        return (index) => {
            if (!cache.has(index)) {
                cache.set(index, (...args) => {
                    callbackFn(index, ...args.slice(0, argsLength));
                });
            }
            return cache.get(index);
        };
    }, [argsLength, callbackFn]);
};
exports.useMemoizedIndexCallback = useMemoizedIndexCallback;
const useMemoizedDoubleIndexCallback = (callbackFn, argsLength) => {
    return (0, react_1.useMemo)(() => {
        const cache = new Map();
        return (index, index2) => {
            if (!cache.has(index)) {
                cache.set(index, new Map());
            }
            const innerCache = cache.get(index);
            if (!innerCache.has(index2)) {
                innerCache.set(index2, (...args) => {
                    callbackFn(index, index2, ...args.slice(0, argsLength));
                });
            }
            return innerCache.get(index2);
        };
    }, [argsLength, callbackFn]);
};
exports.useMemoizedDoubleIndexCallback = useMemoizedDoubleIndexCallback;
//# sourceMappingURL=useMemoizedIndexCallback.js.map