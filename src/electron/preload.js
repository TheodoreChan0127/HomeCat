import { contextBridge, ipcRenderer } from 'electron'

// 安全暴露API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
})