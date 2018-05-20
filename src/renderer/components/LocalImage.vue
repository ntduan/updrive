<template>
  <img src="file:///Users/yznt/Downloads/小圆脸/下载.png" alt="">
</template>

<script>
import { createImage } from '@/api/tool'

export default {
  name: 'LocalImage',
  props: {},
  computed: {},
  created() {
    createImage()
  },
}
</script>
