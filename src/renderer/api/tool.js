import { replace, compose } from 'ramda'
import Crypto from 'crypto'
import Path from 'path'
import { URL } from 'url'
import Moment from 'moment'
import { existsSync } from 'fs'
import Message from '@/api/message'

export const errorHandler = error => {
  if (error && error.message) {
    Message.error(error.message)
  } else {
    Message.error(error)
  }
  return Promise.reject(error)
}

export const mandatory = parameter => {
  throw new Error(parameter ? `Missing parameter ${parameter}` : 'Missing parameter')
}

export const md5sum = (data = '') =>
  Crypto.createHash('md5')
    .update(data, 'utf8')
    .digest('hex')

export const hmacSha1 = (secret = mandatory('secret'), data = mandatory('data')) =>
  Crypto.createHmac('sha1', secret)
    .update(data, 'utf8')
    .digest()
    .toString('base64')

export const base64 = (str = '') => new Buffer(str).toString('base64')

export const sleep = (ms = 0) => {
  return new Promise(r => setTimeout(r, ms))
}

export const isDir = (path = '') => {
  return /\/$/.test(path)
}

export const timestamp = (input, pattern = 'YYYY-MM-DD HH:mm:ss') =>
  isNaN(input) ? input : Moment.unix(input).format(pattern)

export const digiUnit = input => {
  if (input === '-') return ''
  if (isNaN(input)) return input
  if (+input === 0) return '0 B'
  const getSizes = () => ['B', 'KB', 'MB', 'GB', 'TB']
  const getByte = input => Number(Math.abs(input))
  const getIndex = byte => Math.floor(Math.log(byte) / Math.log(1024))
  const getUnitIndex = (sizes = []) => index => (index > sizes.length - 1 ? sizes.length - 1 : index)
  const getResult = sizes => byte => index => `${(byte / Math.pow(1024, index)).toFixed(1)} ${sizes[index]}`
  return compose(
    compose(compose(getResult, getSizes)(), getByte)(input),
    compose(compose(getUnitIndex, getSizes)(), getIndex, getByte),
  )(input)
}

export const uploadStatus = input => {
  return { '0': '未开始', '1': '进行中', '2': '已完成', '-1': '出错', '-2': '已取消' }[input]
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
