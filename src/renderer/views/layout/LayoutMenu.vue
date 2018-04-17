<template>
  <aside class="menu">
    <div class="profile" @click="toggleProfileMenu">
      <div class="profile-name">
        <div class="profile-name-content">{{auth.user.operatorName}}/{{auth.user.bucketName}}</div>
        <Icon class="icon-angle-down" name="icon-angle-down" />
      </div>
      <div class="profile-usage">已使用 {{auth.usage | digiUnit}}</div>
      <div class="dropdown-background" v-show="isShowProfileMenu"></div>
      <div v-show="isShowProfileMenu">
        <div class="dropdown-content" @click.stop="void 0">
          <div class="dropdown-content-profile-name">{{auth.user.operatorName}}/{{auth.user.bucketName}}</div>
          <hr class="dropdown-divider">
          <a class="dropdown-item" @click.prevent="openExternal(`https://console.upyun.com/services/${auth.user.bucketName}/domainsFile/`)">
            云存储服务设置
          </a>
          <a class="dropdown-item" @click.prevent="openExternal('https://console.upyun.com/services/create/file/')">
            创建云存储服务
          </a>
          <a class="dropdown-item" @click.prevent="openExternal('https://github.com/aniiantt/updrive/issues')">
            报告一个问题
          </a>
          <hr class="dropdown-divider">
          <a class="dropdown-item" @click.prevent="toggleAccount">
            切换账号
          </a>
        </div>
      </div>
    </div>
    <hr class="dropdown-divider" style="margin-bottom:0;margin-top:0;">
    <ul class="menu-list">
      <li>
        <router-link :to="{name: 'main'}" :class="{'is-active': currentRouteName === 'main'}">
          <Icon name="icon-files" />
          全部文件
        </router-link>
      </li>
      <li>
        <router-link :to="{name: 'task'}" :class="{'is-active': currentRouteName === 'task'}">
          <Icon name="icon-task" />
          任务列表<span v-show="workingTaskNum" class="task-tag tag is-danger is-rounded">{{workingTaskNum}}</span>
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
import { mapState } from 'vuex'

import { digiUnit } from '@/api/tool'
import Icon from '@/components/Icon'
import { openExternal, getVersion, getName } from '@/api/electron.js'

export default {
  name: 'LayoutMenu',
  data() {
    return {
      isShowProfileMenu: false,
    }
  },
  computed: {
    workingTaskNum() {
      return this.task.list.filter(
        file => file.status !== this.task.status.completed.value && file.status !== this.task.status.error.value,
      ).length
    },
    currentRouteName() {
      return this.$route.name
    },
    ...mapState(['task', 'auth']),
  },
  created() {
    this.$store.dispatch('GET_USAGE')
  },
  methods: {
    toggleProfileMenu() {
      this.isShowProfileMenu = !this.isShowProfileMenu
    },
    toggleAccount() {
      this.$router.push({ name: 'login' })
      this.$store.dispatch('LOGOUT')
      this.isShowProfileMenu = false
    },
    openExternal(href) {
      openExternal(href)
      this.isShowProfileMenu = false
    },
  },
  filters: {
    digiUnit,
  },
  components: {
    Icon,
  },
}
</script>
