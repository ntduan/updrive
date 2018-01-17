import {
  tail,
  head,
  pipe,
  uniq,
  range,
  path,
  split,
  map,
  zipObj,
  compose,
  objOf,
  ifElse,
  isEmpty,
  assoc,
  replace,
  converge,
  always,
  prop,
  concat,
  identity,
  __,
  equals,
} from 'ramda'
import { readFileSync, createReadStream, createWriteStream, readdirSync, statSync, mkdirSync, existsSync } from 'fs'
import Request from 'request'
import Path from 'path'
import mime from 'mime'
import upyun from 'upyun'
// import axios from 'axios'

import { mandatory, base64, md5sum, sleep, isDir, getLocalName, getAuthorizationHeader } from '@/api/tool'
import Download from '@/api/download'
import UpyunFtp from '@/api/upyunFtp'

class UpyunClient {
  constructor(bucketName, operatorName, password) {
    this.bucketName = bucketName
    this.operatorName = operatorName
    this.passwordMd5 = md5sum(password)
    this.ftp = new UpyunFtp(bucketName, operatorName, password)
  }

  request(input, config = {}, responseHandle = response => response) {
    const url = this.getUrl(input)
    config.headers = { ...config.headers, ...this.getHeaders(url, config.method) }
    return window
      .fetch(url, config)
      .then(res => res.text())
      .then(responseHandle)
  }

  // requestWithAxios(input, config = {}, responseHandle = response => response.data) {
  //   const url = this.getUrl(input)
  //   config.url = url
  //   config.headers = { ...config.headers, ...this.getHeaders(url, config.method) }
  //   return axios({
  //     responseType: 'text',
  //     ...config,
  //   }).then(responseHandle)
  // }

  getUrl(input) {
    const uri = typeof input === 'object' ? input.uri : input
    const search = typeof input === 'object' ? input.search : ''
    const urlObject = new URL(`${this.bucketName}${uri}`, `https://v0.api.upyun.com`)
    if (search) urlObject.search = search
    return urlObject.href
  }

  getHeaders(url, method = 'GET') {
    return {
      ...getAuthorizationHeader({
        passwordMd5: this.passwordMd5,
        operatorName: this.operatorName,
        method: method,
        url,
      }),
    }
  }

  makeRequestOpts({ search = '', uri = '', method, headers = {} } = {}) {
    const url = this.getUrl(uri, { search })

    const _headers = { ...headers, ...this.getHeaders(url, method) }

    return {
      method,
      url,
      headers: _headers,
    }
  }

  // 遍历目录
  async traverseDir(uris = '', opts = {}) {
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
            if (dirData && dirData.data && dirData.data.length)
              await parseDir(dirData.data.map(fileObj => fileObj.uri), fromPath + Path.basename(_path) + '/')
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

    await parseDir(uris)

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
  async upload(uri = '', localFilePath = '', relativePath = '', localFileStat = {}, onChange) {
    const size = localFileStat.size
    let total = 0
    let percentage = 0
    const filename = Path.basename(localFilePath)
    const uploadUri = uri + relativePath + filename
    const id = base64(`file:${uploadUri}date:${+new Date()}`)
    const localFilePathReadStream = createReadStream(localFilePath)
    onChange({
      id,
      type: 'upload',
      status: '1',
      localFilePath,
      remoteQuery: uploadUri,
      filename,
      percentage,
      size,
      done: total,
      abort: localFilePathReadStream.destroy.bind(localFilePathReadStream),
    })

    return new Promise((resolve, reject) => {
      const _request = Request(this.makeRequestOpts({ method: 'PUT', uri: uploadUri }), (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode !== 200) return reject(body)
        console.info(`文件: ${localFilePath} 上传成功`, { body: response.body, statusCode: response.statusCode })
        return resolve(body)
      })

      let isEnd = false // close 时 是否需要中断 request
      localFilePathReadStream
        .on('data', chunk => {
          total += chunk.length
          const newPercentage = Math.floor(total / size * 100) / 100
          if (percentage !== newPercentage) {
            percentage = newPercentage
            console.info(`正在上传：${filename} ${percentage}`)
            onChange({ id, percentage, done: total })
          }
        })
        .on('close', arg => {
          if (!isEnd) _request.abort()
        })
        .on('end', arg => {
          isEnd = true
        })
        .pipe(_request)
    })
      .then(body => {
        onChange({ id, status: '2' })
        return Promise.resolve(body)
      })
      .catch(error => {
        onChange({ id, status: '-1' })
        return Promise.reject(error)
      })
  }

  // 删除文件
  async deleteFile(uri) {
    return this.request(uri, { method: 'DELETE' })
  }

