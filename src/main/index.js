import {
  app,
  shell,
  BrowserWindow,
  screen,
  ipcMain,
  dialog,
  Tray,
  Menu,
  Notification,
  globalShortcut
} from 'electron'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import logo from '../../resources/logo.png?asset'
import icon from '../../build/icon.png?asset'

let tray
let mainWindow
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: screen.getPrimaryDisplay().workAreaSize.width * (!app.isPackaged ? 0.75 : 0.5),
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
  tray = new Tray(icon)
  tray.addListener('click', () => {
    mainWindow.show()
  })
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: '打开',
        click: () => {
          mainWindow.show()
        }
      },
      {
        label: '重新加载',
        click: focusAndPerform('reload')
      },
      {
        label: '清空缓存重新加载',
        click: focusAndPerform('reloadIgnoringCache')
      },
      {
        label: '开发者选项',
        click: () => {
          mainWindow.webContents.isDevToolsOpened()
            ? mainWindow.webContents.closeDevTools()
            : mainWindow.webContents.openDevTools()
        }
      },
      {
        label: '全屏',
        accelerator: 'esc',
        click: () => {
          mainWindow.setFullScreen(!mainWindow.isFullScreen())
        }
      },
      {
        type: 'separator'
      },
      {
        label: '退出',
        role: 'quit'
      }
    ])
  )
  // 给托盘图标设置气球提示
  tray.setToolTip('limit-music')
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
const focusAndPerform = (methodName) => {
  return (menuItem) => {
    mainWindow.webContents.focus()
    mainWindow.webContents[methodName]?.()
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
  globalShortcut.register('Escape', () => {
    mainWindow.setFullScreen(false)
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

ipcMain.handle('hideWindow', () => {
  // 最小化到托盘
  mainWindow.hide()
  const notification = new Notification({
    title: 'limit 音乐',
    body: '应用程序已最小化到托盘'
  })
  notification.show()
})
ipcMain.handle('openDirSelector', () => {
  return dialog.showOpenDialogSync({
    title: '添加音乐路径',
    buttonLabel: '添加',
    properties: ['openDirectory', 'multiSelections']
  })
})
