const { contextBridge, ipcRenderer } = require('electron')
console.log('preload');
contextBridge.exposeInMainWorld('editor', {
    changeMode: (mode) => ipcRenderer.invoke('changeMode', mode),

    getCurrentMode: () => ipcRenderer.invoke('getCurrentMode'),
})