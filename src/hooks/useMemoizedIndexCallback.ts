import { useMemo } from 'react'

export const useMemoizedIndexCallback = <T extends Array<any>>(
  callbackFn: (index: number, ...args: T) => void,
  argsLength: number
) => {
  return useMemo(() => {
    const cache = new Map<number, (...args: T) => void>()

    return (index: number) => {
      if (!cache.has(index)) {
        cache.set(index, (...args) => {
          callbackFn(index, ...(args.slice(0, argsLength) as T))
        })
      }

      return cache.get(index) as (...args: T) => void
    }
  }, [argsLength, callbackFn])
}

export const useMemoizedDoubleIndexCallback = <T extends Array<any>>(
  callbackFn: (index: React.Key, index2: React.Key, ...args: T) => void,
  argsLength: number
) => {
  return useMemo(() => {
    const cache = new Map<React.Key, Map<React.Key, (...args: T) => void>>()

    return (index: React.Key, index2: React.Key) => {
      if (!cache.has(index)) {
        cache.set(index, new Map())
      }

      const innerCache = cache.get(index) as Map<
        React.Key,
        (...args: T) => void
      >

      if (!innerCache.has(index2)) {
        innerCache.set(index2, (...args) => {
          callbackFn(index, index2, ...(args.slice(0, argsLength) as T))
        })
      }

      return innerCache.get(index2) as (...args: T) => void
    }
  }, [argsLength, callbackFn])
}
