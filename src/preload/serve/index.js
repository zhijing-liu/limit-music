import express from 'express'
import bodyParser from 'body-parser'

import { createSocket } from './socket.js'
import net from 'node:net'
import { join } from 'node:path'
import { accessSync, statSync } from 'node:fs'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { actions } from '../../../tools/ipConfig'

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
export const getIp = (action) => {
  return actions.get(action)?.()
}
// 远程控制
class ControllerServer {
  app
  controller
  server
  socketServer
  handler
  constructor() {
    this.app = express()
    this.app.use(bodyParser.json())
    this.app.use('/socket.io', (...arg) => {
      this.handler?.(...arg)
    })
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
      const { action, args } = req.body
      const result = await this.controller[action]?.(...(args ?? []))
      res.send({
        implement: true,
        result
      })
    })
  }

  setController(controller) {
    this.controller = controller
    return this
  }

  async start({ port, socketPort }) {
    this.app.enabled('/socket.io')

    this.handler = createProxyMiddleware({
      target: `http://[0.0.0.0]:${socketPort}`, // 目标主机
      changeOrigin: true, // 需要虚拟主机站点
      ws: true, // 是否代理websocket
      proxyTimeout: 3000
    })
    await Promise.all([
      createSocket(socketPort).then((socketServer) => {
        this.socketServer = socketServer
      }),
      new Promise((resolve) => {
        this.server = this.app.listen(port, '::', () => {
          resolve()
        })
      })
    ])
    return this
  }

  close() {
    this.server?.close()
    delete this
  }

  updateSocket(key, value) {
    this.socketServer?.playerNsp?.emit(key, value)
  }

  async stop() {
    this.handler = undefined
    await this.server?.close()
    await this.socketServer?.main?.close()
    await this.socketServer?.server?.close()
  }
}
const controllerServerIns = new ControllerServer()
export const createControllerServer = async ({ port, socketPort }) => {
  await controllerServerIns?.stop()
  return Promise.all([portIsNotUse(port), portIsNotUse(socketPort)])
    .then(() => controllerServerIns.start({ port, socketPort }))
    .then((ins) => ({
      setController: (c) => {
        ins.setController(c)
      },
      updateSocket: (...arg) => {
        ins.updateSocket(...arg)
      },
      stop: () => {
        ins?.stop()
      }
    }))
}
export const closeControllerServer = () => {
  controllerServerIns?.close()
}
