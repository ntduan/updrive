<template>
  <div ref="progressBar"></div>
</template>

<script>
import ProgressBar from 'progressbar.js'

export default {
  name: 'ProgressBar',
  data() {
    return {
      defaultOpts: {
        strokeWidth: 2,
        color: '#97c8f3',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: { width: '100%', height: '100%' },
      },
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
    progress(val, oldval) {
      this.progressAnimate(val, oldval)
    },
  },
  destroyed() {
    this.shape && this.shape.destroy()
  },
  mounted() {
    this.shape = new ProgressBar.Line(this.$refs.progressBar, {
      ...this.defaultOpts,
    })
    this.progressAnimate(this.progress)
  },
  methods: {
    progressAnimate(progress = 0, oldProgress = 0) {
      if (!this.shape) return
      this.shape.animate(progress, {
        duration: 100,
      })
    },
  },
}
</script>
