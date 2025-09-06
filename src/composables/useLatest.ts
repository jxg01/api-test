// src/composables/useLatest.ts
export function useLatest() {
  let ticket = 0
  function withLatest<T extends (...args:any[]) => Promise<any>>(task: T) {
    return async (...args: Parameters<T>) => {
      const my = ++ticket
      const res = await task(...args)
      // 只接受“当前最后一次触发”的结果
      if (my === ticket) return res
      // 否则丢弃
      return undefined
    }
  }
  return { withLatest }
}
