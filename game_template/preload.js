const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  setContentSize: (width, height) => {
    ipcRenderer.sendSync("setContentSize", width, height);
  },
  getContentSize: () => {
    return ipcRenderer.sendSync("getContentSize");
  },
});


