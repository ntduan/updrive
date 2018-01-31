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
import { mapState } from 'vuex'

import Job from '@/api/job'
import LayoutNav from '@/views/layout/LayoutNav'
import LayoutMenu from '@/views/layout/LayoutMenu'
import LayoutBody from '@/views/layout/LayoutBody'

export default {
  name: 'Main',
  components: {
    LayoutNav,
    LayoutMenu,
    LayoutBody,
  },
  computed: {
    ...mapState(['auth']),
  },
  created() {
    this.activateList()
    this.activateJob()
  },
  methods: {
    activateList() {
      this.$store.dispatch({ type: 'GET_LIST_DIR_INFO' })
    },
    activateJob() {
      this.$store.commit(
        'INIT_JOB',
        new Job(this.auth.user.key, item => {
          this.$store.commit('UPDATE_JOB_ITEM', { item })
        }),
      )
      this.$store.dispatch('SYNC_JOB_LIST')
    },
  },
}
</script>
