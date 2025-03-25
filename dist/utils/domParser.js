"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDom = void 0;
const parser = typeof DOMParser !== 'undefined'
    ? new DOMParser()
    : { parseFromString: () => null };
const parseDom = (html) => {
    return parser.parseFromString(html, 'text/html');
};
exports.parseDom = parseDom;
//# sourceMappingURL=domParser.js.map