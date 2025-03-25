"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intColumn = void 0;
const textColumn_1 = require("./textColumn");
exports.intColumn = (0, textColumn_1.createTextColumn)({
    alignRight: true,
    formatBlurredInput: (value) => typeof value === 'number' ? new Intl.NumberFormat().format(value) : '',
    parseUserInput: (value) => {
        const number = parseFloat(value);
        return !isNaN(number) ? Math.round(number) : null;
    },
    parsePastedValue: (value) => {
        const number = parseFloat(value);
        return !isNaN(number) ? Math.round(number) : null;
    },
});
//# sourceMappingURL=intColumn.js.map