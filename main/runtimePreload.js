const { contextBridge, ipcRenderer } = require('electron')
console.log('preload');
contextBridge.exposeInMainWorld('runtime', {
    handleGetCurrentMode: (callback) => {
        ipcRenderer.on('getCurrentMode', () => {
            const result = callback();
            ipcRenderer.send('getCurrentModeResult', result);
        });
    },
})