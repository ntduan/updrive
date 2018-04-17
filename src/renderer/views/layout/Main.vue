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
      const job = Object.create(Job)
      job.setup(this.auth.user.key, item => {
        this.$store.commit('UPDATE_JOB_ITEM', { item })
      })
      this.$store.commit('INIT_JOB', job)
      this.$store.dispatch('SYNC_JOB_LIST')
    },
  },
}
</script>
