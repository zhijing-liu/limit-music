import { Server } from 'socket.io'
import { createServer } from 'node:http'

// const socketConnections = {
//   player: {}
// }
const socketServer = {}
// const setSocketConnections = (nameSpace, action, data, socket) => {
//   if (nameSpace === 'playerNsp') {
//     if (action === 'create') {
//       socketConnections.player[data] = {}
//       socketServer.controllerNsp.emit('deviceList', socketConnections.player)
//     } else if (action === 'remove') {
//       Reflect.deleteProperty(socketConnections.player, data)
//       socketServer.controllerNsp.emit('deviceList', socketConnections.player)
//     }
//   }
// }
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
// const addSocketEvent = () => {
//   socketServer.playerNsp = socketServer.main.of('/socket-player')
//   // socketServer.controllerNsp = socketServer.main.of('/socket-controller')
//   socketServer.playerNsp.on('connection', (socket) => {})
//   socketServer.main.on('connection', (socket) => {
//     console.log(78978978978)
//   })
//   //
//   // socketServer.controllerNsp.on('connection', (socket) => {
//   //   console.log(socket.id, 'controllerNsp')
//   //   socket.emit('deviceList', socketConnections.player)
//   //   socket.on('deviceList', () => {
//   //     socket.emit('deviceList', socketConnections.player)
//   //   })
//   // })
// }
