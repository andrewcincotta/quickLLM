const { app, BrowserWindow, globalShortcut, Menu, ipcMain } = require('electron');
const path = require('path');

// Use dynamic import for electron-store
let store;
(async () => {
    store = (await import('electron-store')).default;  // Dynamically import electron-store
})();

let mainWindow = null;
let settingsWindow = null;

// Enable hot reloading during development
if (process.env.NODE_ENV === 'development') {
    try {
        require('electron-reload')(__dirname, {
            electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
            hardResetMethod: 'exit'
        });
    } catch (err) {
        console.error('Failed to initialize electron-reload:', err);
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        alwaysOnTop: store ? store.get('alwaysOnTop', true) : true
    });

    mainWindow.loadURL('https://chat.openai.com');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createSettingsWindow() {
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

// macOS menu bar menu
const menuTemplate = [
    {
        label: 'File',
        submenu: [
            { role: 'quit' }
        ]
    },
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'toggledevtools' }
        ]
    },
    {
        label: 'Actions',
        submenu: [
            {
                label: 'Settings',
                click: createSettingsWindow
            },
            {
                label: 'Clear Chat',
                click: () => {
                    mainWindow.webContents.send('clear-chat');
                }
            },
            {
                label: 'Toggle Window',
                click: toggleWindow
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

app.whenReady().then(() => {
    const isRegistered = globalShortcut.register('Control+Shift+Space', toggleWindow);
    const settingsShortcutRegistered = globalShortcut.register('Control+Shift+,', createSettingsWindow);  // Register the shortcut for settings

    if (!isRegistered || !settingsShortcutRegistered) {
        console.log('Shortcut registration failed');
    } else {
        console.log('Shortcuts registered successfully');
    }

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Listen for settings updates from the renderer process
ipcMain.on('save-settings', (event, settingsData) => {
    if (store) {
        store.set('alwaysOnTop', settingsData.alwaysOnTop);
        store.set('theme', settingsData.theme);
        console.log('Settings saved:', settingsData);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
