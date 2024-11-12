import { app, BrowserWindow, globalShortcut } from 'electron';
import path from 'path';

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        alwaysOnTop: true
    });

    // Load ChatGPT directly
    mainWindow.loadURL('https://chat.openai.com');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function toggleWindow() {
    if (mainWindow === null) {
        createWindow();
    } else {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    }
}

app.whenReady().then(() => {
    globalShortcut.register('Contorl+Shift+Space', toggleWindow);
    
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
