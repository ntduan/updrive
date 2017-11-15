import * as Types from '@/store/mutation-types'
import { pickAll } from 'ramda'

import User from '@/api/user'

const state = {
  user: null,
  isLogined: false,
}

const mutations = {
  [Types.SET_USER_INFO](state, payload = {}) {
    state.user = new User(payload.bucketName, payload.operatorName, payload.password)
    state.isLogined = true
  },
  [Types.CLEAR_USER_INFO](state) {
    sessionStorage.removeItem('key')
    state = {}
  },
}

export default {
  state,
  mutations
}