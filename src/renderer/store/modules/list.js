import {
  last,
  dropLast,
  path,
  merge,
  append,
  pluck,
} from 'ramda'
import * as Types from '@/store/mutation-types'

const initState = {
  dirInfo: {
    data: [],
    loading: false,
    path: '',
  },
  history: {
    forwardStack: [],
    backStack: [],
  },
  fileDetail: {
    basicInfo: {},
    headerInfo: {},
  },
  selected: [],
}



const mutations = {
  [Types.SET_CURRENT_LIST](state, { data, action }) {
    const historyPath = path(['dirInfo', 'path'], state)
    let forwardStack = path(['history', 'forwardStack'], state)
    let backStack = path(['history', 'backStack'], state)

    state.dirInfo = {
      ...data,
      loading: false,
    }

    state.selected = []

    // action 0 表示打开新目录
    if (action === 0) {
      state.history.forwardStack = []
      if (last(state.history.backStack) !== historyPath) {
        state.history.backStack = append(historyPath, backStack)
      }
    }
    // action 1 表示前进
    if (action === 1) {
      if (state.history.forwardStack.length) {
        state.history.backStack = append(historyPath, backStack)
        state.history.forwardStack = dropLast(1, forwardStack)
      }
    }
    // action -1 表示后退
    if (action === -1) {
      if (state.history.backStack.length) {
        state.history.forwardStack = append(historyPath, forwardStack)
        state.history.backStack = dropLast(1, backStack)
      }
    }
  },
  [Types.SET_LOADING_LIST](state, { data }) {
    state.dirInfo.loading = data
  },
  [Types.SHORTCUT_SELECT_ALL](state, data) {
    state.selected = pluck('uri', state.dirInfo.data)
  },
  [Types.SET_SELECT_LIST](state, { selected }) {
    state.selected = selected
  },
  [Types.SET_FILE_DETAIL_INFO](state, { data }) {
    state.fileDetail = data
  },
  [Types.RESET_LIST](state) {
    Object.assign(state, { ...initState })
  },
}

export default {
  state: { ...initState },
  mutations,
}
