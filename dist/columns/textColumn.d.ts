import React from 'react';
import { Column } from '../types';
export type TextColumnOptions<T> = {
    placeholder?: string;
    alignRight?: boolean;
    continuousUpdates?: boolean;
    deletedValue?: T;
    parseUserInput?: (value: string) => T;
    formatBlurredInput?: (value: T) => string;
    formatInputOnFocus?: (value: T) => string;
    formatForCopy?: (value: T) => string;
    parsePastedValue?: (value: string) => T;
    InputComponent?: React.ElementType;
};
export type TextColumnData<T> = {
    placeholder?: string;
    alignRight: boolean;
    continuousUpdates: boolean;
    parseUserInput: (value: string) => T;
    formatBlurredInput: (value: T) => string;
    formatInputOnFocus: (value: T) => string;
    InputComponent: React.ElementType;
};
export declare const textColumn: Partial<Column<string | null, TextColumnData<string | null>, string>>;
export declare function createTextColumn<T = string | null>({ placeholder, alignRight, continuousUpdates, deletedValue, parseUserInput, formatBlurredInput, formatInputOnFocus, formatForCopy, parsePastedValue, InputComponent, }?: TextColumnOptions<T>): Partial<Column<T, TextColumnData<T>, string>>;
//# sourceMappingURL=textColumn.d.ts.map