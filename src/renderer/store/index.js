import Vue from 'vue'
import Vuex from 'vuex'

import Actions from './actions'
import * as Getters from './getters'
import Modules from './modules'


Vue.use(Vuex)

export default new Vuex.Store({
  actions: Actions,
  getters: Getters,
  modules: Modules,
  strict: process.env.NODE_ENV !== 'production'
})
