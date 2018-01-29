import Request from 'request'
import EventEmitter from 'events'
import Fs from 'fs'
import { basename } from 'path'
import { prepend, groupBy } from 'ramda'
import localforage from 'localforage'
import moment from 'moment'

import { base64, throttle } from '@/api/tool'

class Job extends EventEmitter {
  initStore = {
    version: 0.1,
    data: [],
  }

  type = {
    download: 'download', // 下载
    upload: 'upload', // 上传
  }

  status = {
    downloading: { name: '下载中', value: 'downloading' },
    uploading: { name: '上传中', value: 'uploading' },
    interrupted: { name: '已暂停', value: 'interrupted' },
    completed: { name: '下载完成', value: 'completed' },
    error: { name: '错误', value: 'error' },
  }

  constructor(keyPre, onChange) {
    super()
    this.storeKey = `${keyPre}-job`
    this.on('change', onChange)
  }

  async createDownloadItem(url, localPath) {
    const filename = basename(localPath)
    const startTime = moment().unix()
    const id = base64(`${filename}:${startTime}`)
    const item = {
      id: id, // 唯一ID
      url: url, // 远程路径
      localPath: localPath, // 下载本地路径
      startTime: startTime, // 下载开始时间
      filename: basename(localPath), // 下载的文件名
      status: this.status.downloading.value, // 下载状态: "downloading", "interrupted", "completed", "error"
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
    const _store = await this.getStore()
    const store = _store && _store.version === this.initStore.version ? _store : this.initStore
    const existedItemIndex = store.data.findIndex(_item => _item.id === id)
    if (~existedItemIndex) {
      store.data[existedItemIndex] = { ...item }
    } else {
      store.data = prepend(item, store.data)
    }
    return await localforage.setItem(this.storeKey, store)
  }

  async createDownloadTask({ url, headers, localPath }) {
    const item = await this.createDownloadItem(url, localPath)
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
          item.status = this.status.error.value
          item.errorMessage = error && error.message
          emitChange()
          reject(error)
        })

      const localStream = Fs.createWriteStream(localPath).once('finish', async () => {
        item.status = this.status.completed.value
        item.endTime = moment().unix()
        request.removeAllListeners()
        await this.setItem(item.id, item)
        emitChange()
        resolve('success')
      })

      request.pipe(localStream)
    })
  }

  async clearCompleted() {
    // return await localforage.removeItem(this.storeKey.completed)
  }

  async getStore() {
    return await localforage.getItem(this.storeKey)
  }
}

export default Job
