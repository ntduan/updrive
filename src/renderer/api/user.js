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
  }

  save() {
    this.getAuthHistory()
      .then(data => {
        const authHistory = data
        const key = `${this.operatorName}/${this.bucketName}`
        const record = {
          bucketName: this.bucketName,
          operatorName: this.operatorName,
          password: this.password,
          key: key,
        }
        const existRecord = authHistory.data.find(u => u.key === key)
        if (existRecord) {
          if (existRecord.password !== this.password) {
            existRecord.password = this.password
          }
        } else {
          authHistory.data.push(record)
        }

        return localforage.setItem('authHistory', authHistory)
      })
  }

  getAuthHistory() {
    return localforage.getItem('authHistory')
      .then(data => {
        return data || {
          data: []
        }
      })
  }

  deleteAuthHistory(key) {
    return this.getAuthHistory()
      .then(data => {
        const authHistory = data
        authHistory.data = authHistory.data.filter(u => u.key !== key)
        console.log(authHistory)
        return localforage.setItem('authHistory', authHistory)
      })
  }
}