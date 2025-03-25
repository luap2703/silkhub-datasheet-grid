"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEdges = void 0;
const react_1 = require("react");
const throttle_debounce_1 = require("throttle-debounce");
const useDeepEqualState_1 = require("./useDeepEqualState");
const useEdges = (ref, width, height) => {
    const [edges, setEdges] = (0, useDeepEqualState_1.useDeepEqualState)({
        top: true,
        right: true,
        bottom: true,
        left: true,
    });
    (0, react_1.useEffect)(() => {
        const onScroll = (0, throttle_debounce_1.throttle)(100, () => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            setEdges({
                top: ((_a = ref.current) === null || _a === void 0 ? void 0 : _a.scrollTop) === 0,
                right: ((_c = (_b = ref.current) === null || _b === void 0 ? void 0 : _b.scrollLeft) !== null && _c !== void 0 ? _c : 0) >=
                    ((_e = (_d = ref.current) === null || _d === void 0 ? void 0 : _d.scrollWidth) !== null && _e !== void 0 ? _e : 0) - (width !== null && width !== void 0 ? width : 0) - 1,
                bottom: ((_g = (_f = ref.current) === null || _f === void 0 ? void 0 : _f.scrollTop) !== null && _g !== void 0 ? _g : 0) >=
                    ((_j = (_h = ref.current) === null || _h === void 0 ? void 0 : _h.scrollHeight) !== null && _j !== void 0 ? _j : 0) - (height !== null && height !== void 0 ? height : 0) - 1,
                left: ((_k = ref.current) === null || _k === void 0 ? void 0 : _k.scrollLeft) === 0,
            });
        });
        const current = ref.current;
        current === null || current === void 0 ? void 0 : current.addEventListener('scroll', onScroll);
        setTimeout(onScroll, 100);
        return () => {
            current === null || current === void 0 ? void 0 : current.removeEventListener('scroll', onScroll);
            onScroll.cancel();
        };
    }, [height, width, ref, setEdges]);
    return edges;
};
exports.useEdges = useEdges;
//# sourceMappingURL=useEdges.js.map