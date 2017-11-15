import { tail, head, pipe, uniq, range, path, split, map, zipObj, compose, objOf, ifElse, isEmpty, assoc, replace, converge, always, prop, concat, identity, __, equals } from 'ramda'
import { createReadStream, createWriteStream, readdirSync, statSync, mkdirSync, existsSync } from 'fs'
import Request from 'request'
import Path from 'path'
import { URL, parse } from 'url'
import mime from 'mime'
import upyun from 'upyun'

import { mandatory, base64, md5sum, sleep, isDir, getLocalName } from '@/api/tool'
import UpyunFtp from '@/api/upyunFtp'

mime.default_type = ''

export default class UpyunClient {
  constructor(bucketName, operatorName, password) {
    const service = new upyun.Service(bucketName, operatorName, password)
    this.api = new upyun.Client(service)
    this.ftp = new UpyunFtp(bucketName, operatorName, password)
  }

  // 遍历目录
  async traverseDir(remotePaths = '', opts = {}) {
    let files = []
    // 递归遍历目录
    const parseDir = async (paths, fromPath = '') => {
      for (const _path of paths) {
        try {
          if (isDir(_path)) {
            files.push({
              absolutePath: _path,
              relativePath: fromPath + Path.basename(_path) + '/',
            })
            const dirData = await this.getListDirInfo(_path)
            if (dirData && dirData.data && dirData.data.length) await parseDir(dirData.data.map(fileObj => fileObj.uri), fromPath + Path.basename(_path) + '/')
          } else {
            files.push({
              absolutePath: _path,
              relativePath: fromPath + Path.basename(_path),
            })
          }
        } catch (err) {
          console.error(err)
        }
      }
    }

    await parseDir(remotePaths)

    // 文件顺序
    if (opts.reverse === true) {
      files = files.reverse()
    }

    if (opts.type === 'file') {
      files = files.filter(f => !isDir(f.absolutePath))
    }

    if (opts.type === 'folder') {
      files = files.filter(f => isDir(f.absolutePath))
    }

    if (opts.relative !== true) {
      files = files.map(o => o.absolutePath)
    }

    return files
  }

  // 上传文件
  // relativePath 是相对当前目录的路径
  async upload(remotePath = '', localFilePath = '', relativePath = '', localFileStat = {}, onChange) {
    const size = localFileStat.size
    let total = 0
    let percentage = 0
    const filename = Path.basename(localFilePath)
    const toUrl = remotePath + relativePath + filename
    const id = base64(`file:${toUrl}date:${+(new Date())}`)
    const localFilePathReadStream = createReadStream(localFilePath)
    onChange({
      id,
      type: 'upload',
      status: '1',
      localFilePath,
      remoteQuery: toUrl,
      filename,
      percentage,
      size,
      done: total,
      abort: localFilePathReadStream.destroy.bind(localFilePathReadStream)
    })

    localFilePathReadStream
      .on('data', chunk => {
        // TODO: progress is imprecise, now is read from disk progress
        total += chunk.length
        const newPercentage = Math.floor(((total / size) * 100)) / 100
        if (percentage !== newPercentage) {
          percentage = newPercentage
          console.info(`正在上传：${filename} ${percentage}`)
          onChange({ id, percentage, done: total })
        }
      })
    const result = this.api.putFile(toUrl, localFilePathReadStream)
      .then(result => {
        onChange({ id, status: '2' })
        return Promise.resolve(result)
      })
      .catch(error => {
        onChange({ id, status: '-1' })
        return Promise.reject(error)
      })
    return result
  }

  // 删除文件
  async deleteFile(remotePath) {
    return this.api.deleteFile(remotePath).then((result) => {
      if (result !== true) {
        return Promise.reject(new Error(`delete file: ${remotePath} failed.`))
      }
    })
  }

  // 下载单个文件
  async downloadFile(localPath, downloadPath, onChange) {
    if (!downloadPath && !existsSync(localPath)) return Promise.resolve(mkdirSync(localPath))

    let total = 0
    let percentage = 0
    const filename = Path.basename(localPath)
    const id = base64(`file:${downloadPath};date:${+(new Date())}`)

    return new Promise((resolve, reject) => {
      Request(downloadPath)
        .on('response', res => {
          const size = parseInt(res.headers['content-length'], 10)
          onChange({
            id,
            type: 'upload',
            status: '1',
            localPath,
            remoteQuery: downloadPath,
            filename,
            percentage,
            size,
            done: total,
          })

          res.on('data', chunk => {
            total += chunk.length
            const newPercentage = Math.floor(((total / size) * 100)) / 100
            if (percentage !== newPercentage) {
              percentage = newPercentage
              console.info(`正在下载：${filename} ${percentage}`)
              onChange({ id, percentage, done: total })
            }
          })
            .pipe(createWriteStream(localPath)
              .on('close', () => {
                resolve()
                console.info('下载完成')
              })
            )
        })
    })
      .then(result => {
        onChange({ id, status: '2' })
        return Promise.resolve(result)
      })
      .catch(error => {
        onChange({ id, status: '-1' })
        return Promise.reject(error)
      })
  }

