import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  confirmFileAccess,
  getDirAccessibility,
  getMusicInfo,
  getPlayUrl,
  scanMusicByPath
} from './fs'
import * as serve from './serve'
let controller
contextBridge.exposeInMainWorld('electron', electronAPI)
contextBridge.exposeInMainWorld('underlying', {
  closeWindow: () => {
    return ipcRenderer.invoke('closeWindow')
  },
  maxWindow: () => {
    return ipcRenderer.invoke('maxWindow')
  },
  minWindow: () => {
    return ipcRenderer.invoke('minWindow')
  },
  hideWindow: () => {
    return ipcRenderer.invoke('hideWindow')
  },
  openDirSelector: async () => {
    return (await ipcRenderer.invoke('openDirSelector')) ?? []
  },
  fullScreen: () => {
    return ipcRenderer.invoke('fullScreen')
  },
  setController: (c) => {
    controller = c
  },
  getDirAccessibility,
  scanMusicByPath,
  getPlayUrl,
  getMusicInfo,
  confirmFileAccess
})
contextBridge.exposeInMainWorld('serve', {
  ...serve
})
ipcRenderer.on('controllerEvent', (event, args) => {
  console.log(args)
  controller?.[args.action]?.()
})
