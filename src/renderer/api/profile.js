import localforage from 'localforage'

const Profile = {
  initStore: {
    version: 0.1,
    data: {
      domain: '',
      urlCopyType: 'url',
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
    const data = await localforage.getItem(this.storeKey)
    return data && data.version === this.initStore.version ? data : { ...this.initStore }
  },
}

export default Profile
