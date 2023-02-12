import { app, shell, BrowserWindow, screen, ipcMain, dialog } from 'electron'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import logo from '../../resources/logo.png?asset'
async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: screen.getPrimaryDisplay().workAreaSize.width * 0.75,
    height: screen.getPrimaryDisplay().workAreaSize.height * 0.75,
    minWidth: 800,
    minHeight: 600,
    show: false,
    frame: false,
    icon: logo,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon: logo } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  !app.isPackaged && mainWindow.webContents.openDevTools()
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  ipcMain.handle('maxWindow', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore()
    } else {
      mainWindow.maximize()
    }
  })
  ipcMain.handle('minWindow', () => {
    mainWindow.minimize()
  })
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
ipcMain.handle('closeWindow', () => {
  app.quit()
})
ipcMain.handle('openDirSelector', () => {
  return dialog.showOpenDialogSync({
    title: '添加音乐路径',
    buttonLabel: '添加',
    properties: ['openDirectory', 'multiSelections']
  })
})
