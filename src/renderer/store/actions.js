import { join, append, compose, unless, isEmpty } from 'ramda'
import message from 'iview/src/components/message'

import { md5sum, errorHandler } from '@/api/tool.js'
import * as Types from '@/store/mutation-types'
import * as Upyun from '@/api/upyun.js'
import * as UpyunFtp from '@/api/upyunFtp.js'

export default {
  // 登录
  [Types.VERIFICATION_ACCOUNT]({ state, commit }, payload) {
    const user = {
      bucketName: payload.bucketName,
      operatorName: payload.operatorName,
      password: payload.password,
      passwordMd5: md5sum(payload.password),
    }
    return Upyun.checkAuth(user)
      .then(() => {
        commit(Types.SET_USER_INFO, user)
        return user
      })
      .catch(error => {
        commit(Types.CLEAR_USER_INFO)
        return Promise.reject(error)
      })
  },
  // 获取文件目录信息
  [Types.GET_LIST_DIR_INFO]({ state, commit }, { remotePath, spinner = true, action }) {
    if (spinner) commit({ type: Types.SET_LOADING_LIST, data: true })
    return Upyun.getListDirInfo(remotePath)
      .then(result => {
        commit({
          type: Types.SET_CURRENT_LIST,
          data: result,
          action: action,
        })
        return result
      })
      .catch(error => {
        // commit(Types.CLEAR_USER_INFO)
        return Promise.reject(error)
      })
  },
  // 上传文件
  [Types.UPLOAD_FILES]({ state, commit, dispatch }, { remotePath, localFilePaths }) {
    commit('SHOW_TASK_MODAL')
    return Upyun.uploadFiles(remotePath, localFilePaths)
      .then(() => message.success('文件上传成功'))
      .then(() => dispatch({ type: 'REFRESH_LIST', spinner: false }))
      .catch(errorHandler)
  },
  // 创建目录
  [Types.CREATE_FOLDER]({ state, commit, dispatch }, { remotePath, folderName }) {
    return Upyun.createFolder(remotePath, folderName)
      .then(() => message.success('文件夹创建成功'))
      .then(() => dispatch({ type: 'REFRESH_LIST', spinner: false }))
      .catch(errorHandler)
  },
  // 刷新当前目录
  [Types.REFRESH_LIST]({ state, commit, dispatch }, { remotePath, spinner = true } = {}) {
    return dispatch({ type: 'GET_LIST_DIR_INFO', remotePath: remotePath || state.list.dirInfo.path, spinner })
  },
  // 删除文件
  [Types.DELETE_FILE]({ state, commit, dispatch }, { selectedPaths } = {}) {
    return Upyun.deleteFiles(selectedPaths)
      .then(() => message.success('操作成功'))
      .then(() => dispatch({ type: 'REFRESH_LIST', spinner: false }))
      .catch(errorHandler)
  },
  // 修改路径
  [Types.RENAME_FILE]({ state, commit, dispatch }, { oldPath, newPath, isFolder } = {}) {
    // const renameFolder = (oldPath, newPath) => {
    //   return UpyunFtp.renameFolder(oldPath, newPath)
    //     .then(() => message.success('操作成功'))
    //     .then(() => dispatch({type: 'REFRESH_LIST', spinner: false}))
    //     .catch(errorHandler)
    // }

    // const renameFile = (oldPath, newPath) => {
    //   return UpyunFtp.renameFile(oldPath, newPath)
    //     .then(() => message.success('操作成功'))
    //     .then(() => dispatch({type: 'REFRESH_LIST', spinner: false}))
    //     .catch(errorHandler)
    // }

    // return isFolder ? renameFolder(oldPath, newPath) : renameFile(oldPath, newPath)
    return UpyunFtp.renameFile(oldPath, newPath)
      .then(() => message.success('操作成功'))
      .then(() => dispatch({ type: 'REFRESH_LIST', spinner: false }))
      .catch(errorHandler)
  },
  // 下载文件
  [Types.DOWNLOAD_FILES]({ state, commit, dispatch }, { destPath, downloadPath } = {}) {
    commit('SHOW_TASK_MODAL')
    return Upyun.downloadFiles(destPath, downloadPath)
      .then(() => message.success('下载完成'))
      .catch(errorHandler)
  },
  // 获取文件详情信息
  [Types.GET_FILE_DETAIL_INFO]({ state, commit }, { filePath, basicInfo } = {}) {
    return Promise.resolve()
      .then(() => {
        if (basicInfo.folderType === 'F') return Promise.resolve()
        return Upyun.getFileHead(filePath)
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

