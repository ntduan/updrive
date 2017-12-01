<template>
  <div ref="progressBar"></div>
</template>

<script>
import ProgressBar from 'progressbar.js'

export default {
  name: 'MainMenu',
  data() {
    return {
      shape: null,
    }
  },
  props: {
    progress: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  watch: {
    progress(val) {
      this.progressAnimate(val)
    },
  },
  destroyed() {
    this.shape && this.shape.destroy()
  },
  mounted() {
    this.shape = new ProgressBar.Circle(this.$refs.progressBar, {
      strokeWidth: 14,
      color: '#2389d0',
      trailColor: '#aaa',
      trailWidth: 12,
    })
    this.progressAnimate(this.progress)
  },
  methods: {
    progressAnimate(progress = 0) {
      if (!this.shape) return
      this.shape.animate(progress)
    },
  },
}
</script>