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
  protocol,
  globalShortcut
} from 'electron'
import { join, normalize } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../build/icon.png?asset'

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  let tray
  let mainWindow
  const createWindow = async () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    const contentWidth =
      screen.getPrimaryDisplay().workAreaSize.width * (!app.isPackaged ? 0.75 : 0.5)
    mainWindow = new BrowserWindow({
      width: !app.isPackaged
        ? width * 0.75
        : Math.max(Math.min(contentWidth, width * 0.75), width * 0.5),
      height: height * 0.75,
      minWidth: 800,
      minHeight: 600,
      show: false,
      frame: false,
      icon,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
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
      mainWindow[mainWindow.isVisible() ? 'hide' : 'show']()
    })
    tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: '播放',
          click: () => {
            mainWindow.webContents.send('controllerEvent', { action: 'play' })
          }
        },
        {
          label: '暂停',
          click: () => {
            mainWindow.webContents.send('controllerEvent', { action: 'pause' })
          }
        },
        {
          label: '上一首',
          click: () => {
            mainWindow.webContents.send('controllerEvent', { action: 'last' })
          }
        },
        {
          label: '下一首',
          click: () => {
            mainWindow.webContents.send('controllerEvent', { action: 'next' })
          }
        },
        {
          type: 'separator'
        },
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
  // 调用window方法
  const focusAndPerform = (methodName) => {
    return (menuItem) => {
      mainWindow.webContents.focus()
      mainWindow.webContents[methodName]?.()
    }
  }
  app.whenReady().then(async () => {
    electronApp.setAppUserModelId('com.limit-music.app')
    // 键盘事件
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
    // 特殊请求配置
    protocol.registerFileProtocol('atom', (request, callback) => {
      callback(decodeURI(normalize(request.url.slice(7))))
    })
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.focus()
      }
    })
    globalShortcut.register('Escape', () => {
      mainWindow.setFullScreen(false)
    })
    return createWindow()
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
  ipcMain.handle('fullScreen', () => {
    mainWindow.setFullScreen(!mainWindow.isFullScreen())
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
}
