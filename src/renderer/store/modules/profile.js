import * as Types from '@/store/mutation-types'

const initState = {
  handler: null,
  data: {},
}

const mutations = {
  [Types.INIT_PROFILE](state, handler) {
    state.handler = handler
  },
  [Types.SET_PROFILE_DATA](state, data) {
    state.data = data
  },
  [Types.RESET_PROFILE](state) {
    Object.assign(state, { ...initState })
  },
}

export default {
  state: { ...initState },
  mutations,
}
