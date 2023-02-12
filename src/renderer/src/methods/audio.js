import { nextTick } from 'vue'
import { settingStore } from '@/store'

export const scanByPathList = async (list, start, end) => {
  return new Promise((resolve) => {
    if (list.length > 0) {
      const result = {}
      let i = 0
      const getData = () => {
        const path = list[i].path
        start?.(path)
        i++
        window.underlying.scanMusicByPath(path, settingStore().deepScan).then((r) => {
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
