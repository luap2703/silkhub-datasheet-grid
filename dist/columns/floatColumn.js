"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.floatColumn = void 0;
const textColumn_1 = require("./textColumn");
exports.floatColumn = (0, textColumn_1.createTextColumn)({
    alignRight: true,
    formatBlurredInput: (value) => typeof value === 'number' ? new Intl.NumberFormat().format(value) : '',
    parseUserInput: (value) => {
        const number = parseFloat(value);
        return !isNaN(number) ? number : null;
    },
    parsePastedValue: (value) => {
        const number = parseFloat(value);
        return !isNaN(number) ? number : null;
    },
});
//# sourceMappingURL=floatColumn.js.map