import { Server } from 'socket.io'
import { createServer } from 'node:http'

const socketServer = {}
export const update = (key, value) => {
  socketServer.playerNsp?.emit(key, value)
}
export const createSocket = async (socketPort = 20000) => {
  socketServer.server = createServer()
  socketServer.main = new Server(socketServer.server, {
    connectTimeout: 5000
  })
  socketServer.playerNsp = socketServer.main.of('/socket-player')
  return new Promise((resolve) => {
    socketServer.server.listen(socketPort, '::', () => {
      resolve(socketServer)
    })
  })
}
