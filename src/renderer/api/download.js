import Request from 'request'
import EventEmitter from 'events'
import Fs from 'fs'
import { basename } from 'path'
import { prepend } from 'ramda'
import localforage from 'localforage'
import moment from 'moment'

import { base64, throttle } from '@/api/tool'

// @TODO 并发问题，数据写入冲突问题
class Download extends EventEmitter {
  storeKey = 'download'

  status = {
    in_progress: { name: '下载中', key: 'in_progress' },
    interrupted: { name: '已暂停', key: 'interrupted' },
    complete: { name: '下载完成', key: 'complete' },
    error: { name: '错误', key: 'error' },
  }

  constructor(onChange) {
    super()
    this.on('change', onChange)
  }

  async createDownloadItem(key, url, localPath) {
    const filename = basename(localPath)
    const startTime = moment().unix()
    const id = base64(`${filename}:${startTime}`)
    const item = {
      key: key, // ${用户名}/${空间}
      id: id, // 唯一ID
      url: url, // 远程路径
      localPath: localPath, // 下载本地路径
      startTime: startTime, // 下载开始时间
      filename: basename(localPath), // 下载的文件名
      status: this.status.in_progress.key, // 下载状态: "in_progress", "interrupted", "complete", "error"
      errorMessage: '',
      transferred: 0, // 已下载大小
      total: -1, // 总共大小
      endTime: -1, // 下载结束时间
    }
    await this.setItem(id, item)
    this.emit('change', { ...item })
    return item
  }

  async setItem(id, item) {
    const store = await this.getStore()
    if (!store) {
      return await localforage.setItem(this.storeKey, {
        data: [item],
      })
    } else {
      const existedItemIndex = store.data.findIndex(_item => _item.id === id)
      if (~existedItemIndex) {
        store.data[existedItemIndex] = {
          ...store.data[existedItemIndex],
          ...item,
        }
      } else {
        store.data = prepend(item, store.data)
      }
      return await localforage.setItem(this.storeKey, store)
    }
  }

  async createDownloadTask({ key, url, headers, localPath }) {
    const item = await this.createDownloadItem(key, url, localPath)
    // @TODO 并发
    return new Promise((resolve, reject) => {
      const emitChange = type => {
        this.emit('change', { ...item })
      }

      let percentage = 0
      const calTrans = () => {
        const newPercentage = (item.transferred / item.total).toFixed(2)
        if (percentage !== newPercentage) {
          percentage = newPercentage
          emitChange()
        }
      }

      const throttleChunk = throttle(calTrans, 100)

      const request = Request({ url: url, headers: headers })
        .on('response', response => {
          item.total = window.parseInt(response.headers['content-length'], 10)
          emitChange()
        })
        .on('data', chunk => {
          item.transferred += chunk.length
          if (item.transferred === item.total) {
            calTrans()
          } else {
            throttleChunk()
          }
        })
        .on('error', error => {
          item.status = this.status.error.key
          item.errorMessage = error && error.message
          emitChange()
          reject(error)
        })

      const localStream = Fs.createWriteStream(localPath).once('finish', async () => {
        item.status = this.status.complete.key
        item.endTime = moment().unix()
        request.removeAllListeners()
        await this.setItem(item.id, item)
        emitChange()
        resolve('success')
      })

      request.pipe(localStream)
    })
  }

  async clear() {
    return await localforage.removeItem(this.storeKey)
  }

  async getStore() {
    return await localforage.getItem(this.storeKey)
  }

  async getItem(id) {
    const store = await this.getStore()
    return store && store.data.find(item => item.id === id)
  }
}

export default Download
