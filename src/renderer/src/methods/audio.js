import { nextTick } from 'vue'

export const scanByPathList = async (list, start, end) => {
  return new Promise((resolve) => {
    if (list.length > 0) {
      const result = {}
      let i = 0
      const getData = () => {
        const path = list[i].path
        start?.(path)
        i++
        window.underlying.scanMusicByPath(path).then((r) => {
          result[path] = r
          if (list.length !== i) {
            nextTick(() => {
              getData()
            })
          } else {
            end?.(path)
            resolve(result)
          }
        })
      }
      getData()
    }
  })
}
