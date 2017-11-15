import { join, append, compose, unless, isEmpty } from 'ramda'


import { md5sum, errorHandler } from '@/api/tool.js'
import * as Types from '@/store/mutation-types'
import * as UpyunFtp from '@/api/upyunFtp.js'
import UpyunClient from '@/api/upyunClient.js'
import Message from '@/api/message.js'

export default {
  // 登录
  [Types.VERIFICATION_ACCOUNT]({ getters, commit }, payload) {
    commit(Types.SET_USER_INFO, {
      bucketName: payload.bucketName,
      operatorName: payload.operatorName,
      password: payload.password,
    })

    return Promise.resolve()
    // return getters.upyunClient.checkAuth()
    //   .then(() => {
    //     return user
    //   })
    //   .catch(error => {
    //     commit(Types.CLEAR_USER_INFO)
    //     return Promise.reject(error)
    //   })
  },
  // 获取文件目录信息
  [Types.GET_LIST_DIR_INFO]({ getters, commit }, { remotePath, spinner = true, action }) {
    if (spinner) commit({ type: Types.SET_LOADING_LIST, data: true })
    return getters.upyunClient.getListDirInfo(remotePath)
      .then(result => {
        commit({
          type: Types.SET_CURRENT_LIST,
          data: result,
          action: action,
        })
        return result
      })
      .catch(error => {
        return Promise.reject(error)
      })
  },
  // 上传文件
  [Types.UPLOAD_FILES]({ getters, commit, dispatch }, { remotePath, localFilePaths }) {
    commit('SHOW_TASK_MODAL')
    return getters.upyunClient.uploadFiles(remotePath, localFilePaths, payload => commit({ type: 'UPDATE_TASK', payload}))
      .then(() => Message.success('文件上传成功'))
      .then(() => dispatch({ type: 'REFRESH_LIST', spinner: false }))
      .catch(errorHandler)
  },
  // 创建目录
  [Types.CREATE_FOLDER]({ getters, commit, dispatch }, { remotePath, folderName }) {
    return getters.upyunClient.createFolder(remotePath, folderName)
      .then(() => Message.success('文件夹创建成功'))
      .then(() => dispatch({ type: 'REFRESH_LIST', spinner: false }))
      .catch(errorHandler)
  },
  // 刷新当前目录
  [Types.REFRESH_LIST]({ state, getters, commit, dispatch }, { remotePath, spinner = true } = {}) {
    return dispatch({ type: 'GET_LIST_DIR_INFO', remotePath: remotePath || state.list.dirInfo.path, spinner })
  },
  // 删除文件
  [Types.DELETE_FILE]({ getters, commit, dispatch }, { selectedPaths } = {}) {
    return getters.upyunClient.deleteFiles(selectedPaths)
      .then((errorStack) => {
        if (!errorStack.length) {
          Message.success('操作成功')
        } else {
          Message.warning(`操作失败文件：${errorStack.join('、')}`)
        }
        dispatch({ type: 'REFRESH_LIST', spinner: false })
      })
      .catch(errorHandler)
  },
  // 重命名
  [Types.RENAME_FILE]({ getters, commit, dispatch }, { oldPath, newPath, isFolder } = {}) {
    return getters.upyunClient.renameFile(oldPath, newPath)
      .then(() => Message.success('操作成功'))
      .then(() => dispatch({ type: 'REFRESH_LIST', spinner: false }))
      .catch(errorHandler)
  },
  // 下载文件
  [Types.DOWNLOAD_FILES]({ getters, commit, dispatch }, { destPath, downloadPath } = {}) {
    commit('SHOW_TASK_MODAL')
    return getters.upyunClient.downloadFiles(destPath, downloadPath, getters.baseHref, payload => commit({ type: 'UPDATE_TASK', payload}))
      .then((errorStack) => {
        if (!errorStack.length) {
          Message.success('下载完成')
        } else {
          Message.warning(`下载失败文件：${errorStack.join('、')}`)
        }
      })
      .catch(errorHandler)
  },
  // 获取文件详情信息
  [Types.GET_FILE_DETAIL_INFO]({ getters, commit }, { filePath, basicInfo } = {}) {
    return Promise.resolve()
      .then(() => {
        if (basicInfo.folderType === 'F') return Promise.resolve()
        return getters.upyunClient.getFileHead(filePath)
      })
      .then(data => {
        commit({
          type: Types.SET_FILE_DETAIL_INFO,
          data: {
            headerInfo: data,
            basicInfo: basicInfo,
          },
        })
      })
  },
}

