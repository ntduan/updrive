import Vue from 'vue'
import Router from 'vue-router'
import { path } from 'ramda'

import Store from '@/store'

import Main from '@/views/layout/Main'
import Login from '@/views/login/Login'
import List from '@/views/list/List'
import Task from '@/views/task/Task'
import Upload from '@/views/upload/Upload'
import Download from '@/views/download/Download'
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
          path: 'upload',
          name: 'upload',
          components: {
            body: Upload,
          },
          meta: {
            pageTitle: '上传列表',
          },
        },
        {
          path: 'download',
          name: 'download',
          components: {
            body: Download,
          },
          meta: {
            pageTitle: '下载列表',
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
  const isLogined = path(['state', 'auth', 'isLogined'], Store)

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
