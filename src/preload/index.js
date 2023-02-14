import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  confirmFileAccess,
  getDirAccessibility,
  getMusicInfo,
  getPlayUrl,
  scanMusicByPath
} from './fs'
import { getFileKey, getIp, setServerStart, setServerClose } from './serve'
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
  getDirAccessibility,
  scanMusicByPath,
  getPlayUrl,
  getMusicInfo,
  confirmFileAccess
})
contextBridge.exposeInMainWorld('serve', {
  getFileKey,
  getIp,
  setServerStart,
  setServerClose
})
