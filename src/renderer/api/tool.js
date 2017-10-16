import { replace, compose } from 'ramda'
import Crypto from 'crypto'
import Path from 'path'
import { URL } from 'url'
import Moment from 'moment'
import Message from 'iview/src/components/message'
import { sign } from 'upyun'

export const errorHandler = (error) => {
  if (error && error.message) {
    Message.error(error.message)
  } else {
    Message.error(error)
  }
  return Promise.reject(error)
}

export const mandatory = (parameter) => {
  throw new Error(parameter ? `Missing parameter ${parameter}` : 'Missing parameter')
}

export const md5sum = (data = '') => Crypto.createHash('md5').update(data, 'utf8').digest('hex')

export const hmacSha1 = (
  secret = mandatory('secret'),
  data = mandatory('data'),
) => Crypto.createHmac('sha1', secret).update(data, 'utf8').digest().toString('base64')

export const base64 = (str = '') => (new Buffer(str).toString('base64'))

export const standardUri = (path = '') => {
  const pathStr = Array.isArray(path) ? path.join('/') : path
  return compose(replace(/(\/*)$/, '/'), replace(/^(\/*)/, '/'))(pathStr)
}

export const makeSign = ({
  method = mandatory('method'),
  uri = mandatory('uri'),
  date = mandatory('date'),
  passwordMd5 = mandatory('passwordMd5'),
  operatorName = mandatory('operatorName'),
} = {}) => {
  return (`UPYUN ${operatorName}:${hmacSha1(passwordMd5, [method, uri, date].join('&'))}`)
}

export const getUri = (bucketName = '') => (path = '') => {
  return `/${bucketName}${standardUri(path)}`
}

export function getHeaderSign(service, method, path) {
  return Promise.resolve(sign.getHeaderSign(service, method, path))
}

// @TODO 实现 Content-MD5 校验
export const getAuthorizationHeader = ({
  method = 'GET',
  url = '',
  passwordMd5 = mandatory('passwordMd5'),
  operatorName = mandatory('operatorName'),
} = {}) => {
  const date = (new Date()).toGMTString()

  return {
    Authorization: makeSign({
      operatorName,
      passwordMd5,
      date,
      uri: new URL(url).pathname,
      method: method.toUpperCase(),
    }),
    Date: date,
  }
}

export const sleep = (ms = 0) => {
  return new Promise(r => setTimeout(r, ms))
}

export const isDir = (path = '') => {
  return /\/$/.test(path)
}

export const getFilenameFromUrl = (url = '') => {
  return Path.basename(decodeURIComponent(new URL(url).pathname))
}

export const timestamp = (input, pattern = 'YYYY-MM-DD HH:mm:ss') => (isNaN(input) ? input : Moment.unix(input).format(pattern))

export const digiUnit = (input) => {
  if (input === '-') return ''
  if (isNaN(input)) return input
  if (+input === 0) return '0 B'
  const getSizes = () => ['B', 'KB', 'MB', 'GB', 'TB']
  const getByte = input => Number(Math.abs(input))
  const getIndex = byte => Math.floor(Math.log(byte) / Math.log(1024))
  const getUnitIndex = (sizes = []) => index => (index > (sizes.length - 1) ? (sizes.length - 1) : index)
  const getResult = sizes => byte => index => `${(byte / Math.pow(1024, index)).toFixed(1)} ${sizes[index]}`
  return compose(compose(compose(getResult, getSizes)(), getByte)(input), compose(compose(getUnitIndex, getSizes)(), getIndex, getByte))(input)
}

export const uploadStatus = (input) => {
  return ({ '0': '未开始', '1': '进行中', '2': '已完成', '-1': '出错', '-2': '已取消' })[input]
}
