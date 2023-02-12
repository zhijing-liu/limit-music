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
export const confirmFileAccess = (pathList) => {
  return Promise.all(pathList.map((path) => getAccess(path)))
}
export const getDirAccessibility = (list) => {
  return Promise.all(list.map(getAccess))
}
const musicType = {
  '.mp3': true,
  '.flac': true,
  '.wav': true,
  '.m4a': true
}
export const getMusicInfo = async (
  path,
  { lyric = false, albumPic = false } = { lyric: false, albumPic: false }
) => {
  const stream = createReadStream(path)
  const fileInfo = await parseNodeStream(stream)
  stream.close()
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
const getMusic = (dirPath, deep) => {
  let fileList
  try {
    fileList = readdirSync(dirPath, { withFileTypes: true })
  } catch (e) {
    fileList = []
  }
  let list = []
  for (const dirent of fileList) {
    if (dirent.isDirectory()) {
      if (deep) {
        list = [...list, ...getMusic(join(dirPath, dirent.name), true)]
      }
    } else {
      const suffix = extname(dirent.name).toLowerCase()
      if (musicType[suffix]) {
        list.push({
          fileName: dirent.name,
          suffix,
          path: join(dirPath, dirent.name),
          dirPath
        })
      }
    }
  }
  return list
}
export const scanMusicByPath = async (dirPath, deep = false) => {
  const list = getMusic(dirPath, deep)
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
