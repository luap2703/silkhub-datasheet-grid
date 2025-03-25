"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrintableUnicode = exports.encodeHtml = exports.parseTextPlainData = exports.parseTextHtmlData = void 0;
const domParser_1 = require("./domParser");
const parseTextHtmlData = (data) => {
    var _a, _b;
    const doc = (0, domParser_1.parseDom)(data.replace(/<br\/?>/g, '\n'));
    const table = doc.getElementsByTagName('table')[0];
    if (table) {
        const rows = [];
        for (let i = 0; i < table.rows.length; i++) {
            const row = [];
            rows.push(row);
            for (let j = 0; j < table.rows[i].cells.length; j++) {
                row.push((_a = table.rows[i].cells[j].textContent) !== null && _a !== void 0 ? _a : '');
            }
        }
        return rows;
    }
    const span = doc.getElementsByTagName('span')[0];
    if (span) {
        return [[(_b = span.textContent) !== null && _b !== void 0 ? _b : '']];
    }
    return [['']];
};
exports.parseTextHtmlData = parseTextHtmlData;
const parseTextPlainData = (data) => {
    const cleanData = data.replace(/\r|\n$/g, '');
    const output = [[]];
    let cursor = 0;
    let startCell = 0;
    let quoted = false;
    let lastRowIndex = 0;
    const saveCell = () => {
        let str = cleanData.slice(startCell, cursor);
        if (str[0] === '"' && str[str.length - 1] === '"') {
            quoted = true;
        }
        if (quoted && str[str.length - 1] === '"' && str.includes('\n')) {
            str = str.slice(1, str.length - 1).replace(/""/g, '"');
            quoted = false;
        }
        if (quoted && str[str.length - 1] !== '"') {
            str.split('\n').forEach((cell, i, { length }) => {
                output[lastRowIndex].push(cell);
                if (i < length - 1) {
                    output.push([]);
                    lastRowIndex++;
                }
            });
        }
        else {
            output[lastRowIndex].push(str);
        }
    };
    while (cursor < cleanData.length) {
        if (quoted &&
            cleanData[cursor] === '"' &&
            ![undefined, '\t', '"'].includes(cleanData[cursor + 1])) {
            quoted = false;
        }
        if (quoted && cleanData[cursor] === '"' && cleanData[cursor + 1] === '"') {
            cursor++;
        }
        if (cursor === startCell && cleanData[cursor] === '"') {
            quoted = true;
        }
        if (cleanData[cursor] === '\t') {
            saveCell();
            startCell = cursor + 1;
            quoted = false;
        }
        if (cleanData[cursor] === '\n' && !quoted) {
            saveCell();
            output.push([]);
            startCell = cursor + 1;
            lastRowIndex++;
        }
        cursor++;
    }
    saveCell();
    return output;
};
exports.parseTextPlainData = parseTextPlainData;
const encodeHtml = (str) => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};
exports.encodeHtml = encodeHtml;
const isPrintableUnicode = (str) => {
    return str.match(/^[^\x00-\x20\x7F-\x9F]$/) !== null;
};
exports.isPrintableUnicode = isPrintableUnicode;
//# sourceMappingURL=copyPasting.js.map