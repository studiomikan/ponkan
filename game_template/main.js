// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const ipc = require("electron").ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

function createWindow() {
  // Create the browser window.
  const width = 1280;
  const height = 720;
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: 800,
    minHeight: 450,
    useContentSize: true,
    resizable: true,
    fullscreenable: true,
    frame: true,
    // titleBarStyle: "hidden",
    autoHideMenuBar: true,
    titleBarStyle: "default",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("public/index.html");
  mainWindow.setMenu(null);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

app.on("ready", createWindow);
app.allowRendererProcessReuse = true;

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipc.on("setContentSize", function (event, width, height) {
  // console.log("setWindowSize", width, height);
  if (mainWindow != null) {
    mainWindow.setContentSize(width, height);
  }
  event.returnValue = [width, height];
});

ipc.on("getContentSize", function (event) {
  if (mainWindow != null) {
    event.returnValue = mainWindow.getContentSize();
  } else {
    event.returnValue = [0, 0];
  }
});
