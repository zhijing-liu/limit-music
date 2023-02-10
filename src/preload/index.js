import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { getDirAccessibility, scanMusicByPath } from './fs'
contextBridge.exposeInMainWorld('electron', electronAPI)
contextBridge.exposeInMainWorld('underlying', {
  closeWindow: () => {
    ipcRenderer.invoke('closeWindow')
  },
  maxWindow: () => {
    ipcRenderer.invoke('maxWindow')
  },
  minWindow: () => {
    ipcRenderer.invoke('minWindow')
  },
  openDirSelector: async () => {
    return (await ipcRenderer.invoke('openDirSelector')) ?? []
  },
  getDirAccessibility,
  scanMusicByPath
})
