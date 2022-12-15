const { contextBridge, ipcRenderer } = require('electron')
console.log('preload');
contextBridge.exposeInMainWorld('editor', {
    changeMode: (mode) => ipcRenderer.invoke('changeMode', mode),

    executeCommand: (command) => ipcRenderer.invoke('executeCommand', command)
})