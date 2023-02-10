import { access, constants, readdirSync, createReadStream } from 'node:fs'
import { extname, join } from 'node:path'
import { parseNodeStream } from 'music-metadata-browser'

const getAccess = async (path) => {
  return new Promise((resolve) => {
    access(path, constants.R_OK | constants.W_OK, (err) =>
      resolve({
        path,
        access: !err
      })
    )
  })
}
export const getDirAccessibility = (list) => {
  return Promise.all(list.map(getAccess))
}
const musicType = {
  '.mp3': true,
  '.flac': true,
  '.wav': true
}
export const scanMusicByPath = async (dirPath, deep = false) => {
  const list = readdirSync(dirPath)
    .map((name) => ({
      name,
      suffix: extname(name),
      path: join(dirPath, name)
    }))
    .filter(({ suffix }) => musicType[suffix])
  for (const item of list) {
    const fileInfo = await parseNodeStream(createReadStream(item.path))
    const lyricList = []
    if (fileInfo.common.lyrics) {
      for (const lyrics of fileInfo.common.lyrics) {
        for (const item of lyrics.split('\n')) {
          const timeSet = item.match(/\[(.*?)]/)?.[0] ?? '[00:00.00]'
          const lyric = item.replace(timeSet, '')
          const time = timeSet.replace(/[[\]]/g, '').split(/[:.]/)
          const step = +time[0] * 60 * 1000 + +time[1] * 1000 + +time[2]
          if (isNaN(step)) {
            lyricList.push({
              time: 0,
              lyric: time.join('')
            })
          } else {
            lyricList.push({
              time: step,
              lyric
            })
          }
        }
      }
    } else {
      lyricList.push({
        time: 0,
        lyric: '无歌词'
      })
    }
    item.musicInfo = {
      year: fileInfo.common.year,
      description: fileInfo.common.comment,
      artists: fileInfo.common.artists,
      album: fileInfo.common.album,
      lyricList,
      albumPic: `data:${fileInfo.common.picture[0].format};base64,${Buffer.from(
        fileInfo.common.picture[0].data,
        'utf8'
      ).toString('base64')}`
    }
  }
  return list
}
