<template>
  <svg class="svg-icon"><use :xlink:href="iconName"></use></svg>
</template>

<script>
export default {
  name: 'Icon',
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  computed: {
    iconName() {
      return `#${this.name}`
    },
  },
}
</script>
