import moment from 'moment'
import localforage from 'localforage'
import { remove, prepend } from 'ramda'

import UpyunClient from '@/api/upyunClient'

export default {
  storeKey: 'authHistory',

  initStore: {
    version: 0.1,
    data: [],
  },

  bucketName: '',
  operatorName: '',
  password: '',
  key: '',
  client: Object.create(UpyunClient),

  setup(bucketName, operatorName, password) {
    this.bucketName = bucketName
    this.operatorName = operatorName
    this.password = password
    this.key = `${this.operatorName}/${this.bucketName}`
    this.client.setup(this.bucketName, this.operatorName, this.password)
  },

  save() {
    this.getAuthHistory().then(data => {
      const authHistory = data
      const record = {
        bucketName: this.bucketName,
        operatorName: this.operatorName,
        password: this.password,
        key: this.key,
        lastModified: moment().unix(),
        remark: '',
      }
      const recordIndex = authHistory.data.findIndex(u => u.key === this.key)
      if (~recordIndex) {
        authHistory[recordIndex] = { ...record }
      } else {
        authHistory.data = prepend(record, authHistory.data)
      }

      return localforage.setItem(this.storeKey, authHistory)
    })
  },

  getAuthHistory() {
    return localforage.getItem(this.storeKey).then(data => {
      return data && data.version === this.initStore.version ? data : { ...this.initStore }
    })
  },

  deleteAuthHistory(key) {
    return this.getAuthHistory().then(data => {
      const authHistory = data
      authHistory.data = authHistory.data.filter(u => u.key !== key)
      return localforage.setItem(this.storeKey, authHistory)
    })
  },
}
