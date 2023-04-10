# QuickGPT

An application that instantly opens open ai chat (chat gpt) on your desktop

![](./teaser.png)

## Shortcut list
 - Control+Shift+G: Toggle window display
 - Control+Shift+R: Reload screen

## Install
```
git clone https://github.com/TetsuakiBaba/quickGPT.git
cd quickGPT
npm install
npm start
```

If you want to make a application file on macOS, follow the below steps.

```
npm exec --package=@electron-forge/cli -c "electron-forge import"
npm run make
pen ./out/QuickGPT-darwin-arm64/QuickGPT.app 
```
