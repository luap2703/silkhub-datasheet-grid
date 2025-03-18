import React, { useMemo } from 'react'
import cx from 'classnames'
import { SelectionContextType } from '../types'

const buildSquare = (
  top: number | string,
  right: number | string,
  bottom: number | string,
  left: number | string
) => {
  return [
    [right, top],
    [left, top],
    [left, bottom],
    [right, bottom],
    [right, top],
  ]
}

const buildThreeSidedClipPath = (
  top: number,
  right: number,
  bottom: number,
  left: number
) => {
  const buildLine = (...points: [number | string, number | string][]) => points

  const values = [
    ...buildLine([right, top], [left, top]), // Top line
    ...buildLine([left, top], [left, bottom]), // Left line
    ...buildLine([left, bottom], [right, bottom]), // Bottom line
  ]

  return `polygon(${values
    .map(
      ([x, y]) =>
        `${typeof x === 'number' ? x + 'px' : x} ${
          typeof y === 'number' ? y + 'px' : y
        }`
    )
    .join(', ')})`
}

const buildClipPath = (
  top: number,
  right: number,
  bottom: number,
  left: number
) => {
  const values = [
    ...buildSquare(0, '100%', '100%', 0),
    ...buildSquare(top, right, bottom, left),
  ]

  return `polygon(evenodd, ${values
    .map((pair) =>
      pair
        .map((value) =>
          typeof value === 'number' && value !== 0 ? value + 'px' : value
        )
        .join(' ')
    )
    .join(',')})`
}

