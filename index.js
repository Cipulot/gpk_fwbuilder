const {app, BrowserWindow, ipcMain} = require("electron")
const Store = require("electron-store")
const {command} = require('./command')

const store = new Store()
let mainWindow

const createWindow = () => {
    const win  = store.get('window')
    mainWindow = new BrowserWindow({
        width: win ? win.w : 920,
        height: win ? win.h : 1000,
        icon: `${__dirname}/icons/256x256.png`,
        webPreferences: {
            preload: __dirname + '/preload.js',
            backgroundThrottling: false,
        },
    })

    mainWindow.loadURL(`file://${__dirname}/public/index.html`)
    mainWindow.setMenu(null)
    mainWindow.on('close', async (event) => {
        if (!app.isQuiting) await closing(event, mainWindow)
        return false
    })
}

app.on('ready', () => {
    createWindow()
    command.upImage(mainWindow)
    //mainWindow.webContents.openDevTools()
})

const closing = async(e, mainWindow) => {
    e.preventDefault()
    const win = mainWindow.getBounds()
    store.set('window', {w: win.width, h: win.height})
    mainWindow.webContents.send("close", false)
    await command.stopImage()
    app.isQuiting = true
    app.quit()
}

ipcMain.handle('existSever', async () => await command.existSever())
ipcMain.handle('tags', async () => await command.tags())
ipcMain.handle('build', async (e, dat) => await command.build(dat))
ipcMain.handle('generateQMKFile', async (e, dat) => await command.generateQMKFile(dat))
ipcMain.handle('updateRepository', async (e, fw) => await command.updateRepository(fw))
ipcMain.handle('getState',  async () => await store.get('state'))
ipcMain.handle('setState',  async (e, obj) => {
    await store.set('state', obj)
})
ipcMain.handle('rebuildImage', async () => await command.rebuildImage(mainWindow))
ipcMain.handle('appVersion',  () => app.getVersion())