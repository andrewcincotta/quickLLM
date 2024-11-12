const { BrowserWindow } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store();

let settingsWindow = null;

function createSettingsWindow(mainWindow) {
    if (settingsWindow) {
        settingsWindow.focus();
        return;
    }

    settingsWindow = new BrowserWindow({
        width: 600,
        height: 400,
        resizable: false,
        modal: true,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    settingsWindow.loadURL(`file://${path.join(__dirname, 'settings.html')}`);

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

module.exports = {
    createSettingsWindow
};
