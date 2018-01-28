import Request from 'request'
import EventEmitter from 'events'
import Fs from 'fs'
import { basename } from 'path'
import { append } from 'ramda'
import localforage from 'localforage'
import moment from 'moment'

import { base64, throttle } from '@/api/tool'

class Download extends EventEmitter {
  storeKey = 'download'

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
      status: 'in_progress', // 下载状态: "in_progress", "interrupted", "complete"
      message: '',
      transferred: 0, // 已下载大小
      total: -1, // 总共大小
      endTime: -1, // 下载结束时间
    }
    const store = await this.setItem(id, item)
    this.emit('created', store)
    return await this.getItem(id)
  }

  async createDownloadTask({ key, url, headers, localPath }) {
    const item = await this.createDownloadItem(key, url, localPath)
    // @TODO 并发
    return new Promise((resolve, reject) => {
      const request = Request({
        url: url,
        headers: headers,
      })

      const localStream = Fs.createWriteStream(localPath)
      request.pipe(localStream)

      let transferred = 0
      let percentage = 0
      let total = 0

      request.on('response', response => {
        total = window.parseInt(response.headers['content-length'], 10)
        this.setItem(item.id, {
          total: total,
        }).then(() => {
          this.emit('change', item.id)
        })
      })

      const calTrans = transferred => {
        const newPercentage = (transferred / total).toFixed(2)
        if (percentage !== newPercentage) {
          percentage = newPercentage
          this.setItem(item.id, { total: total, transferred: transferred }).then(() => {
            this.emit('change', item.id)
          })
        }
      }

      const throttleChunk = throttle(calTrans, 100)

      request.on('data', chunk => {
        transferred += chunk.length
        if (transferred === total) {
          calTrans(transferred)
        } else {
          throttleChunk(transferred)
        }
      })

      request.on('error', error => {
        reject(error)
      })

      localStream.once('finish', () => {
        this.setItem(item.id, {
          status: 'complete',
          endTime: moment().unix(),
        }).then(() => {
          request.removeAllListeners()
          resolve('success')
          this.emit('change', item.id)
        })
      })
    })
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
        store.data = append(item, store.data)
      }
      return await localforage.setItem(this.storeKey, store)
    }
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
