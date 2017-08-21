import * as Types from '../mutation-types'

const state = {
  createFolder: {
    show: false
  },
  renameFile: {
    show: false,
    oldPath: '',
  },
}

const mutations = {
  [Types.OPEN_CREATE_FOLDER_MODAL](state) {
    state.createFolder.show = true
  },
  [Types.CLOSE_CREATE_FOLDER_MODAL](state) {
    state.createFolder.show = false
  },
  [Types.OPEN_RENAME_FILE_MODAL](state) {
    state.renameFile.show = true
  },
  [Types.CLOSE_RENAME_FILE_MODAL](state) {
    state.renameFile.show = false
  },
  [Types.RENAME_FILE_SET_OLD_PATH](state, oldPath) {
    state.renameFile.oldPath = oldPath
  },
  [Types.RENAME_FILE_CLEAR_OLD_PATH](state) {
    state.renameFile.oldPath = ''
  }
}

export default {
  state,
  mutations
}