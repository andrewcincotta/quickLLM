const { ipcRenderer } = require('electron');

ipcRenderer.on('clear-chat', () => {
    console.log('Clear chat action triggered');
});