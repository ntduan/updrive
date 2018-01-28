import moment from 'moment'
import localforage from 'localforage'
import { remove } from 'ramda'

import UpyunClient from '@/api/upyunClient'

export default class User {
  constructor(bucketName, operatorName, password) {
    this.bucketName = bucketName
    this.operatorName = operatorName
    this.password = password
    this.client = new UpyunClient(this.bucketName, this.operatorName, this.password)
    this.key = `${this.operatorName}/${this.bucketName}`
  }

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
      const recordIndex = authHistory.data.findIndex(u => u.key === key)
      if (recordIndex > -1) {
        authHistory[recordIndex] = record
      } else {
        authHistory.data.push(record)
      }

      return localforage.setItem('authHistory', authHistory)
    })
  }

  getAuthHistory() {
    return localforage.getItem('authHistory').then(data => {
      return (
        data || {
          data: [],
        }
      )
    })
  }

  deleteAuthHistory(key) {
    return this.getAuthHistory().then(data => {
      const authHistory = data
      authHistory.data = authHistory.data.filter(u => u.key !== key)
      return localforage.setItem('authHistory', authHistory)
    })
  }
}
