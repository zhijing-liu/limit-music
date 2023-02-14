import express from 'express'
import ip from 'ip'
import net from 'node:net'
const map = {
  key: {},
  path: {}
}
const portIsNotUse = async (port) => {
  return new Promise((resolve, reject) => {
    const s = net
      .createServer()
      .on('error', (e) => resolve(false))
      .on('listening', (e) => {
        s.close()
        resolve(true)
      })
      .listen(port, '::')
  })
}
class Serve {
  app
  running = false
  serve
  constructor() {
    this.app = express()
    this.app.get('/getMusic/:key/:name', (req, res) => {
      if (map.key[req.params.key]) {
        res.sendFile(map.key[req.params.key])
      } else {
        res.status(404).send('未找到文件')
      }
    })
  }

  async start({ port }) {
    if (this.running) {
      this.close()
    }
    return new Promise((resolve, reject) => {
      this.running = true
      portIsNotUse(port).then((r) => {
        if (r) {
          this.serve = this.app.listen(port, '::', () => {
            this.running = true
            resolve(this.serve)
          })
        } else {
          this.running = false
          reject(Error(`端口 ${port} 被占用`))
        }
      })
    })
  }

  close() {
    this.serve?.close()
    this.running = false
  }
}
const serveIns = new Serve()
const createKeyPath = (path) => {
  const key = Math.ceil(Math.random() * 1000000000).toString()
  map.path[path] = key
  map.key[key] = path
  return key
}
export const setServerStart = (config) => {
  return serveIns.start(config)
}
export const setServerClose = () => {
  return serveIns.close()
}
export const getFileKey = (path) => {
  return map.key[path] ?? createKeyPath(path)
}

export const getIp = () => {
  return ip.address()
}
