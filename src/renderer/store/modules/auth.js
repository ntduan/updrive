import * as Types from '@/store/mutation-types'
import { pickAll } from 'ramda'

import User from '@/api/user'

const user = Object.create(User)

const initState = {
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
    Object.assign(state, { ...initState }, { user: Object.create(User) })
  },
  [Types.RESET_AUTH](state) {
    Object.assign(state, { ...initState }, { user: Object.create(User) })
  },
}

export default {
  state: { ...initState },
  mutations,
}
