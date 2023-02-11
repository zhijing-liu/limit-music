import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  getDirAccessibility,
  getPlayUrl,
  getStorageMusicInfo,
  scanMusicByPath,
  setStorageMusicInfo
} from './fs'
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
  openDirSelector: async () => {
    return (await ipcRenderer.invoke('openDirSelector')) ?? []
  },
  getDirAccessibility,
  scanMusicByPath,
  getPlayUrl,
  getStorageMusicInfo,
  setStorageMusicInfo
})
