import * as Types from '@/store/mutation-types'
import { pickAll } from 'ramda'

import User from '@/api/user'

const user = Object.create(User)

const state = {
  user: user,
  usage: 0,
  isLogined: false,
}

const mutations = {
  [Types.SET_USER_INFO](state, payload = {}) {
    state.user.setup(payload.bucketName, payload.operatorName, payload.password)
    state.isLogined = true
  },
  [Types.SET_USAGE](state, { data }) {
    state.usage = data
  },
  [Types.CLEAR_USER_INFO](state) {
    sessionStorage.removeItem('key')
    state = {}
  },
}

export default {
  state,
  mutations,
}
