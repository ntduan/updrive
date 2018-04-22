import * as Types from '@/store/mutation-types'

const initState = {
  createFolder: {
    show: false,
  },
  renameFile: {
    show: false,
    oldPath: '',
  },
  domainSetting: {
    show: false,
  },
  formatUrl: {
    show: false,
    url: '',
  },
}

const mutations = {
  [Types.OPEN_FORMAT_URL_MODAL](state, { data }) {
    state.formatUrl.show = true
    state.formatUrl.url = data
  },
  [Types.CLOSE_FORMAT_URL_MODAL](state) {
    state.formatUrl.show = false
    state.formatUrl.url = ''
  },
  [Types.OPEN_CREATE_FOLDER_MODAL](state) {
    state.createFolder.show = true
  },
  [Types.CLOSE_CREATE_FOLDER_MODAL](state) {
    state.createFolder.show = false
  },
  [Types.OPEN_DOMAIN_SETTING_MODAL](state) {
    state.domainSetting.show = true
  },
  [Types.CLOSE_DOMAIN_SETTING_MODAL](state) {
    state.domainSetting.show = false
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
  },
  [Types.RESET_MODAL](state) {
    Object.assign(state, { ...initState })
  },
}

export default {
  state: { ...initState },
  mutations,
}
