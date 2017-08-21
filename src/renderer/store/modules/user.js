import * as Types from '../mutation-types'
import { pickAll } from 'ramda'

const state = JSON.parse(sessionStorage.getItem('user')) || {
  bucketName: '',
  operatorName: '',
  passwordMd5: '',
  password: '',
  isLogined: false,
}


const mutations = {
  [Types.SET_USER_INFO](state, payload = {}) {
    const user = {
      bucketName: payload.bucketName,
      operatorName: payload.operatorName,
      passwordMd5: payload.passwordMd5,
      password: payload.password,
      isLogined: true
    }
    sessionStorage.setItem('user', JSON.stringify(user))
    Object.assign(state, user)
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