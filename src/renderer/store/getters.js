import { path } from 'ramda'
import { last } from 'ramda'

export const baseHref = state => {
  const bucketName = path(['user', 'bucketName'], state)
  return '//' + bucketName + '.b0.upaiyun.com/'
}

export const apiHost = state => {
  return 'v0.api.upyun.com'
}

export const ftpHost = state => {
  return 'v0.ftp.upyun.com'
}

export const backUri = state => {
  const backStack = path(['list', 'history', 'backStack'], state) || []
  return last(backStack)
}

export const forwardUri = state => {
  const forwardStack = path(['list', 'history', 'forwardStack'], state) || []
  return last(forwardStack)
}