import Vue from 'vue'
import Router from 'vue-router'
import { path } from 'ramda'

import Store from '@/store'

import Login from '@/components/Login'
import Main from '@/components/Main'
import Domain from '@/components/view/Domain'
import Session from '@/api/session.js'

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
    const userInfo = Session.getUser()
    if (userInfo) {
      Store.dispatch({
        type: 'VERIFICATION_ACCOUNT',
        ...userInfo,
      }).then(() => {
        next()
      }).catch(() => {
        next('/login')
      })
    } else {
      next('/login')
    }
  }
})

export default router
