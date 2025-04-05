import { DataSheetGridProps, DataSheetGridRef, RowType } from '../types'
import { useState, type JSX } from 'react'
import { DataSheetGrid } from './DataSheetGrid'
import React from 'react'

// eslint-disable-next-line react/display-name
export const StaticDataSheetGrid = React.forwardRef<
  DataSheetGridRef,
  DataSheetGridProps<any>
>(
  <T extends RowType>(
    {
      columns,
      gutterColumn,
      addRowsComponent,
      createRow,
      duplicateRow,
      style,
      rowKey,
      onFocus,
      onBlur,
      onActiveCellChange,
      onSelectionChange,
      rowClassName,
      rowHeight,
      ...rest
    }: DataSheetGridProps<T>,
    ref: React.ForwardedRef<DataSheetGridRef>
  ) => {
    const [staticProps] = useState({
      columns,
      gutterColumn,
      addRowsComponent,
      createRow,
      duplicateRow,
      style,
      rowKey,
      onFocus,
      onBlur,
      onActiveCellChange,
      onSelectionChange,
      rowClassName,
      rowHeight,
    })

    return (
      <DataSheetGrid
        {...staticProps}
        {...rest}
        rowHeight={
          typeof rowHeight === 'number' ? rowHeight : staticProps.rowHeight
        }
        ref={ref}
      />
    )
  }
) as <T extends RowType>(
  props: DataSheetGridProps<T> & { ref?: React.ForwardedRef<DataSheetGridRef> }
) => JSX.Element
