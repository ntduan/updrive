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
  download: {
    store: null,
    data: [],
  },
  taskList: [
    // {
    //   id, // 每次任务唯一标识符
    //   type, // 类型 ['upload', 'download']
    //   to
    //   status,// 状态 '0': '未开始'，'1': '进行中', '2': '已完成', '-1': '出错', '-2': '已取消'
    //   localFilePath,
    //   remoteQuery,
    //   filename,
    //   percentage,
    //   size, // 文件大小
    //   done, // 已完成
    //   abort, 取消函数
    //   retry, 重试函数
    // }
  ],
  showModal: false,
}

const mutations = {
  [Types.INIT_DOWNLOAD_STORE](state, { data }) {
    state.download.store = data
  },
  [Types.UPDATE_DOWNLOAD_LIST](state, { data }) {
    state.download.data = data
  },
  [Types.UPDATE_DOWNLOAD_ITEM](state, { downloadItem }) {
    const existedItemIndex = state.download.data.findIndex(_item => _item.id === downloadItem.id)
    if (~existedItemIndex) {
      state.download.data = update(existedItemIndex, downloadItem, state.download.data)
    } else {
      state.download.data = prepend(downloadItem, state.download.data)
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
