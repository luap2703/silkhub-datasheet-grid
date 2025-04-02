"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDocumentEventListener = void 0;
const react_1 = require("react");
const useDocumentEventListener = (type, listener, target) => {
    (0, react_1.useEffect)(() => {
        const targetElement = (target === null || target === void 0 ? void 0 : target.current) || document;
        targetElement.addEventListener(type, listener);
        return () => {
            targetElement.removeEventListener(type, listener);
        };
    }, [listener, type]);
};
exports.useDocumentEventListener = useDocumentEventListener;
//# sourceMappingURL=useDocumentEventListener.js.map