export const SelectionRect = React.memo<SelectionContextType>(
  ({
    columnWidths,
    columnRights,
    headerRowHeight,
    selection,
    rowHeight,
    activeCell,
    hasStickyRightColumn,
    dataLength,
    viewWidth,
    viewHeight,
    contentWidth,
    edges,
    isCellDisabled,
    isCellInteractive,
    editing,
    expandSelection,
    getStickyColumnWidth,
    getStickyColumnMaxIndex,
  }) => {
    const activeCellIsDisabled = activeCell ? isCellDisabled(activeCell) : false
    const activeCellIsInteractive = activeCell
      ? isCellInteractive(activeCell)
      : false

    const selectionIsDisabled = useMemo(() => {
      if (!selection) {
        return activeCellIsDisabled
      }

      for (let col = selection.min.col; col <= selection.max.col; ++col) {
        for (let row = selection.min.row; row <= selection.max.row; ++row) {
          if (!isCellDisabled({ col, row })) {
            return false
          }
        }
      }

      return true
    }, [activeCellIsDisabled, isCellDisabled, selection])

    // If a sticky Column is in selection, we have to increase z-index
    const isStickySelected = useMemo(() => {
      if (!columnWidths || (!selection && !activeCell)) return false

      const maxStickyLeft = getStickyColumnMaxIndex('left') ?? 0
      const maxStickyRight =
        getStickyColumnMaxIndex('right') ?? columnWidths.length ?? 0 - 1

      const cells = selection
        ? [selection.min, selection.max]
        : activeCell
        ? [activeCell]
        : []

      const minCol = Math.min(...cells.map((cell) => cell.col))
      const maxCol = Math.max(...cells.map((cell) => cell.col))

      const isLeftSticky = minCol + 1 <= maxStickyLeft
      const isRightSticky = maxCol - 1 >= maxStickyRight

      // Check if the MAX column is also sticky (left or right)
      const maxIsAlsoLeft = maxCol + 1 <= maxStickyLeft
      const maxIsAlsoRight = maxCol - 1 >= maxStickyRight

      if (isLeftSticky || isRightSticky) {
        return {
          left: isLeftSticky,
          right: isRightSticky,
          exclusively:
            maxIsAlsoLeft === isLeftSticky && maxIsAlsoRight === isRightSticky,
        }
      }

      return false
    }, [columnWidths, selection, activeCell, getStickyColumnMaxIndex])

    const isActiveCellSticky = useMemo(() => {
      if (!activeCell) return false

      const maxStickyLeft = getStickyColumnMaxIndex('left') ?? 0
      const maxStickyRight =
        getStickyColumnMaxIndex('right') ?? (columnWidths?.length ?? 0) - 1

      return (
        activeCell.col + 1 <= maxStickyLeft ||
        activeCell.col - 1 >= maxStickyRight
      )
    }, [activeCell, columnWidths?.length, getStickyColumnMaxIndex])

    if (!columnWidths || !columnRights) {
      return null
    }

    const extraPixelV = (rowI: number): number => {
      return rowI < dataLength - 1 ? 1 : 0
    }

    const extraPixelH = (colI: number): number => {
      return colI < columnWidths.length - (hasStickyRightColumn ? 3 : 2) ? 1 : 0
    }

    const activeCellRect = activeCell && {
      width: columnWidths[activeCell.col + 1] + extraPixelH(activeCell.col),
      height: rowHeight(activeCell.row).height + extraPixelV(activeCell.row),
      left: columnRights[activeCell.col],
      top: rowHeight(activeCell.row).top + headerRowHeight,
    }

    const selectionRect = selection && {
      width:
        columnWidths
          .slice(selection.min.col + 1, selection.max.col + 2)
          .reduce((a, b) => a + b) + extraPixelH(selection.max.col),
      height:
        rowHeight(selection.max.row).top +
        rowHeight(selection.max.row).height -
        rowHeight(selection.min.row).top +
        extraPixelV(selection.max.row),
      left: columnRights[selection.min.col],
      top: rowHeight(selection.min.row).top + headerRowHeight,
    }

    /**
     * When using sticky columns, we need to create separate selection rects for the sticky columns.
     * This is bc the normal selection lays between z-index 20, while sticky columns are z-index 30.
     * We can't change z-indexes, as selection is scrolling as well, so we need to imiate a non-scrolling
     * selection for the sticky columns.
     */
    const stickyLeftSelectionRect =
      selectionRect &&
      isStickySelected &&
      isStickySelected.left &&
      !isStickySelected.exclusively
        ? {
            ...selectionRect,
            width:
              getStickyColumnWidth('left') -
              columnWidths
                .slice(0, selection.min.col + 1)
                .reduce((a, b) => a + b),
          }
        : null

    const stickyRightSelectionRect =
      selectionRect &&
      isStickySelected &&
      isStickySelected.right &&
      !isStickySelected.exclusively
        ? {
            ...selectionRect,
            left: getStickyColumnWidth('right'),
            width:
              columnRights[selection.max.col] - getStickyColumnWidth('right'),
          }
        : null

    const minSelection = selection?.min || activeCell
    const maxSelection = selection?.max || activeCell

    const expandRowsIndicator = maxSelection &&
      expandSelection !== null && {
        left:
          columnRights[maxSelection.col] + columnWidths[maxSelection.col + 1],
        top:
          rowHeight(maxSelection.row).top +
          rowHeight(maxSelection.row).height +
          headerRowHeight,
        transform: `translate(-${
          maxSelection.col <
          columnWidths.length - (hasStickyRightColumn ? 3 : 2)
            ? 50
            : 100
        }%, -${maxSelection.row < dataLength - 1 ? 50 : 100}%)`,
      }

    const expandRowsRect = minSelection &&
      maxSelection &&
      expandSelection !== null && {
        width:
          columnWidths
            .slice(minSelection.col + 1, maxSelection.col + 2)
            .reduce((a, b) => a + b) + extraPixelH(maxSelection.col),
        height:
          rowHeight(maxSelection.row + expandSelection).top +
          rowHeight(maxSelection.row + expandSelection).height -
          rowHeight(maxSelection.row + 1).top +
          extraPixelV(maxSelection.row + expandSelection) -
          1,
        left: columnRights[minSelection.col],
        top:
          rowHeight(maxSelection.row).top +
          rowHeight(maxSelection.row).height +
          headerRowHeight +
          1,
      }

    return (
      <>
        <div
          className="dsg-scrollable-view-container"
          style={{
            height:
              rowHeight(dataLength - 1).top +
              rowHeight(dataLength - 1).height +
              headerRowHeight,
            width: contentWidth ? contentWidth : '100%',
          }}
        >
          <div
            className={cx({
              'dsg-scrollable-view': true,
              'dsg-scrollable-view-t': !edges.top,
              'dsg-scrollable-view-r': !edges.right,
              'dsg-scrollable-view-b': !edges.bottom,
              'dsg-scrollable-view-l': !edges.left,
            })}
            style={{
              top: headerRowHeight,
              left: columnWidths[0],
              height: viewHeight ? viewHeight - headerRowHeight : 0,
              width:
                contentWidth && viewWidth
                  ? viewWidth -
                    columnWidths[0] -
                    (hasStickyRightColumn
                      ? columnWidths[columnWidths.length - 1]
                      : 0)
                  : `calc(100% - ${
                      columnWidths[0] +
                      (hasStickyRightColumn
                        ? columnWidths[columnWidths.length - 1]
                        : 0)
                    }px)`,
            }}
          />
        </div>
        {(selectionRect || activeCellRect) && (
          <div
            className="dsg-selection-col-marker-container"
            style={{
              left: selectionRect?.left ?? activeCellRect?.left,
              width: selectionRect?.width ?? activeCellRect?.width,
              height:
                rowHeight(dataLength - 1).top +
                rowHeight(dataLength - 1).height +
                headerRowHeight,
            }}
          >
            <div
              className={cx(
                'dsg-selection-col-marker',
                selectionIsDisabled && 'dsg-selection-col-marker-disabled'
              )}
              style={{ top: headerRowHeight }}
            />
          </div>
        )}
        {(selectionRect || activeCellRect) && (
          <div
            className="dsg-selection-row-marker-container"
            style={{
              top: selectionRect?.top ?? activeCellRect?.top,
              height: selectionRect?.height ?? activeCellRect?.height,
              width: contentWidth ? contentWidth : '100%',
            }}
          >
            <div
              className={cx(
                'dsg-selection-row-marker',
                selectionIsDisabled && 'dsg-selection-row-marker-disabled'
              )}
              style={{ left: columnWidths[0] }}
            />
          </div>
        )}
        {activeCellRect && activeCell && (
          <div
            className={cx('dsg-active-cell', {
              'dsg-active-cell-focus': editing,
              'dsg-active-cell-disabled': activeCellIsDisabled,
              'dsg-active-cell-passive': !activeCellIsInteractive,
            })}
            style={{
              ...activeCellRect,
              zIndex: isActiveCellSticky ? 31 : undefined,
            }}
          />
        )}
        {selectionRect && activeCellRect && (
          <div
            className={cx(
              'dsg-selection-rect',
              selectionIsDisabled && 'dsg-selection-rect-disabled'
            )}
            style={{
              ...selectionRect,
              zIndex:
                isStickySelected && isStickySelected.exclusively
                  ? 30
                  : undefined,
              clipPath: buildClipPath(
                activeCellRect.top - selectionRect.top,
                activeCellRect.left - selectionRect.left,
                activeCellRect.top + activeCellRect.height - selectionRect.top,
                activeCellRect.left + activeCellRect.width - selectionRect.left
              ),
            }}
          />
        )}

        <div
          className="dsg-selection-rect-sticky-container dsg-selection-rect-sticky-container-left"
          style={{
            height: selectionRect?.height ?? activeCellRect?.height,
            width: contentWidth ? contentWidth : '100%',
          }}
        >
          {stickyLeftSelectionRect && activeCellRect && selectionRect && (
            <div
              className={cx(
                'dsg-selection-rect',
                'dsg-selection-rect-sticky',
                'dsg-selection-rect-left-sticky',
                selectionIsDisabled && 'dsg-selection-rect-disabled'
              )}
              style={{
                ...stickyLeftSelectionRect,
                top: undefined,
                // Using marginTop here instead of top: value on container. This is necessary to make the animation (when selection from bottom => top) smooth,
                // Bc it would otherwise jump to the top of the container and then animate downwards, which looks weird
                marginTop: stickyLeftSelectionRect.top - headerRowHeight,
                clipPath: isActiveCellSticky
                  ? buildClipPath(
                      activeCellRect.top - selectionRect.top,
                      activeCellRect.left - selectionRect.left,
                      activeCellRect.top +
                        activeCellRect.height -
                        selectionRect.top,
                      activeCellRect.left +
                        activeCellRect.width -
                        selectionRect.left
                    )
                  : undefined,
              }}
            />
          )}
        </div>

        <div
          className="dsg-selection-rect-sticky-container dsg-selection-rect-sticky-container-right"
          style={{
            height: selectionRect?.height ?? activeCellRect?.height,
            width: contentWidth ? contentWidth : '100%',
          }}
        >
          {stickyRightSelectionRect && activeCellRect && selectionRect && (
            <div
              className={cx(
                'dsg-selection-rect',
                'dsg-selection-rect-sticky',
                'dsg-selection-rect-right-sticky',
                selectionIsDisabled && 'dsg-selection-rect-disabled'
              )}
              style={{
                ...stickyRightSelectionRect,
                top: undefined,
                // See reason for this above above
                marginTop: stickyRightSelectionRect.top - headerRowHeight,
                clipPath: isActiveCellSticky
                  ? buildClipPath(
                      activeCellRect.top - selectionRect.top,
                      activeCellRect.left - selectionRect.left,
                      activeCellRect.top +
                        activeCellRect.height -
                        selectionRect.top,
                      activeCellRect.left +
                        activeCellRect.width -
                        selectionRect.left
                    )
                  : undefined,
              }}
            />
          )}
        </div>

        {expandRowsRect && (
          <div className={cx('dsg-expand-rows-rect')} style={expandRowsRect} />
        )}
        {expandRowsIndicator && (
          <div
            className={cx(
              'dsg-expand-rows-indicator',
              selectionIsDisabled && 'dsg-expand-rows-indicator-disabled'
            )}
            style={expandRowsIndicator}
          />
        )}
      </>
    )
  }
)

SelectionRect.displayName = 'SelectionRect'
