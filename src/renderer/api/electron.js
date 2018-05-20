import { ipcRenderer, shell, clipboard, remote, webFrame } from 'electron'

import Router from '@/router'
import Store from '@/store'
import { externalUrls } from '@/api/tool'

const { app, dialog, Menu, MenuItem, BrowserWindow, getCurrentWindow } = remote

const currentWin = getCurrentWindow()

const session = currentWin.webContents.session

const userAgent = `${process.env.npm_package_build_productName}/${process.env.npm_package_version}`

// 禁止缩放
webFrame.setVisualZoomLevelLimits(1, 1)

// img 标签注入授权头
session.webRequest.onBeforeSendHeaders(
  {
    urls: ['*://v0.api.upyun.com/*'],
  },
  (details, callback) => {
    if (details.resourceType === 'image') {
      const authHeaders = Store.getters.upyunClient.getHeaders(details.url)
      callback({
        requestHeaders: {
          ...details.requestHeaders,
          ...authHeaders,
        },
      })
    } else {
      callback({})
    }
  },
)

// 聚焦
export const winShow = currentWin.show

// 设置菜单
export const setApplicationMenu = () => {
  const menu = [
    {
      label: '文件',
      submenu: [
        {
          label: '切换账号',
          click() {
            Router.push({ name: 'login' })
            Store.dispatch('LOGOUT')
          },
        },
        {
          label: '退出',
          role: 'quit',
        },
      ],
    },
    {
      label: ' 编辑',
      submenu: [
        {
          label: '撤销',
          role: 'undo',
        },
        {
          label: '恢复',
          role: 'redo',
        },
        {
          type: 'separator',
        },
        {
          label: '复制',
          role: 'copy',
        },
        {
          label: '粘贴',
          role: 'paste',
        },
        {
          label: '剪切',
          role: 'cut',
        },
      ],
    },
    {
      label: '查看',
      submenu: [
        {
          label: '刷新',
          role: 'reload',
        },
      ],
    },
    {
      label: '帮助',
      role: 'help',
      submenu: [
        {
          label: '切换开发人员工具',
          role: 'toggledevtools',
        },
        {
          label: '报告一个问题',
          click() {
            shell.openExternal(externalUrls.issues)
          },
        },
        {
          type: 'separator',
        },
        {
          label: '关于',
          click() {
            shell.openExternal(externalUrls.repository)
          },
        },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
}

export const writeText = clipboard.writeText

// 打开外部链接
export const openExternal = shell.openExternal

export const windowOpen = (url, frameName, features) => {
  let child = new BrowserWindow({ parent: currentWin, modal: true, show: false })
  child.loadURL(url)
  child.once('ready-to-show', () => {
    child.show()
  })
}

// 创建右键菜单
export const createContextmenu = ({ appendItems } = {}) => {
  const menu = new Menu()
  for (const menuItem of appendItems) {
    if (!menuItem.hide) menu.append(new MenuItem(menuItem))
  }
  return menu
}

// 显示右键菜单
export const showContextmenu = (items, opts = {}) => {
  const menu = createContextmenu(items)
  setTimeout(() => menu.popup(currentWin))
}

// 获取版本号
export const getVersion = app.getVersion

// 获取产品名称
export const getName = app.getName

// 监听 Ctrl + A
export const listenSelectAll = callback => ipcRenderer.on('SHORTCUT_SELECT_ALL', callback)

// 上传文件
export const uploadFileDialog = (option = {}) => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(
      currentWin,
      {
        title: '选择要上传的文件',
        buttonLabel: '上传',
        properties: ['openFile', 'multiSelections'],
        ...option,
      },
      resolve,
    )
  })
}

// 上传文件夹
export const uploadDirectoryDialog = (option = {}) => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(
      currentWin,
      {
        title: '选择要上传的文件夹',
        buttonLabel: '上传',
        properties: ['openDirectory', 'createDirectory', 'multiSelections', 'showHiddenFiles'],
        ...option,
      },
      resolve,
    )
  })
}

// 下载
export const downloadFileDialog = (option = {}) => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(
      currentWin,
      {
        title: '下载到',
        buttonLabel: '保存',
        properties: ['openDirectory', 'createDirectory', 'showHiddenFiles'],
        ...option,
      },
      folderPaths => {
        resolve(folderPaths && folderPaths[0])
      },
    )
  })
}

export const showItemInFolder = fullPath => {
  return shell.showItemInFolder(fullPath)
}

export const openItem = fullPath => {
  return shell.openItem(fullPath)
}