  // 下载单个文件
  async downloadFile(localPath, uri, onChange) {
    if (!uri && !existsSync(localPath)) return Promise.resolve(mkdirSync(localPath))
    const url = this.getUrl(uri)
    const headers = this.getHeaders(url, 'GET')
    const download = new Download()
    download.startDownload({
      method: 'GET',
      url: url,
      headers: headers,
    })
    // let total = 0
    // let percentage = 0
    // const filename = Path.basename(localPath)
    // const id = base64(`file:${uri};date:${+new Date()}`)

    // return new Promise((resolve, reject) => {
    //   Request(this.makeRequestOpts({ method: 'GET', uri })).on('response', res => {
    //     const size = parseInt(res.headers['content-length'], 10)
    //     onChange({
    //       id,
    //       type: 'upload',
    //       status: '1',
    //       localPath,
    //       remoteQuery: uri,
    //       filename,
    //       percentage,
    //       size,
    //       done: total,
    //     })

    //     res
    //       .on('data', chunk => {
    //         total += chunk.length
    //         const newPercentage = Math.floor(total / size * 100) / 100
    //         if (percentage !== newPercentage) {
    //           percentage = newPercentage
    //           console.info(`正在下载：${filename} ${percentage}`)
    //           onChange({ id, percentage, done: total })
    //         }
    //       })
    //       .pipe(
    //         createWriteStream(localPath).on('close', () => {
    //           resolve()
    //           console.info('下载完成')
    //         }),
    //       )
    //   })
    // })
    //   .then(result => {
    //     onChange({ id, status: '2' })
    //     return Promise.resolve(result)
    //   })
    //   .catch(error => {
    //     onChange({ id, status: '-1' })
    //     return Promise.reject(error)
    //   })
  }

  // HEAD 请求
  async head(uri) {
    return this.request(uri, { method: 'HEAD' }, response => response.headers)
  }

  // GET 请求
  async get(uri) {
    return this.request(uri, { method: 'GET' })
  }

  // 授权认证
  async checkAuth() {
    return this.request({ search: '?usage', uri: '/' })
  }

  // 获取目录列表信息
  async getListDirInfo(uri = '/') {
    return this.request(uri, { method: 'GET' }).then(
      compose(
        assoc('path', uri),
        ifElse(
          isEmpty,
          () => ({ data: [] }),
          compose(
            objOf('data'),
            compose(
              map(obj => {
                obj.filetype = obj.folderType === 'F' ? '' : mime.getType(obj.filename)
                obj.uri = uri + obj.filename + (obj.folderType === 'F' ? '/' : '')
                return obj
              }),
              map(compose(zipObj(['filename', 'folderType', 'size', 'lastModified']), split(/\t/))),
              split(/\n/),
            ),
          ),
        ),
      ),
    )
  }

  // 创建目录
  async createFolder(uri = '', folderName = '') {
    return this.request(`${uri}${folderName}/`, { method: 'POST', headers: { folder: true } })
  }

  // 上传文件
  // @TODO 控制并发数量
  async uploadFiles(uri, localFilePaths = [], onChange) {
    const errorStack = []
    const result = []
    // 广度优先遍历
    let list = localFilePaths.slice().map(path => ({ localFilePath: path, relativePath: '' }))

    while (list.length) {
      const node = list.shift()
      const { localFilePath, relativePath } = node
      if (statSync(localFilePath).isDirectory() && readdirSync(localFilePath).length) {
        list = list.concat(
          readdirSync(localFilePath).map(name => ({
            localFilePath: Path.join(localFilePath, name),
            relativePath: relativePath + Path.basename(localFilePath) + '/',
          })),
        )
      } else {
        result.push(node)
      }
    }

    for (const pathObj of result) {
      try {
        const localFileStat = statSync(pathObj.localFilePath)
        localFileStat.isFile()
          ? await this.upload(uri, pathObj.localFilePath, pathObj.relativePath, localFileStat, onChange)
          : await this.createFolder(uri, pathObj.relativePath + Path.basename(pathObj.localFilePath))
      } catch (err) {
        console.error(`上传失败：${err}`)
        errorStack.push(uri)
      }
    }
    return errorStack
  }

  // 删除多个文件
  // @TODO 控制并发数量
  async deleteFiles(uris) {
    const errorStack = []
    const waitDeleteInit = await this.traverseDir(uris, { reverse: true })

    for (const uri of waitDeleteInit) {
      try {
        await this.deleteFile(uri)
      } catch (err) {
        console.error(`删除失败：${err}`)
        errorStack.push(uri)
      }
    }
    return errorStack
  }

  // 下载文件
  // @TODO 控制并发数量
  async downloadFiles(destPath, uri, onChange) {
    const errorStack = []
    const dir = await this.traverseDir(uri, { relative: true })
    const dirAll = dir.map(pathObj => {
      return {
        uri: isDir(pathObj.absolutePath) ? '' : pathObj.absolutePath,
        localPath: Path.join(
          getLocalName(Path.join(destPath, pipe(prop('relativePath'), split('/'), head)(pathObj))),
          ...pipe(prop('relativePath'), split('/'), tail)(pathObj),
        ),
      }
    })
    for (const pathObj of dirAll) {
      try {
        await this.downloadFile(pathObj.localPath, pathObj.uri, onChange)
      } catch (err) {
        console.error(`下载失败：${err}`)
        errorStack.push(uri)
      }
    }
    return errorStack
  }

  // 重命名文件
  async renameFile(oldPath, newPath) {
    await this.ftp.renameFile(oldPath, newPath)
  }
}

export default UpyunClient
