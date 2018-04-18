import Request from 'request'
import EventEmitter from 'events'
import Fs from 'fs'
import { basename } from 'path'
import { prepend, groupBy } from 'ramda'
import localforage from 'localforage'

import { base64, throttle } from '@/api/tool'

const Profile = {
  initStore: {
    version: 0.1,
    data: {
      domain: '',
    },
  },

  setup(keyPre) {
    this.storeKey = `${keyPre}:profile`
  },

  async setStoreData(_profile) {
    const store = await this.getStore()
    store.data = { ...store.data, ..._profile }
    return await localforage.setItem(this.storeKey, store)
  },

  async getStore() {
    const data = await localforage.getItem(this.storeKey)
    return data && data.version === this.initStore.version ? data : { ...this.initStore }
  },
}

export default Profile