  // HEAD 请求
  async getFileHead(filePath) {
    return new Promise((resolve, reject) => {
      Request({
        method: 'HEAD',
        url: filePath,
      }, (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode !== 200) return reject(body)
        return resolve(response.headers)
      })
    })
  }

  // 授权认证
  async checkAuth(user) {
    return this.api.usage()
  }

  // 获取目录列表信息
  async getListDirInfo(remotePath = '/') {
    return this.api.listDir(remotePath).then(data => {
      return compose(
        assoc('path', remotePath),
        ifElse(
          isEmpty,
          () => ({ data: [] }),
          compose(
            objOf('data'),
            map(file => {
              const isDir = file.type === 'F'
              return {
                filetype: isDir ? '' : mime.lookup(file.name),
                filename: file.name,
                folderType: file.type,
                size: file.size,
                lastModified: file.time,
                uri: remotePath + file.name + (isDir ? '/' : '')
              }
            }),
          )
        )
      )(data.files)
    })
  }

  // 创建目录
  async createFolder(remotePath = '', folderName = '') {
    const dirPath = remotePath + folderName + '/'
    return this.api.makeDir(dirPath).then((result) => {
      if (result !== true) {
        return Promise.reject(new Error(`create floder: ${folderName} failed`))
      }
    })
  }

  // 上传文件
  // @TODO 控制并发数量
  async uploadFiles(remotePath, localFilePaths = [], onChange) {
    const result = []
    // 广度优先遍历
    let list = localFilePaths.slice().map(path => ({ localFilePath: path, relativePath: '' }))

    while (list.length) {
      const node = list.shift()
      const { localFilePath, relativePath } = node
      if (statSync(localFilePath).isDirectory() && readdirSync(localFilePath).length) {
        list = list.concat(readdirSync(localFilePath).map(name => ({
          localFilePath: Path.join(localFilePath, name),
          relativePath: relativePath + Path.basename(localFilePath) + '/',
        })))
      } else {
        result.push(node)
      }
    }

    for (const pathObj of result) {
      const localFileStat = statSync(pathObj.localFilePath)
      localFileStat.isFile() ?
        await this.upload(remotePath, pathObj.localFilePath, pathObj.relativePath, localFileStat, onChange) :
        await this.createFolder(remotePath, pathObj.relativePath + Path.basename(pathObj.localFilePath))
    }
  }

  // 删除多个文件
  // @TODO 控制并发数量
  async deleteFiles(remotePaths) {
    const waitDeleteInit = await this.traverseDir(remotePaths, { reverse: true })
    const deleteError = []

    for (const remoteFilePath of waitDeleteInit) {
      try {
        await this.deleteFile(remoteFilePath)
      } catch (err) {
        console.error(`删除失败：path: ${remoteFilePath}, error: ${err}`)
        deleteError.push(remoteFilePath)
      }
    }
    return deleteError
  }

  // 下载文件
  // @TODO 控制并发数量
  async downloadFiles(destPath, downloadPath, baseHref, onChange) {
    const deleteError = []
    const dir = await this.traverseDir(downloadPath, { relative: true })
    const dirAll = dir.map(pathObj => {
      return {
        downloadPath: isDir(pathObj.absolutePath) ? '' : (new URL(pathObj.absolutePath, baseHref).href),
        localPath: Path.join(
          getLocalName(
            Path.join(
              destPath,
              pipe(prop('relativePath'), split('/'), head)(pathObj),
            )
          ),
          ...pipe(prop('relativePath'), split('/'), tail)(pathObj)
        )
      }
    })
    for (const pathObj of dirAll) {
      try {
        await this.downloadFile(pathObj.localPath, pathObj.downloadPath, onChange)
      } catch (err) {
        console.error(`下载失败：path: ${downloadPath}, error: ${err}`)
        deleteError.push(downloadPath)
      }
    }
    return deleteError
  }

  // 重命名文件
  async renameFile(oldPath, newPath) {
    await this.ftp.renameFile(oldPath, newPath)
  }

}



