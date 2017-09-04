import { join, append, compose, unless, isEmpty } from 'ramda'
import { md5sum } from '../api/tool.js'
import * as Types from './mutation-types'
import * as Upyun from '../api/upyun.js'
import * as UpyunFtp from '../api/upyunFtp.js'

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
      .then(result => {
        commit(Types.SET_USER_INFO, result)
        return result
      })
      .catch(error => {
        commit(Types.CLEAR_USER_INFO)
        return Promise.reject(error)
      })
  },
  // 获取文件目录信息
  [Types.GET_LIST_DIR_INFO]({ state, commit }, { remotePath, action }) {
    commit({ type: Types.SET_LOADING_LIST, data: true })
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
    return Upyun.uploadFiles(remotePath, localFilePaths)
  },
  // 创建目录
  [Types.CREATE_FOLDER]({ state, commit, dispatch }, { remotePath, folderName }) {
    return Upyun.createFolder(remotePath, folderName)
  },
  // 刷新当前目录
  [Types.REFRESH_LIST]({ state, commit, dispatch }, { remotePath } = {}) {
    return dispatch({ type: 'GET_LIST_DIR_INFO', remotePath: remotePath || state.list.dirInfo.path })
  },
  // 删除文件
  [Types.DELETE_FILE]({ state, commit, dispatch }, { selectedPaths } = {}) {
    return Upyun.deleteFiles(selectedPaths)
  },
  // 修改路径
  [Types.RENAME_FILE]({ state, commit, dispatch }, { oldPath, newPath, isFolder } = {}) {
    return isFolder ? UpyunFtp.renameFolder(oldPath, newPath) : UpyunFtp.renameFile(oldPath, newPath)
  },
  // 下载文件
  [Types.DOWNLOAD_FILES]({ state, commit, dispatch }, { destPath, downloadPath } = {}) {
    return Upyun.downloadFiles(destPath, downloadPath)
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

