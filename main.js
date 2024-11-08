// main.js

const path = require('path')

// automatic reload electron app when code changes
const isDev = process.env.NODE_ENV === 'development';


if (isDev) {
    require('electron-reload')(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`),
        hardResetMethod: 'exit',
        watched: [
            path.join(__dirname, 'main.js'),
            path.join(__dirname, 'preload.js'),
            path.join(__dirname, '*.html'),
            path.join(__dirname, 'settings.js'),
        ],
        ignored: /node_modules|[\/\\]\./
    });
}


if (require('electron-squirrel-startup')) app.quit();

const is_windows = process.platform === 'win32';
const is_mac = process.platform === 'darwin';
const is_linux = process.platform === 'linux';

const { app, BrowserWindow, globalShortcut, Menu, Tray, clipboard, screen, shell, ipcMain, nativeTheme } = require('electron')
const Store = require('electron-store');
const store = new Store();

const packageJson = require('./package.json');
const version = packageJson.version;

let mainWindow = null

const { updateElectronApp } = require('update-electron-app')
updateElectronApp()

ipcMain.on('set-url', (event, url) => {
    console.log('set-url', url);
    mainWindow.loadURL(url);
});
ipcMain.on('set-shortcut', (event, value, old_shortcut) => {
    console.log('set-shortcut', value, old_shortcut);
    if (globalShortcut.isRegistered(old_shortcut)) {
        globalShortcut.unregister(old_shortcut);
    }
    globalShortcut.register(value, () => {
        toggleWindow();
    });
});

function createWindow() {
    nativeTheme.themeSource = store.get('theme', 'system');
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        titleBarOverlay: true,
        //transparent: true,
        hasShadow: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        },
        show: true,
        icon: path.join(__dirname, 'icons/icon.png'),
        alwaysOnTop: true
    })

    //win.setWindowButtonVisibility(false); // only macos
    const url = store.get('url', 'https://chat.openai.com/');
    if (url === undefined) {
        store.set('url', 'https://chat.openai.com/');
    }
    win.loadURL(url);
    win.webContents.on('did-finish-load', () => {
        console.log('loaded');
        const textBoxSelector = 'textarea';
        win.webContents.executeJavaScript(`
            const textBox = document.querySelector('${textBoxSelector}');
            if (textBox) {
              textBox.focus();
            }
          `);
    });
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) {
            shell.openExternal(url)
        }
        return { action: 'deny' }
    })

    return win
}

app.on('browser-window-created', function (e, window) {
    window.webContents.on('before-input-event', function (event, input) {
        if (input.meta && input.key.toLowerCase() === 'w') {
            event.preventDefault()
        }
    })
})



app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

let tray = null

function toggleWindow() {
    if (mainWindow && mainWindow.isDestroyed()) {
        mainWindow = createWindow();
    }
    else {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            const vp = store.get('visibility_position', 'mouse');
            console.log(vp);
            if (vp === 'mouse') {
                const { x, y } = screen.getCursorScreenPoint();
                mainWindow.setPosition(x, y);
            }
            else if (vp === 'center') {
                const { width, height } = screen.getPrimaryDisplay().workAreaSize;
                const mainWindowSize = mainWindow.getSize();
                mainWindow.setPosition(
                    parseInt(width / 2) - parseInt(mainWindowSize[0] / 2),
                    parseInt(height / 2) - parseInt(mainWindowSize[1] / 2)
                );
            }
            else if (vp === 'same') {
                // foo
            }

            mainWindow.show();
            mainWindow.on('show', () => {
                mainWindow.focus();
                const textBoxSelector = 'textarea'; 
                mainWindow.webContents.executeJavaScript(`
                document.querySelector('${textBoxSelector}').focus();
          `);
            });
        }
    }
}

function createTray() {

    tray = new Tray(path.join(__dirname, './icons/IconTemplate.png'))

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Toggle Visibility',
            click: () => {
                toggleWindow();
            }
        },

        {
            label: 'Theme Mode',
            submenu: [
                {
                    label: 'Dark Theme',
                    type: 'radio',
                    checked: store.get('theme', 'system') === 'dark',
                    click: () => {
                        nativeTheme.themeSource = 'dark';
                        store.set('theme', 'dark');
                    }
                },
                {
                    label: 'Light Theme',
                    type: 'radio',
                    checked: store.get('theme', 'system') === 'light', 
                    click: () => {
                        nativeTheme.themeSource = 'light';
                        store.set('theme', 'light');
                    }
                },
                {
                    label: 'System Theme',
                    type: 'radio',
                    checked: store.get('theme', 'system') === 'system', 
                    click: () => {
                        nativeTheme.themeSource = 'system';
                        store.set('theme', 'system');
                    }
                }
            ]
        },
        {
            label: 'Settings',
            click: () => {
                //mainWindow.loadFile(path.join(__dirname, 'about.html'));
                const mainWindowSize = mainWindow.getSize();
                const mainWindowPos = mainWindow.getPosition();

                const aboutWindowWidth = 600;
                const aboutWindowHeight = 800;

                const aboutWindowPosX = mainWindowPos[0] + (mainWindowSize[0] - aboutWindowWidth) / 2;
                const aboutWindowPosY = mainWindowPos[1] + (mainWindowSize[1] - aboutWindowHeight) / 2;

                let win = new BrowserWindow({
                    title: "settings",
                    width: aboutWindowWidth,
                    height: aboutWindowHeight,
                    x: aboutWindowPosX,
                    y: aboutWindowPosY,
                    hasShadow: true,
                    alwaysOnTop: true,
                    resizable: false,
                    frame: false,
                    webPreferences: {
                        preload: path.join(__dirname, 'settings.js'),
                        nodeIntegration: true,
                        contextIsolation: true
                    }
                });

                win.loadFile(path.join(__dirname, `settings.html`)).then(() => {
                    win.webContents.executeJavaScript(`setVersion("${version}");`, true)
                        .then(result => {
                        }).catch(console.error);
                });
            }
        },
        { type: 'separator' },

        {
            label: 'About',
            click: () => {
                //mainWindow.loadFile(path.join(__dirname, 'about.html'));
                const mainWindowSize = mainWindow.getSize();
                const mainWindowPos = mainWindow.getPosition();

                const aboutWindowWidth = 300;
                const aboutWindowHeight = 280;

                const aboutWindowPosX = mainWindowPos[0] + (mainWindowSize[0] - aboutWindowWidth) / 2;
                const aboutWindowPosY = mainWindowPos[1] + (mainWindowSize[1] - aboutWindowHeight) / 2;

                let win = new BrowserWindow({
                    title: "About QuickLLM",
                    width: aboutWindowWidth,
                    height: aboutWindowHeight,
                    x: aboutWindowPosX,
                    y: aboutWindowPosY,
                    hasShadow: false,
                    alwaysOnTop: true,
                    resizable: false,
                    frame: false,
                    webPreferences: {
                        preload: path.join(__dirname, 'preload.js'),
                        nodeIntegration: false,
                        contextIsolation: true
                    }
                });
                win.loadFile(path.join(__dirname, `about.html`)).then(() => {
                    win.webContents.executeJavaScript(`setVersion("${version}");`, true)
                        .then(result => {
                        }).catch(console.error);
                });
            }
        },

        { role: 'quit' }
    ])

    tray.setToolTip('OpenAI Chat App')
    tray.setContextMenu(contextMenu)
}


app.whenReady().then(() => {
    if (app.dock) app.dock.hide();
    global.mainWindow = mainWindow = createWindow()
    createTray()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = createWindow()
        }
    })


    globalShortcut.register('Control+Shift+1', () => {
        const url_1 = store.get('url_1', 'https://chat.openai.com/');
        mainWindow.loadURL(url_1);
    })


    globalShortcut.register('Control+Shift+2', () => {
        const url_2 = store.get('url_2', 'https://www.bing.com/chat');
        mainWindow.loadURL(url_2);
    })


    globalShortcut.register('Control+Shift+3', () => {
        const url_3 = store.get('url_3', 'https://claude.ai/chats');
        mainWindow.loadURL(url_3);
    })

    globalShortcut.register('Control+Shift+4', () => {
        const url_4 = store.get('url_4', 'https://ollama.com/');
        mainWindow.loadURL(url_4);
    })

    const shortcut_toggle = store.get('shortcut_toggle', 'Control+Shift+Q');
    if (shortcut_toggle === undefined) {
        store.set('shortcut_toggle', 'Control+Shift+Q');
        shortcut_toggle = 'Control+Shift+Q';
    }
    globalShortcut.register(shortcut_toggle, () => {
        toggleWindow();
    })

})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
    globalShortcut.unregisterAll()
})