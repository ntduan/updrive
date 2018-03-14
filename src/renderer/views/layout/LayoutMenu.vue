<template>
  <aside class="menu">
    <ul class="menu-list">
      <li>
        <router-link :to="{name: 'main'}" :class="{'is-active': currentRouteName === 'main'}">
          <Icon name="icon-files" />
          全部文件
        </router-link>
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

import Icon from '@/components/Icon'

export default {
  name: 'LayoutMenu',
  components: {
    Icon,
  },
  computed: {
    workingTaskNum() {
      return this.task.list.filter(file => file.status !== this.task.status.completed.value && file.status !== this.task.status.error.value).length
    },
    currentRouteName() {
      return this.$route.name
    },
    ...mapState(['task']),
  },
}
</script>
