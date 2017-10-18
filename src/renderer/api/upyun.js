import { tail, head, pipe, uniq, range, path, split, map, zipObj, compose, objOf, ifElse, isEmpty, assoc, replace, converge, always, prop, concat, identity, __, equals } from 'ramda';
import { createReadStream, createWriteStream, readdirSync, statSync, existsSync, mkdirSync } from 'fs'
import Request from 'request'
import Path from 'path'
import { URL } from 'url'
import mime from 'mime'

import { mandatory, getAuthorizationHeader, base64, md5sum, getUri, standardUri, sleep, getFilenameFromUrl, isDir, getHeaderSign } from './tool.js'
import Store from '@/store' // 不能解构, 因为这时 store 还没完成初始化
import upyun from 'upyun'

mime.default_type = ''

export const getRequestOpts = ({ user = path(['state', 'user'], Store), search = '', toUrl = '', method = 'GET', headers = {} } = {}) => {
  const urlObject = new URL(toUrl, `http://${Store.getters.apiHost}/${user.bucketName}/`)
  if (search) urlObject.search = search

  const url = urlObject.href

  const authHeader = getAuthorizationHeader({ ...user, method: method, url })

  return {
    method,
    url,
    headers: {
      ...authHeader,
      ...headers,
    },
  }
}

const clients = {}

function getClient(user = path(['state', 'user'], Store)) {
  if (clients[user.bucketName]) {
    return clients[user.bucketName]
  }

  const service = new upyun.Service(user.bucketName, user.operatorName, user.password)
  const client = new upyun.Client(service, getHeaderSign)
  clients[user.bucketName] = client
  return client
}

// 授权认证
export const checkAuth = user => {
  const client = getClient(user)
  return client.usage();
}

