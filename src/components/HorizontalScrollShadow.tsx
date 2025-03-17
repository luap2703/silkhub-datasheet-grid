import React, { useMemo } from 'react'

export const HorizontalScrollShadow = ({
  hasStickyLeftColumn,
  isHorizontallyScrolled,
  getStickyColumnWidth,
  headerHeight,
}: {
  hasStickyLeftColumn: boolean
  isHorizontallyScrolled: boolean
  getStickyColumnWidth: (side: 'left' | 'right') => number
  headerHeight: number
}) => {
  const left = useMemo(() => {
    return hasStickyLeftColumn ? getStickyColumnWidth('left') : 0
  }, [hasStickyLeftColumn, getStickyColumnWidth])

  return (
    <div
      className="dsg-sticky-column-shadow"
      style={{
        opacity: !!hasStickyLeftColumn && isHorizontallyScrolled ? 100 : 0,

        height: `calc(100% - ${headerHeight}px)`,
        //  marginTop: -headerHeight,

        left: left,
      }}
    />
  )
}
