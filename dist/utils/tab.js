"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTabbableElements = void 0;
const getAllTabbableElements = () => Array.from(document.querySelectorAll('*')).filter((element) => {
    return (element instanceof HTMLElement &&
        typeof element.tabIndex === 'number' &&
        element.tabIndex >= 0 &&
        !element.disabled &&
        (!(element instanceof HTMLAnchorElement) ||
            !!element.href ||
            element.getAttribute('tabIndex') !== null) &&
        getComputedStyle(element).visibility !== 'collapse');
});
exports.getAllTabbableElements = getAllTabbableElements;
//# sourceMappingURL=tab.js.map