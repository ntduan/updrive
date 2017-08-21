import { replace, compose } from 'ramda';
import Crypto from 'crypto';
import Path from 'path'
import { URL } from 'url';

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

