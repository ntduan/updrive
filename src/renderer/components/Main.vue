<template>
  <section class="page">
    <page-nav></page-nav>
    <page-main></page-main>
  </section>
</template>

<script>
  import { mapState } from 'vuex'
  import PageNav from './layout/PageNav'
  import PageMain from './layout/PageMain'

  export default {
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


<style>
  .page {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: #fcfcfc;
  }
</style>