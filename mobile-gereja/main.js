const { app, BrowserWindow } = require('electron');
const path = require('path');
const serve = require('electron-serve').default || require('electron-serve');

const loadURL = serve({ directory: 'dist' });

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  loadURL(win);
}

app.whenReady().then(() => {
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