import Vue from 'vue'
import Router from 'vue-router'
import { path } from 'ramda'

import Store from '@/store'

import Login from '@/components/Login'
import Main from '@/components/Main'
import List from '@/components/view/List'
import Domain from '@/components/view/Domain'
import Task from '@/components/view/Task'
import Session from '@/api/session.js'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      component: Main,
      children: [
        {
          path: '',
          name: 'main',
          components: {
            body: List,
          },
        },
        {
          path: 'task',
          name: 'task',
          components: {
            body: Task,
          },
          meta: {
            pageTitle: '任务列表',
          },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
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
      })
        .then(() => {
          next()
        })
        .catch(() => {
          next('/login')
        })
    } else {
      next('/login')
    }
  }
})

export default router
