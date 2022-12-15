const { contextBridge, ipcRenderer } = require('electron')
console.log('preload');
let commandMap = new Map();

contextBridge.exposeInMainWorld('runtime', {
    registerCommand: (commandName,command) => {
        commandMap.set(commandName, command);
    },

    handleExecuteCommand: () => {
        ipcRenderer.on('executeCommand', (event, command) => {
            const callback = commandMap.get(command.command);
            if(callback){
                const result = callback(command.command);
                ipcRenderer.send('executeCommandResult', result);
            }
            else{
                alert(JSON.stringify(command) + " not found");
            }
            //const result = callback(command);
            //ipcRenderer.send('executeCommandResult', { name: "Root" });
        });
    }
});