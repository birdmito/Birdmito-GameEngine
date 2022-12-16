const { contextBridge, ipcRenderer } = require('electron')
console.log('preload');
let commandMap = new Map();

contextBridge.exposeInMainWorld('runtime', {
    registerCommand: (commandName, commandFunction) => {
        commandMap.set(commandName, commandFunction);
    },

    handleExecuteCommand: () => {
        ipcRenderer.on('executeCommand', (event, command) => {
            const commandFunction = commandMap.get(command.command);
            if (commandFunction) {
                const data = commandFunction(command.param);
                const result ={
                    id: command.id,
                    data,
                }
                ipcRenderer.send('executeCommandResult', result);
            }
            else {
                alert(JSON.stringify(command) + " not found");
            }
            //const result = callback(command);
            //ipcRenderer.send('executeCommandResult', { name: "Root" });
        });
    }
});