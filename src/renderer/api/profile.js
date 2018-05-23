import localforage from 'localforage'

const Profile = {
  initStore: {
    version: 0.2,
    data: {
      domain: '',
      urlCopyType: 'url',
      sortInfo: {
        isReverse: true,
        key: 'lastModified',
      },
    },
  },

  urlCopyType: {
    url: 'url',
    markdown: 'markdown',
    html: 'html',
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
    const store = await localforage.getItem(this.storeKey)
    if (!store || !store.version) return await localforage.setItem(this.storeKey, this.initStore)
    if (store.version !== this.initStore.version) return await this.upgrade(store)
    return store
  },

  async upgrade(store) {
    const data = { ...this.initStore.data }
    const oldData = { ...store.data }
    if (oldData.domain !== undefined) {
      data.domain = oldData.domain
    }
    if (oldData.urlCopyType !== undefined) {
      data.urlCopyType = oldData.urlCopyType
    }
    if (oldData.sortInfo !== undefined) {
      data.sortInfo = oldData.sortInfo
    }
    return await localforage.setItem(this.storeKey, { ...this.initStore, data })
  },
}

export default Profile
