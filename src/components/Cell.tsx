import React, { FC, useCallback } from 'react'
import cx from 'classnames'

export const Cell: FC<{
  key: React.Key
  gutter: boolean
  stickyRight: boolean
  disabled?: boolean
  className?: string
  active?: boolean
  children?: any
  width: number
  left: number
  onCellKeyDown?: (e: React.KeyboardEvent, isActive: boolean) => void
  onCellMouseDown?: (e: React.MouseEvent, isActive: boolean) => void
}> = ({
  key,
  children,
  gutter,
  stickyRight,
  active,
  disabled,
  className,
  width,
  left,
  onCellKeyDown,
  onCellMouseDown,
}) => {
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      console.log('onMouseDown', e, active, key, onCellMouseDown)
      onCellMouseDown?.(e, active ?? false)
    },
    [active, key, onCellMouseDown]
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      console.log('onKeyDown', e, active, key, onCellKeyDown)
      onCellKeyDown?.(e, active ?? false)
    },
    [active, key, onCellKeyDown]
  )
  return (
    <div
      tabIndex={-1}
      className={cx(
        'dsg-cell',
        gutter && 'dsg-cell-gutter',
        disabled && 'dsg-cell-disabled',
        gutter && active && 'dsg-cell-gutter-active',
        stickyRight && 'dsg-cell-sticky-right',
        className
      )}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
      onKeyDownCapture={onKeyDown}
      style={{
        width,
        left: stickyRight ? undefined : left,
      }}
    >
      {children}
    </div>
  )
}
