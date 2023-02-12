import express from 'express'
import ip from 'ip'
const map = {
  key: {},
  path: {}
}
const app = express()
app.get('/getMusic/:key/:name', (req, res) => {
  console.log(req.params.key)
  if (map.key[req.params.key]) {
    console.log(map.key[req.params.key])
    res.sendFile(map.key[req.params.key])
  } else {
    res.status(404).send('未找到文件')
  }
})
app.listen(3000, '::', () => {
  console.log('111')
})
const createKeyPath = (path) => {
  const key = Math.ceil(Math.random() * 1000000000).toString()
  map.path[path] = key
  map.key[key] = path
  return key
}
export const getFileKey = (path) => {
  return map.key[path] ?? createKeyPath(path)
}

export const getIp = () => {
  return ip.address()
}
