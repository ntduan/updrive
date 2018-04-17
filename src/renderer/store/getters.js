import { path, last } from 'ramda'

export const baseHref = state => {
  return 'http://' + path(['auth', 'user', 'bucketName'])(state) + '.b0.upaiyun.com/'
}

// upyunClient 对象
export const upyunClient = state => {
  return path(['auth', 'user', 'client'], state) || null
}

// 获取 upyun api url
export const getUpyunApiUrl = (state, getters) => uri => {
  return getters.upyunClient.getUrl(uri)
}

// download 对象
export const job = state => {
  return path(['task', 'job'], state) || null
}