// 获取目录列表信息
export const getListDirInfo = (remotePath = '/') => {
  const client = getClient()
  return client.listDir(remotePath).then(data => {
    return compose(
      assoc('path', remotePath),
      ifElse(
        isEmpty,
        () => ({ data: []}) ,
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

// 上传文件
// relativePath 是相对当前目录的路径
export const upload = (remotePath = '', localFilePath = '', relativePath = '', localFileStat = {}) => {
  const size = localFileStat.size
  let total = 0
  let percentage = 0
  const filename = Path.basename(localFilePath)
  const toUrl = remotePath + relativePath + filename
  const id = base64(`file:${toUrl};date:${+(new Date())}`)
  const localFilePathReadStream = createReadStream(localFilePath)
  Store.commit({
    type: 'ADD_TASK',
    data: {
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
    }
  })
  return new Promise((resolve, reject) => {
    const _request = Request(
      getRequestOpts({ method: 'PUT', toUrl }),
      (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode !== 200) return reject(body)
        console.info(`文件: ${localFilePath} 上传成功`, { body: response.body, statusCode: response.statusCode })
        return resolve(body)
      }
    )

    let isEnd = false // close 时 是否需要中断 request
    localFilePathReadStream
      .on('data', chunk => {
        total += chunk.length
        const newPercentage = Math.floor(((total / size) * 100)) / 100
        if (percentage !== newPercentage) {
          percentage = newPercentage
          console.info(`正在上传：${filename} ${percentage}`)
          Store.commit({ type: 'UPDATE_TASK', data: { id, percentage, done: total } })
        }
      })
      .on('close', (arg) => {
        if (!isEnd) _request.abort()
      })
      .on('end', (arg) => {
        isEnd = true
      })
      .pipe(_request)
  })
    .then(body => {
      Store.commit({ type: 'UPDATE_TASK', data: { id, status: '2' } })
      return Promise.resolve(body)
    })
    .catch(error => {
      Store.commit({ type: 'UPDATE_TASK', data: { id, status: '-1' } })
      return Promise.reject(error)
    })
}

// 创建目录
export const createFolder = (remotePath = '', folderName = '') => {
  return new Promise((resolve, reject) => {
    Request(
      getRequestOpts({ method: 'POST', toUrl: remotePath + folderName + '/', headers: { folder: true } }),
      (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode !== 200) return reject(body)
        console.info(`文件夹: ${folderName} 创建成功`, { body: response.body, statusCode: response.statusCode })
        return resolve(body)
      })
  })
}

// 上传文件
// @TODO 控制并发数量
export const uploadFiles = async (remotePath, localFilePaths = []) => {
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
      await upload(remotePath, pathObj.localFilePath, pathObj.relativePath, localFileStat) :
      await createFolder(remotePath, pathObj.relativePath + Path.basename(pathObj.localFilePath))
  }
}

// 删除文件
export const deleteFile = remotePath => {
  return new Promise((resolve, reject) => {
    Request(
      getRequestOpts({ method: 'DELETE', toUrl: remotePath }),
      (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode !== 200) return reject(body)
        console.info(`文件: ${remotePath} 删除成功`, { body: response.body, statusCode: response.statusCode })
        return resolve(body)
      }
    )
  })
}

// 遍历目录
export const traverseDir = async (remotePaths = '', opts = {}) => {
  let files = []
  // 递归遍历目录
  const parseDir = async (paths, fromPath = '') => {
    for (const path of paths) {
      try {
        if (isDir(path)) {
          files.push({
            absolutePath: path,
            relativePath: fromPath + Path.basename(path) + '/',
          })
          const dirData = await getListDirInfo(path)
          if (dirData && dirData.data && dirData.data.length) await parseDir(dirData.data.map(fileObj => fileObj.uri), fromPath + Path.basename(path) + '/')
        } else {
          files.push({
            absolutePath: path,
            relativePath: fromPath + Path.basename(path),
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

export const checkList = async (remoteFilePath = '') => {
  try {
    const data = await getListDirInfo(remoteFilePath)
    if (!data.data.length) return true
    return false
  } catch (err) {
    return false
  }
}

// 轮循
export const polling = async (func, times = 10, space = 500) => {
  for (const i of Array(times).keys()) {
    await sleep(space)
    const result = await func()
    if (result) return true
  }
  return false
}

// 删除多个文件
// @TODO 控制并发数量
export const deleteFiles = async remotePaths => {
  const waitDeleteInit = await traverseDir(remotePaths, { reverse: true })
  const deleteError = []

  for (const remoteFilePath of waitDeleteInit) {
    try {
      await deleteFile(remoteFilePath)
    } catch (err) {
      console.error(`删除失败：path: ${remoteFilePath}, error: ${err}`)
      deleteError.push(remoteFilePath)
    }
  }
  return deleteError
}


// 递归获取不重复名字
export const getLocalName = (fileName = '', init = true) => {
  if (!existsSync(fileName)) return fileName
  const match = /\((\d+)\)$/
  if (init && match.test(fileName)) {
    return getLocalName(fileName.replace(match, (match, p1) => `(${parseInt(p1) + 1})`), false)
  } else {
    return getLocalName(fileName + '(1)', false)
  }
}

// 下载单个文件
export const downloadFile = (localPath, downloadPath) => {
  if (!downloadPath && !existsSync(localPath)) return Promise.resolve(mkdirSync(localPath))

  let total = 0
  let percentage = 0
  const filename = Path.basename(localPath)
  const id = base64(`file:${downloadPath};date:${+(new Date())}`)

  return new Promise((resolve, reject) => {
    Request(downloadPath)
      .on('response', res => {
        const size = parseInt(res.headers['content-length'], 10)
        Store.commit({
          type: 'ADD_TASK',
          data: {
            id,
            type: 'upload',
            status: '1',
            localPath,
            remoteQuery: downloadPath,
            filename,
            percentage,
            size,
            done: total,
          }
        })

        res.on('data', chunk => {
          total += chunk.length
          const newPercentage = Math.floor(((total / size) * 100)) / 100
          if (percentage !== newPercentage) {
            percentage = newPercentage
            console.info(`正在下载：${filename} ${percentage}`)
            Store.commit({ type: 'UPDATE_TASK', data: { id, percentage, done: total } })
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
      Store.commit({ type: 'UPDATE_TASK', data: { id, status: '2' } })
      return Promise.resolve(result)
    })
    .catch(error => {
      Store.commit({ type: 'UPDATE_TASK', data: { id, status: '-1' } })
      return Promise.reject(error)
    })
}

// 下载文件
// @TODO 控制并发数量
export const downloadFiles = async (destPath, downloadPath) => {
  const dir = await traverseDir(downloadPath, { relative: true })
  const dirAll = dir.map(path => {
    return {
      downloadPath: isDir(path.absolutePath) ? '' : (new URL(path.absolutePath, Store.getters.baseHref).href),
      localPath: Path.join(
        getLocalName(
          Path.join(
            destPath,
            pipe(prop('relativePath'), split('/'), head)(path),
          )
        ),
        ...pipe(prop('relativePath'), split('/'), tail)(path)
      )
    }
  })
  for (const pathObj of dirAll) {
    await downloadFile(pathObj.localPath, pathObj.downloadPath)
  }
}

// HEAD 请求
export const getFileHead = (filePath) => {
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
