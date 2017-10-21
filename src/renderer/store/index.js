import Vue from 'vue'
import Vuex from 'vuex'

import Actions from '@/store/actions'
import * as Getters from '@/store/getters'
import Modules from '@/store/modules'


Vue.use(Vuex)

export default new Vuex.Store({
  actions: Actions,
  getters: Getters,
  modules: Modules,
  strict: process.env.NODE_ENV !== 'production'
})
