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
import axios from 'axios'

import { mandatory, base64, md5sum, sleep, isDir, getLocalName, getAuthorizationHeader } from '@/api/tool'
import UpyunFtp from '@/api/upyunFtp'

export default {
  bucketName: '',
  operatorName: '',
  passwordMd5: '',
  ftp: Object.create(UpyunFtp),

  setup(bucketName, operatorName, password) {
    this.bucketName = bucketName
    this.operatorName = operatorName
    this.passwordMd5 = md5sum(password)
    this.ftp.setup(bucketName, operatorName, password)
  },

  // // fetch 请求获取不了自定义响应头
  // requestWithFetch(input, config = {}, responseHandle = response => response) {
  //   const url = this.getUrl(input)
  //   config.headers = { ...config.headers, ...this.getHeaders(url, config.method) }
  //   return window
  //     .fetch(url, config)
  //     .then(res => res.text())
  //     .then(responseHandle)
  // },

  request(input, config = {}, responseHandle = response => response.data) {
    const url = this.getUrl(input)
    config.url = url
    config.headers = { ...config.headers, ...this.getHeaders(url, config.method) }
    return axios({
      responseType: 'text',
      ...config,
    }).then(responseHandle)
  },

  getUrl(input) {
    const uri = typeof input === 'object' ? input.uri : input
    const search = typeof input === 'object' ? input.search : ''
    const urlObject = new URL(`${this.bucketName}${uri}`, `https://v0.api.upyun.com`)
    if (search) urlObject.search = search
    return urlObject.href
  },

  getHeaders(url, method = 'GET') {
    return {
      ...getAuthorizationHeader({
        passwordMd5: this.passwordMd5,
        operatorName: this.operatorName,
        method: method,
        url,
      }),
    }
  },

  makeRequestOpts({ search = '', uri = '', method, headers = {} } = {}) {
    const url = this.getUrl(uri, { search })

    const _headers = { ...headers, ...this.getHeaders(url, method) }

    return {
      method,
      url,
      headers: _headers,
    }
  },

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
  },


  // HEAD 请求
  async head(uri) {
    return this.request(uri, { method: 'HEAD' }, response => response.headers)
  },

  // GET 请求
  async get(uri) {
    return this.request(uri, { method: 'GET' })
  },

  // 授权认证
  async checkAuth() {
    return this.request({ search: '?usage', uri: '/' })
  },

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
  },

  // 创建目录
  async createFolder(location = '', folderName = '') {
    return this.request(`${location}${folderName}/`, { method: 'POST', headers: { folder: true } })
  },

  // 上传文件
  async uploadFiles(uri, localFilePaths = [], jobObj) {
    const results = []

    // 上传单个文件
    const uploadFile = async (uploadLocation, localFilePath) => {
      const localFileStat = statSync(localFilePath)
      const basename = Path.basename(localFilePath)
      if(!localFileStat.isFile()) return Promise.resolve(this.createFolder(uploadLocation, basename))
      const url = this.getUrl(uploadLocation + basename)
      const headers = { ...this.getHeaders(url, 'PUT') }
      return await jobObj.createUploadTask({
        url: url,
        headers: headers,
        localPath: localFilePath,
      })
    }

    // 广度优先遍历
    const uploadList = []
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
        uploadList.push(node)
      }
    }

    for (const pathObj of uploadList) {
      const uploadLocation = uri + pathObj.relativePath
      try {
        results.push({
          result: true,
          location: uploadLocation,
          localPath: pathObj.localFilePath,
          message: await uploadFile(uploadLocation, pathObj.localFilePath),
        })
      } catch (err) {
        console.error(err)
        results.push({
          result: false,
          location: uploadLocation,
          localPath: pathObj.localFilePath,
          message: err && err.message,
        })
      }
    }

    return results
  },

  // 删除文件
  async deleteFiles(uris) {
    const results = []
    const waitDeleteInit = await this.traverseDir(uris, { reverse: true })

    for (const uri of waitDeleteInit) {
      try {
        results.push({
          uri: uri,
          result: true,
          message: await this.request(uri, { method: 'DELETE' }),
        })
      } catch (err) {
        results.push({
          uri: uri,
          result: false,
          message: err && err.message,
        })
      }
    }

    return results
  },

  // 下载文件
  async downloadFiles(destPath, uris, jobObj) {
    // 下载单个文件
    const downloadFile = async (localPath, uri) => {
      if (!uri && !existsSync(localPath)) return Promise.resolve(mkdirSync(localPath))
      const url = this.getUrl(uri)
      const headers = { ...this.getHeaders(url, 'GET') }
      return await jobObj.createDownloadTask({
        url: url,
        headers: headers,
        localPath: localPath,
      })
    }

    const results = []

    const dir = await this.traverseDir(uris, { relative: true })
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
        results.push({
          uri: pathObj.uri,
          localPath: pathObj.localPath,
          result: true,
          message: await downloadFile(pathObj.localPath, pathObj.uri),
        })
      } catch (err) {
        results.push({
          uri: pathObj.uri,
          localPath: pathObj.localPath,
          result: false,
          message: err && err.message,
        })
      }
    }

    return results
  },

  // 重命名文件
  async renameFile(oldPath, newPath) {
    await this.ftp.renameFile(oldPath, newPath)
  },
}

