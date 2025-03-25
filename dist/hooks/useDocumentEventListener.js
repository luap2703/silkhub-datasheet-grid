"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDocumentEventListener = void 0;
const react_1 = require("react");
const useDocumentEventListener = (type, listener) => {
    (0, react_1.useEffect)(() => {
        document.addEventListener(type, listener);
        return () => {
            document.removeEventListener(type, listener);
        };
    }, [listener, type]);
};
exports.useDocumentEventListener = useDocumentEventListener;
//# sourceMappingURL=useDocumentEventListener.js.map