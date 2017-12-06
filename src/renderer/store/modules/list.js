import {
  last,
  dropLast,
  path,
  pipe,
  reverse,
  merge,
  sort,
  sortBy,
  filter,
  identity,
  split,
  compose,
  append,
  pluck,
} from 'ramda'
import * as Types from '@/store/mutation-types'

const state = {
  dirInfo: {
    data: [],
    loading: false,
    path: '',
  },
  sortInfo: {
    isReverse: false,
    key: 'filename',
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

const listSort = (data = [], key, isReverse) => {
  if (!key) return data

  const naturalCompareString = (a = '', b = '') => {
    try {
      const splitByNumber = pipe(split(/(\d+)/), filter(identity))
      const [aArr, bArr] = [splitByNumber(a), splitByNumber(b)]
      for (let i = 0; i < aArr.length; i++) {
        if (aArr[i] !== bArr[i]) {
          if (bArr[i] === undefined) return 1
          if (!isNaN(aArr[i]) && !isNaN(bArr[i])) {
            return parseInt(aArr[i]) - parseInt(bArr[i])
          } else {
            return aArr[i].localeCompare(bArr[i])
          }
        }
      }
      return 0
    } catch (err) {
      return a.localeCompare(b)
    }
  }

  const sortData = sort((ObjA, ObjB) => {
    if (ObjA.folderType !== ObjB.folderType) {
      return ObjA.folderType === 'F' ? -1 : 1
    }
    if (key === 'lastModified' || key === 'size') {
      return ObjA[key] !== ObjB[key]
        ? Number(ObjA[key]) - Number(ObjB[key])
        : naturalCompareString(ObjA.filename, ObjB.filename)
    }
    if (key === 'filetype' || key === 'filename') {
      return ObjA[key] !== ObjB[key]
        ? naturalCompareString(String(ObjA[key]), String(ObjB[key]))
        : naturalCompareString(ObjA.filename, ObjB.filename)
    }
  }, data)

  return isReverse ? reverse(sortData) : sortData
}

const mutations = {
  [Types.SET_CURRENT_LIST](state, { data, action }) {
    const historyPath = path(['dirInfo', 'path'], state)
    let forwardStack = path(['history', 'forwardStack'], state)
    let backStack = path(['history', 'backStack'], state)

    state.dirInfo = {
      ...data,
      data: listSort(data.data, state.sortInfo.key, state.sortInfo.isReverse),
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
  [Types.SET_SORT_INFO](state, sortInfo) {
    state.sortInfo = sortInfo
    state.dirInfo = {
      ...state.dirInfo,
      data: listSort(state.dirInfo.data, state.sortInfo.key, state.sortInfo.isReverse),
    }
  },
  [Types.SET_SELECT_LIST](state, { selected }) {
    state.selected = selected
  },
  [Types.SET_FILE_DETAIL_INFO](state, { data }) {
    state.fileDetail = data
  },
}

export default {
  state,
  mutations,
}
