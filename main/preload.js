const { contextBridge, ipcRenderer } = require('electron')
console.log('preload');

let currentCommandId = 0;

contextBridge.exposeInMainWorld('editor', {
    changeMode: (mode) => ipcRenderer.invoke('changeMode', mode),

    saveScene: (url, content) => ipcRenderer.invoke('saveScene', url, content),

    executeCommand: (command) => {
        currentCommandId++;
        command.id = currentCommandId;
        return ipcRenderer.invoke('executeCommand', command);
    }
})