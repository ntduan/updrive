<template>
  <aside class="menu">
    <ul class="menu-list">
      <li>
        <router-link :to="{name: 'main'}" :class="{'is-active': currentRouteName === 'main'}">
          <svg class="svg-icon"><use xlink:href="#icon-logo"></use></svg>
          文件
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  name: 'LayoutMenu',
  computed: {
    currentRouteName() {
      return this.$route.name
    },
  },
}
</script>