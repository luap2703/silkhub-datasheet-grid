import React, { CSSProperties, FC } from 'react'
import cx from 'classnames'

export const Cell: FC<{
  gutter: boolean
  stickyRight: boolean
  stickyLeft: boolean
  disabled?: boolean
  className?: string
  active?: boolean
  children?: any
  width: number
  left: number
  padding?: boolean
  style?: CSSProperties
}> = ({
  children,
  gutter,
  stickyRight,
  stickyLeft,
  active,
  disabled,
  className,
  width,
  left,
  padding,
  style,
}) => {
  return (
    <div
      className={cx(
        'dsg-cell',
        'group/cell',
        gutter && 'dsg-cell-gutter',
        disabled && 'dsg-cell-disabled',
        gutter && active && 'dsg-cell-gutter-active',
        stickyRight && 'dsg-cell-sticky-right',
        stickyLeft && 'dsg-cell-sticky-left',
        padding && 'dsg-cell-padding',
        className
      )}
      style={{
        ...style,
        width,
        left: stickyRight ? undefined : left,
      }}
    >
      {children}
    </div>
  )
}
