// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, BrowserView, ipcMain } = require('electron')
const path = require('path')

//调用vite（npm run dev）启动服务
const { createServer } = require('vite')

const createWindow = async () => {
    //启动vite服务编译ts->js
    const compiler = await createServer({ server: { port: 5173 } });
    await compiler.listen();

    //监听渲染进程的消息
    ipcMain.handle('changeMode', (event, mode) => {
        console.log('change mode:' + mode);
        browserView.webContents.loadURL('http://localhost:5173/?mode=' + mode);
    });
    ipcMain.handle("executeCommand", (event, command) => {
        console.log('execute command:' + command);
        return new Promise((resolve) => {
            ipcMain.on('executeCommandResult', (_event, value) => {
                console.log(value);
                resolve(value);
            });
            browserView.webContents.send('executeCommand', command);
        });
    });

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // 加载 editor.html
    mainWindow.loadURL('http://localhost:5173/editor.html')

    //加载 index.html
    const browserView = new BrowserView({
        webPreferences: {
            preload: path.join(__dirname, 'runtimePreload.js')
        }
    })
    mainWindow.setBrowserView(browserView)
    browserView.setBounds({ x: 100, y: 200, width: 1280, height: 720 })
    browserView.webContents.loadURL('http://localhost:5173/?mode=edit')

    // 打开开发工具
    mainWindow.webContents.openDevTools()
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. 也可以拆分成几个文件，然后用 require 导入。