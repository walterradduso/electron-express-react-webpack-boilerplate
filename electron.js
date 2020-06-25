'use strict';

// Import parts of electron to use
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let splashScreen;

// Keep a reference for dev mode
let dev = false;

if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
  dev = true;
}

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', 'true');
  app.commandLine.appendSwitch('force-device-scale-factor', '1');
}

function createWindow() {
  // Create main window.
  mainWindow = new BrowserWindow({
    height: 768,
    show: false,
    width: 1024,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Create splash screen window.
  splashScreen = new BrowserWindow({
    alwaysOnTop: true,
    frame: false,
    height: 220,
    resizable: false,
    transparent: true,
    width: 600,
  });

  // Assign an HTML to splashScreen.
  splashScreen.loadURL(`file://${__dirname}/splash/index.html`);

  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    mainWindow.loadURL(
      url.format({
        host: 'localhost:8080',
        pathname: 'index.html',
        protocol: 'http:',
        slashes: true,
      }),
    );
  } else {
    mainWindow.loadURL(`file://${__dirname}/dist/index.html`);

    // Start the local server with express
    const server = require('./server');
  }

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    // Then close the splash screen window and show the main window.
    if (splashScreen) {
      splashScreen.close();
    }

    // Full Screen
    mainWindow.maximize();

    // Show the main window.
    mainWindow.show();

    // Open the DevTools automatically if developing
    if (dev) {
      const {
        default: installExtension,
        REACT_DEVELOPER_TOOLS,
      } = require('electron-devtools-installer');

      installExtension(REACT_DEVELOPER_TOOLS).catch(err =>
        console.log('Error loading React DevTools: ', err),
      );

      mainWindow.webContents.openDevTools();
    }
  });

  // Open all links in external browser
  mainWindow.webContents.on('new-window', function (event, url) {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
