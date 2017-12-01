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
    this.$store.dispatch({ type: 'GET_LIST_DIR_INFO' })
  },
}
</script>
