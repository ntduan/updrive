<template>
  <section class="page">
    <page-nav></page-nav>
    <page-main></page-main>
  </section>
</template>

<script>
  import { mapState } from 'vuex'
  import PageNav from '@/components/layout/PageNav'
  import PageMain from '@/components/layout/PageMain'

  export default {
    name: 'Main',
    components: {
      PageNav,
      PageMain,
    },
    created() {
      this.$store.dispatch({ type: 'GET_LIST_DIR_INFO' })
    },
    computed: {
      ...mapState(['user']),
    }
  }
</script>
