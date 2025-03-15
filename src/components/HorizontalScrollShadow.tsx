import React, { useMemo } from 'react'

export const HorizontalScrollShadow = ({
  hasStickyLeftColumn,
  isHorizontallyScrolled,
  getStickyLeftColumnWidth,
  displayHeight,
  headerHeight,
}: {
  hasStickyLeftColumn: boolean
  isHorizontallyScrolled: boolean
  getStickyLeftColumnWidth: () => number
  displayHeight: number
  headerHeight: number
}) => {
  const left = useMemo(() => {
    return hasStickyLeftColumn ? getStickyLeftColumnWidth() : 0
  }, [hasStickyLeftColumn, getStickyLeftColumnWidth])

  return (
    <div
      className="transition-shadow duration-200 dsg-horizontal-scroll-shadow"
      style={{
        opacity: !!hasStickyLeftColumn && isHorizontallyScrolled ? 100 : 0,
        width: 1,
        top: 0,
        backgroundColor: 'transparent',
        color: 'transparent',
        bottom: 0,
        height: displayHeight - headerHeight,
        zIndex: 25,
        position: 'sticky',
        left: left + 1,
        boxShadow: 'rgba(35, 37, 41, 0.12) 6px 0px 16px 2px',
        clipPath: 'inset(0px -36px 0px 0px)',
        marginLeft: -1,
      }}
    />
  )
}
