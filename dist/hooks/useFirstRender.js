"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFirstRender = void 0;
const react_1 = require("react");
const useFirstRender = () => {
    const firstRenderRef = (0, react_1.useRef)(true);
    const firstRender = firstRenderRef.current;
    firstRenderRef.current = false;
    return firstRender;
};
exports.useFirstRender = useFirstRender;
//# sourceMappingURL=useFirstRender.js.map