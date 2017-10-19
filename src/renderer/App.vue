<template>
  <router-view></router-view>
</template>

<script>
  import {
    commit
  } from 'vuex'

  import Store from '@/store'
  import {
    listenSelectAll,
    setApplicationMenu,
  } from '@/api/electron.js'
  import '@/assets/iconfont.js'

  setApplicationMenu()

  export default {
    store: Store,
    created() {
      // 阻止默认的拖动事件
      document.addEventListener('drop', event => event.preventDefault(), false)
      document.addEventListener('dragover', event => event.preventDefault(), false)
    }
  }
</script>

<style lang="scss">
  @import './styles/index.scss';
</style>