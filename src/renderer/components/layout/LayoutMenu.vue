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
          任务列表
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
import Icon from '@/components/uiComponents/Icon'

export default {
  name: 'LayoutMenu',
  components: {
    Icon,
  },
  computed: {
    currentRouteName() {
      return this.$route.name
    },
  },
}
</script>