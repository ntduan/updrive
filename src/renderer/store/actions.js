import { join, append, compose, unless, isEmpty } from 'ramda'

import { errorHandler, getFileType } from '@/api/tool.js'
import * as Types from '@/store/mutation-types'
import * as UpyunFtp from '@/api/upyunFtp.js'
import UpyunClient from '@/api/upyunClient.js'
import Message from '@/api/message.js'
import Session from '@/api/session.js'
import Notification from '@/api/notification'
import Router from '@/router'

export default {
  // 登录
  [Types.VERIFICATION_ACCOUNT]({ getters, commit }, payload) {
    const userInfo = {
      bucketName: payload.bucketName,
      operatorName: payload.operatorName,
      password: payload.password,
    }
    commit(Types.SET_USER_INFO, userInfo)

    return getters.upyunClient
      .checkAuth()
      .then(() => {
        Session.setUser(userInfo)
        return userInfo
      })
      .catch(error => {
        commit(Types.CLEAR_USER_INFO)
        Session.clear()
        return Promise.reject(error)
      })
  },
  // 获取文件目录信息
  [Types.GET_LIST_DIR_INFO]({ getters, commit }, { remotePath, spinner = true, action }) {
    if (spinner) commit({ type: Types.SET_LOADING_LIST, data: true })
    return getters.upyunClient
      .getListDirInfo(remotePath)
      .then(result => {
        commit({
          type: Types.SET_CURRENT_LIST,
          data: result,
          action: action,
        })
        return result
      })
      .catch(errorHandler)
  },
  // 创建目录
  [Types.CREATE_FOLDER]({ getters, commit, dispatch }, { remotePath, folderName }) {
    return getters.upyunClient
      .createFolder(remotePath, folderName)
      .then(() => Message.success('文件夹创建成功'))
      .then(() => dispatch({ type: Types.REFRESH_LIST, spinner: false }))
      .catch(errorHandler)
  },
  // 刷新当前目录
  [Types.REFRESH_LIST]({ state, getters, commit, dispatch }, { remotePath, spinner = true } = {}) {
    return dispatch({ type: Types.GET_LIST_DIR_INFO, remotePath: remotePath || state.list.dirInfo.path, spinner })
  },
  // 删除文件
  [Types.DELETE_FILE]({ getters, commit, dispatch }, { selectedPaths } = {}) {
    return getters.upyunClient
      .deleteFiles(selectedPaths)
      .then(results => {
        const isAllSuccess = !results.some(r => !r.result)
        if (isAllSuccess) {
          Message.success('删除成功')
        } else {
          for (const result of results) Message.warning(`删除失败：${result.uri}: ${result.message}`)
        }
      })
      .then(() => dispatch({ type: Types.REFRESH_LIST, spinner: false }))
      .catch(errorHandler)
  },
  // 重命名
  [Types.RENAME_FILE]({ getters, commit, dispatch }, { oldPath, newPath, isFolder } = {}) {
    return getters.upyunClient
      .renameFile(oldPath, newPath)
      .then(() => Message.success('操作成功'))
      .then(() => dispatch({ type: Types.REFRESH_LIST, spinner: false }))
      .catch(errorHandler)
  },
  // 下载文件
  [Types.DOWNLOAD_FILES]({ getters, commit, dispatch }, { destPath, downloadPath } = {}) {
    return (
      getters.upyunClient
        .downloadFiles(destPath, downloadPath, getters.job)
        .then(results => {
          const isAllSuccess = !results.some(r => !r.result)
          const notify = title =>
            Notification.notify(
              title,
              {
                body: '点击查看详情',
              },
              () => {
                commit('SELECT_TAB_KEY', { tabKey: 'download' })
                Router.push({ name: 'task' })
              },
            )

          if (isAllSuccess) {
            Message.success('下载成功')
            notify('下载成功')
          } else {
            for (const result of results) Message.warning(`下载失败：${result.uri}: ${result.message}`)
            notify('下载失败')
          }
          return dispatch(Types.SYNC_JOB_LIST)
        })
        .catch(errorHandler)
        // 同步错误信息
        .catch(() => dispatch(Types.SYNC_JOB_LIST))
    )
  },
  // 上传文件
  [Types.UPLOAD_FILES]({ getters, commit, dispatch }, { localFilePaths, remotePath } = {}) {
    return (
      getters.upyunClient
        .uploadFiles(remotePath, localFilePaths, getters.job)
        .then(results => {
          const isAllSuccess = !results.some(r => !r.result)
          const notify = title =>
            Notification.notify(
              title,
              {
                body: '点击查看详情',
              },
              () => {
                commit('SELECT_TAB_KEY', { tabKey: 'upload' })
                Router.push({ name: 'task' })
              },
            )
          if (isAllSuccess) {
            Message.success('上传成功')
            notify('上传成功')
          } else {
            for (const result of results) Message.warning(`上传失败：${result.localPath}: ${result.message}`)
            notify('上传失败')
          }
          return dispatch(Types.SYNC_JOB_LIST)
        })
        .then(() => dispatch({ type: Types.REFRESH_LIST, spinner: false }))
        .catch(errorHandler)
        // 同步错误信息
        .catch(() => dispatch(Types.SYNC_JOB_LIST))
    )
  },
  // 获取文件详情信息
  [Types.GET_FILE_DETAIL_INFO]({ getters, commit }, { uri, basicInfo } = {}) {
    return Promise.resolve()
      .then(() => {
        if (basicInfo.folderType === 'F') return Promise.resolve()
        return getters.upyunClient.head(uri)
      })
      .then(data => {
        const fileType = data && getFileType(data['content-type'])
        commit({
          type: Types.SET_FILE_DETAIL_INFO,
          data: {
            headerInfo: data,
            fileType: fileType,
            basicInfo: basicInfo,
          },
        })
      })
  },
  // 同步任务列表
  [Types.SYNC_JOB_LIST]({ getters, commit }, {} = {}) {
    getters.job.getStore().then(store => {
      commit(Types.SET_JOB_LIST, store ? store.data : [])
    })
  },
  // 清空已完成任务
  [Types.DELETE_JOB]({ getters, commit, dispatch }, { connectType, id } = {}) {
    getters.job
      .deleteJob({ connectType, id })
      .then(() => {
        Message.success('操作成功')
        dispatch('SYNC_JOB_LIST')
      })
      .catch(errorHandler)
  },
  // 获取空间使用量
  [Types.GET_USAGE]({ state, getters, commit, dispatch }, {} = {}) {
    return getters.upyunClient.getUsage().then(data => {
      commit(Types.SET_USAGE, { data })
    })
  },
  // 退出登录
  [Types.LOGOUT]({ commit }) {
    const mutations = ['RESET_AUTH', 'RESET_LIST', 'RESET_MODAL', 'RESET_TASK']
    for (const m of mutations) commit(m)
  },
  // 设置 profile 存储数据
  [Types.SET_PROFILE_STORE]({ getters, dispatch }, { data, noNofity } = {}) {
    getters.profile.setStoreData(data).then(() => {
      if (!noNofity) Message.success('操作成功')
      dispatch('SYNC_PROFILE_DATA')
    })
  },
  // 同步 profile 数据
  [Types.SYNC_PROFILE_DATA]({ getters, commit }, {} = {}) {
    getters.profile.getStore().then(store => {
      commit(Types.SET_PROFILE_DATA, store ? store.data : {})
    })
  },
}
