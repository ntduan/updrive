<template>
  <section class="page">
    <main-menu></main-menu>
    <div>
      <page-nav></page-nav>
      <page-main></page-main>
    </div>
  </section>
</template>

<script>
  import { mapState } from 'vuex'
  import PageNav from '@/components/layout/PageNav'
  import PageMain from '@/components/layout/PageMain'
  import MainMenu from '@/components/view/MainMenu'

  export default {
    name: 'Main',
    components: {
      PageNav,
      PageMain,
      MainMenu,
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