import { RefObject, useEffect } from 'react'

export const useDocumentEventListener = (
  type: string,
  listener: (...args: any[]) => void,
  target?: RefObject<HTMLElement | null> | null
) => {
  useEffect(() => {
    const targetElement = target?.current || document
    targetElement.addEventListener(type, listener)

    return () => {
      targetElement.removeEventListener(type, listener)
    }
  }, [listener, type])
}
