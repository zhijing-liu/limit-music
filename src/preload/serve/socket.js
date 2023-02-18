import { Server } from 'socket.io'
import { createServer } from 'node:http'

const socketServer = {}
export const update = (key, value) => {
  socketServer.playerNsp?.emit(key, value)
}
export const createSocket = async (app, socketPort = 20000) => {
  const server = createServer(app)
  socketServer.main = new Server(server, {
    connectTimeout: 5000
  })
  socketServer.playerNsp = socketServer.main.of('/socket-player')
  return new Promise((resolve) => {
    server.listen(socketPort, '::', () => {
      resolve(server)
    })
  })
}
