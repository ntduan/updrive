import Vue from 'vue'
import Router from 'vue-router'
import { path } from 'ramda'

import Store from '@/store'

import Login from '@/components/Login'
import Main from '@/components/Main'
import Domain from '@/components/view/Domain'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main,
    },
    {
      path: '/domain',
      name: 'domain',
      component: Domain,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '*',
      redirect: '/'
    },
  ]
})

router.beforeEach((to, from, next) => {
  const isLogined = path(['state', 'user', 'isLogined'], Store)

  if (to.name === 'login' || isLogined) {
    next()
  } else {
    next('/login')
  }
})

export default router
