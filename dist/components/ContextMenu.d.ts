import * as React from 'react';
import { FC, type JSX } from 'react';
import { ContextMenuItem, ContextMenuComponentProps } from '../types';
export declare const defaultRenderItem: (item: ContextMenuItem) => JSX.Element;
export declare const createContextMenuComponent: (renderItem?: (item: ContextMenuItem) => JSX.Element) => FC<ContextMenuComponentProps>;
export declare const ContextMenu: React.FC<ContextMenuComponentProps>;
//# sourceMappingURL=ContextMenu.d.ts.map