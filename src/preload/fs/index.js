import { access, constants, readdirSync, createReadStream, readFile } from 'node:fs'
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
export const getMusicInfo = async (
  path,
  { lyric = false, albumPic = false } = { lyric: false, albumPic: false }
) => {
  const fileInfo = await parseNodeStream(createReadStream(path))
  const data = {
    title: fileInfo.common.title,
    year: fileInfo.common.year,
    description: fileInfo.common.comment,
    artists: fileInfo.common.artists,
    album: fileInfo.common.album,
    path
  }
  if (lyric) {
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
    data.lyricList = lyricList
  }
  if (albumPic) {
    data.albumPic = `data:${fileInfo.common.picture[0].format};base64,${Buffer.from(
      fileInfo.common.picture[0].data,
      'utf8'
    ).toString('base64')}`
  }
  return data
}
export const scanMusicByPath = async (dirPath, deep = false) => {
  const list = readdirSync(dirPath)
    .map((fileName) => ({
      fileName,
      suffix: extname(fileName).toLowerCase(),
      path: join(dirPath, fileName),
      dirPath
    }))
    .filter(({ suffix }) => musicType[suffix])
  const map = {
    length: list.length,
    items: {}
  }
  for (const item of list) {
    map.items[item.path] = {
      ...item,
      ...(await getMusicInfo(item.path))
    }
  }
  return map
}
export const getPlayUrl = async (path) => {
  return new Promise((resolve) => {
    readFile(path, (err, data) => {
      resolve(data)
    })
  })
}
