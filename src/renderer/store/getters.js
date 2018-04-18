import { path, last } from 'ramda'

import { externalUrls as __externalUrls } from '@/api/tool'

export const bucketName = (state, getters) => {
  return path(['auth', 'user', 'bucketName'])(state) || ''
}

export const baseHref = (state, getters) => {
  return path(['profile', 'data', 'domain'])(state) || ''
}

export const externalUrls = (state, getters) => {
  return {
    domain: `https://console.upyun.com/services/${getters.bucketName}/domainsFile/`,
    createBucket: `https://console.upyun.com/services/create/file/`,
    ...__externalUrls,
  }
}

// upyunClient 对象
export const upyunClient = state => {
  return path(['auth', 'user', 'client'], state) || null
}

// 获取 upyun api url
export const getUpyunApiUrl = (state, getters) => uri => {
  return getters.upyunClient.getUrl(uri)
}

// job 对象
export const job = state => {
  return path(['task', 'job'], state) || null
}

// profile handler 对象
export const profile = state => {
  return path(['profile', 'handler'], state) || null
}
