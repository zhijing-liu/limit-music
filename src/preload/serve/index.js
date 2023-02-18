import express from 'express'
import bodyParser from 'body-parser'
import ip from 'ip'
import { createSocket, update } from './socket.js'
import net from 'node:net'
import { join } from 'node:path'
import { accessSync, statSync } from 'node:fs'
import { createProxyMiddleware } from 'http-proxy-middleware'

const map = {
  key: {},
  path: {}
}
const portIsNotUse = async (port) => {
  return new Promise((resolve, reject) => {
    const s = net
      .createServer()
      .on('error', (e) => reject(e))
      .on('listening', (e) => {
        s.close()
        resolve(true)
      })
      .listen(port, '::')
  })
}
class ShareServe {
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
      portIsNotUse(port)
        .then((r) => {
          this.serve = this.app.listen(port, '::', () => {
            this.running = true
            resolve(this.serve)
          })
        })
        .catch(() => {
          this.running = false
          reject(Error(`端口 ${port} 被占用`))
        })
    })
  }

  close() {
    this.serve?.close()
    this.running = false
  }
}
const shareServeIns = new ShareServe()
const createKeyPath = (path) => {
  const key = Math.ceil(Math.random() * 1000000000).toString()
  map.path[path] = key
  map.key[key] = path
  return key
}
export const setShareServerStart = (config) => {
  return shareServeIns.start(config)
}
export const setShareServerClose = () => {
  return shareServeIns.close()
}
export const getFileKey = (path) => {
  return map.key[path] ?? createKeyPath(path)
}

export const getIp = () => {
  return ip.address()
}
// 远程控制
let controllerServerIns
class ControllerServer {
  app
  controller
  server
  socketServer
  constructor(controller, { port, socketPort }) {
    this.controller = controller
    this.app = express()
    this.app.use(bodyParser.json())
    this.app.get('/controller/?*', (req, res) => {
      const url = join(__dirname, '../../public/static', req.params[0])
      if (statSync(url).isFile()) {
        try {
          accessSync(url)
          res.sendFile(url)
        } catch (e) {
          res.sendFile(join(__dirname, '../../public/static', 'index.html'))
        }
      } else {
        res.sendFile(join(__dirname, '../../public/static', 'index.html'))
      }
    })
    this.app.post('/action', async (req, res) => {
      const { action } = req.body
      const result = await controller[action]?.()
      res.send({
        implement: true,
        result
      })
    })
    this.app.use(
      '/socket.io',
      createProxyMiddleware({
        target: `http://127.0.0.1:${socketPort}`, // 目标主机
        changeOrigin: true, // 需要虚拟主机站点
        ws: true // 是否代理websocket
      })
    )
    createSocket(this.app, socketPort).then((socketServer) => {
      this.socketServer = socketServer
    })

    this.server = this.app.listen(port, '::')
  }

  close() {
    this.server?.close()
    delete this
  }

  updateSocket(key, value) {
    update(key, value)
  }

  stop() {
    this.server?.close()
    this.socketServer?.close()
  }
}

export const createControllerServer = (controller, { port, socketPort }) => {
  controllerServerIns?.stop()
  controllerServerIns = null
  return Promise.all([portIsNotUse(port), portIsNotUse(socketPort)]).then(() => {
    controllerServerIns = new ControllerServer(controller, { port, socketPort })
    return {
      controllerServerIns,
      updateSocket: controllerServerIns.updateSocket,
      stop: () => {
        controllerServerIns?.stop()
        controllerServerIns = null
      }
    }
  })
}
export const closeControllerServer = () => {
  controllerServerIns?.close()
}
