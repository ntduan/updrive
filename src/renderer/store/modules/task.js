import { append, drop, prepend, update } from 'ramda'

import * as Types from '@/store/mutation-types'

// console.log(Store)
// const downloadStore = new Download()
// downloadStore.on('change', id => {
//   downloadStore.getStore().then(obj => {
//     console.log(obj)
//   })
// })

const state = {
  taskType: {
    uploading: '上传中',
    downloading: '下载中',
    completed: '已完成',
  },
  tabKey: 'uploading',
  job: null,
  list: [],
  taskList: [],
  showModal: false,
}

const mutations = {
  [Types.INIT_JOB](state, job) {
    state.job = job
  },
  [Types.SET_JOB_LIST](state, list) {
    state.list = list
  },
  [Types.UPDATE_JOB_ITEM](state, { item }) {
    const existedItemIndex = state.list.findIndex(_item => _item.id === item.id)
    if (~existedItemIndex) {
      state.list = update(existedItemIndex, item, state.list)
    } else {
      state.list = prepend(item, state.list)
    }
  },
  [Types.SELECT_TAB_KEY](state, { tabKey }) {
    state.tabKey = tabKey
  },
  [Types.SHOW_TASK_MODAL](state) {
    state.showModal = true
  },
  [Types.HIDE_TASK_MODAL](state) {
    state.taskList = state.taskList.filter(item => {
      return item.status === '1'
    })
    state.showModal = false
  },
  [Types.UPDATE_TASK](state, { payload = {} }) {
    const task = state.taskList.find(item => item.id === payload.id)
    if (task) {
      Object.assign(task, payload)
    } else {
      state.taskList = append(payload, state.taskList)
    }
  },
  [Types.DELETE_TASK](state, { data = {} }) {
    state.taskList = state.taskList.filter(item => item.id !== data.id)
  },
  [Types.CANCEL_TASK](state, { data = {} }) {
    state.taskList = state.taskList.map(item => {
      if (item.id === data.id) {
        item.abort && item.abort()
        return { ...item, status: '-2' }
      }
      return item
    })
  },
}

export default {
  state,
  mutations,
}
