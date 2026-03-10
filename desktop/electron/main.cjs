const fs = require('node:fs')
const path = require('node:path')
const {
  app,
  BrowserWindow,
  desktopCapturer,
  globalShortcut,
  ipcMain,
  screen
} = require('electron')

require('dotenv').config({ path: path.join(__dirname, '../.env') })

const isDev = !app.isPackaged
const rendererURL = process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173'
const defaultCaptureShortcut = process.env.CAPTURE_SHORTCUT || 'CommandOrControl+Shift+S'

let mainWindow = null
let captureShortcut = defaultCaptureShortcut

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'snaprecall-settings.json')
}

function loadAppSettings() {
  try {
    const raw = fs.readFileSync(getSettingsPath(), 'utf8')
    const parsed = JSON.parse(raw)

    const loadedShortcut =
      parsed &&
      typeof parsed.captureShortcut === 'string' &&
      parsed.captureShortcut.trim() !== ''
        ? parsed.captureShortcut.trim()
        : defaultCaptureShortcut

    return {
      captureShortcut: loadedShortcut
    }
  } catch (_err) {
    return {
      captureShortcut: defaultCaptureShortcut
    }
  }
}

function saveAppSettings() {
  try {
    fs.writeFileSync(
      getSettingsPath(),
      JSON.stringify(
        {
          captureShortcut
        },
        null,
        2
      ),
      'utf8'
    )
  } catch (err) {
    console.error('Failed to persist app settings:', err)
  }
}

function triggerCapture(shortcutValue) {
  if (!mainWindow) {
    return
  }

  mainWindow.webContents.send('shortcut:capture', { shortcut: shortcutValue })
}

function registerCaptureShortcut(shortcutValue) {
  const nextShortcut = String(shortcutValue || '').trim()
  if (!nextShortcut) {
    return {
      ok: false,
      error: 'Shortcut cannot be empty.'
    }
  }

  if (nextShortcut === captureShortcut && globalShortcut.isRegistered(nextShortcut)) {
    return {
      ok: true,
      shortcut: nextShortcut
    }
  }

  const previousShortcut = captureShortcut
  if (previousShortcut) {
    globalShortcut.unregister(previousShortcut)
  }

  const registered = globalShortcut.register(nextShortcut, () => {
    triggerCapture(nextShortcut)
  })

  if (!registered) {
    if (previousShortcut && previousShortcut !== nextShortcut) {
      const restored = globalShortcut.register(previousShortcut, () => {
        triggerCapture(previousShortcut)
      })
      if (restored) {
        captureShortcut = previousShortcut
      }
    }

    return {
      ok: false,
      error: `Failed to register shortcut: ${nextShortcut}`
    }
  }

  captureShortcut = nextShortcut
  return {
    ok: true,
    shortcut: captureShortcut
  }
}

function registerShortcuts() {
  const result = registerCaptureShortcut(captureShortcut)
  if (!result.ok) {
    console.error(result.error)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 860,
    minWidth: 980,
    minHeight: 720,
    title: 'SnapRecall',
    backgroundColor: '#f4f6f2',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.maximize()

  if (isDev) {
    mainWindow.loadURL(rendererURL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

async function capturePrimaryDisplay(options = {}) {
  const shouldHideWindow =
    Boolean(options.hideWindow) &&
    Boolean(mainWindow) &&
    !mainWindow.isDestroyed() &&
    mainWindow.isVisible()

  if (shouldHideWindow && mainWindow) {
    mainWindow.hide()
    await sleep(160)
  }

  const primaryDisplay = screen.getPrimaryDisplay()
  const width = Math.floor(primaryDisplay.size.width)
  const height = Math.floor(primaryDisplay.size.height)

  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width, height }
    })

    const byPrimary = sources.find(
      (source) => String(source.display_id) === String(primaryDisplay.id)
    )
    const target = byPrimary || sources[0]

    if (!target) {
      throw new Error('No display source found for capture')
    }

    return target.thumbnail.toDataURL()
  } finally {
    if (shouldHideWindow && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show()
      mainWindow.focus()
      await sleep(80)
    }
  }
}

app.whenReady().then(() => {
  const settings = loadAppSettings()
  captureShortcut = settings.captureShortcut

  createWindow()
  registerShortcuts()

  ipcMain.handle('capture-screen', async () => {
    return capturePrimaryDisplay()
  })

  ipcMain.handle('capture-screen-selection', async () => {
    return capturePrimaryDisplay({ hideWindow: true })
  })

  ipcMain.handle('app:get-info', async () => {
    return {
      captureShortcut
    }
  })

  ipcMain.handle('shortcut:update', async (_event, nextShortcut) => {
    const result = registerCaptureShortcut(nextShortcut)
    if (result.ok) {
      saveAppSettings()
      if (mainWindow) {
        mainWindow.webContents.send('shortcut:updated', {
          shortcut: result.shortcut
        })
      }
    }

    return result
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
