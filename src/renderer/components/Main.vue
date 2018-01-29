<template>
  <section class="layout">
    <layout-nav></layout-nav>
    <div class="layout-inner">
      <layout-menu></layout-menu>
      <layout-body></layout-body>
    </div>
  </section>
</template>

<script>
import Download from '@/api/download'
import LayoutNav from '@/components/layout/LayoutNav'
import LayoutMenu from '@/components/layout/LayoutMenu'
import LayoutBody from '@/components/layout/LayoutBody'

export default {
  name: 'Main',
  components: {
    LayoutNav,
    LayoutMenu,
    LayoutBody,
  },
  created() {
    this.activateList()
    this.activateDownload()
  },
  methods: {
    activateList() {
      this.$store.dispatch({ type: 'GET_LIST_DIR_INFO' })
    },
    activateDownload() {
      const download = new Download(item => {
        this.$store.commit('UPDATE_DOWNLOAD_ITEM', { downloadItem: item })
      })
      this.$store.commit('INIT_DOWNLOAD_STORE', { data: download })
      this.$store.dispatch('SYNC_DOWNLOAD_LIST')
    },
  },
}
</script>
