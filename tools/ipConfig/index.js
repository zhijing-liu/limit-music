import { networkInterfaces } from 'node:os'
import process, { argv } from 'node:process'

const network = networkInterfaces()
export const actions = new Map([
  [
    'getIps',
    () => {
      const map = {}
      for (const netCard in network) {
        for (const ipInfo of network[netCard]) {
          Reflect.defineProperty(map, ipInfo.address.toString(), {
            value: {
              ...ipInfo,
              netCard,
              webAddress: ipInfo.family === 'IPv4' ? ipInfo.address : `[${ipInfo.address}]`
            },
            enumerable: true
          })
        }
      }
      return map
    }
  ],
  [
    'getIpv4s',
    () => {
      const ips = actions.get('getIps')()
      const map = {}
      for (const ipInfo of Object.values(ips)) {
        if (ipInfo.family === 'IPv4') {
          Reflect.defineProperty(map, ipInfo.address, { value: ipInfo, enumerable: true })
        }
      }
      return map
    }
  ],
  [
    'getIpv6s',
    () => {
      const ips = actions.get('getIps')()
      const map = {}
      for (const ipInfo of Object.values(ips)) {
        if (ipInfo.family === 'IPv6') {
          Reflect.defineProperty(map, ipInfo.address, { value: ipInfo, enumerable: true })
        }
      }
      return map
    }
  ],
  [
    'getLocalIPv4',
    () => {
      const map = actions.get('getIpv4s')()
      for (const ip in map) {
        const ip0b = parseInt(
          ip
            .split('.')
            .map((area) => (+area).toString(2).padStart(8, '0'))
            .join(''),
          2
        )
        if (ip0b >= 3232235520 && ip0b <= 3232301055) {
          return map[ip]
        }
      }
    }
  ],
  [
    'getPublicIPv6',
    () => {
      const map = actions.get('getIpv6s')()
      for (const ip in map) {
        const ip0x = parseInt(
          ip
            .split(':')
            .slice(0, 2)
            .map((area) => parseInt(area, 16).toString().padStart(5, '0'))
            .join('')
        )
        if (ip0x >= 819200000 && ip0x <= 1638365535) {
          return map[ip]
        }
      }
    }
  ]
])
const executeActions = argv.length > 2 ? argv.slice(2) : actions.keys()
const result = {}
for (const actionName of executeActions) {
  if (actions.has(actionName)) {
    result[actionName] = actions.get(actionName)?.()
  }
}
if (process.connected) {
  process.send(result)
}
export default result
