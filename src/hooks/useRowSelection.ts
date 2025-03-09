import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

export const useRowSelection = <T extends any>(
  rowSelection: string[] | undefined,
  onRowSelectionChange:
    | ((rowSelection: string[] | ((prev: string[]) => string[])) => void)
    | undefined
) => {
  const [internalSelection, setInternalSelection] = useState<string[]>([])

  const onRowSelectionChangeRef = useRef(onRowSelectionChange)

  const handleRowSelectionChange = useCallback(
    (rowId: string) => {
      if (rowSelection) {
        onRowSelectionChangeRef.current?.(
          rowSelection.includes(rowId)
            ? rowSelection.filter((id) => id !== rowId)
            : [...rowSelection, rowId]
        )
      } else {
        setInternalSelection((prev) =>
          prev.includes(rowId)
            ? prev.filter((id) => id !== rowId)
            : [...prev, rowId]
        )
      }
    },
    [rowSelection]
  )

  const selectRows = useMemo(
    () => onRowSelectionChangeRef.current ?? setInternalSelection,
    []
  )

  useEffect(() => {
    if (rowSelection) {
      setInternalSelection(rowSelection)
    }
  }, [rowSelection])

  useEffect(() => {
    if (!rowSelection) {
      onRowSelectionChangeRef.current?.(internalSelection)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalSelection])

  const selectedRows = useMemo(() => {
    // Make map for faster lookup
    const selectionMap = new Set(rowSelection ?? internalSelection)
    return selectionMap
  }, [rowSelection, internalSelection])

  return {
    selectedRows,
    handleRowSelection: handleRowSelectionChange,
    selectRows,
  }
}
