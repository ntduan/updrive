<template>
  <div class="res-block">
    <img v-if="isLoadedImage" :src="thumnailUrl" class="img-mini-preview"/>
    <i class="res-icon" :class="resClass" v-if="!isLoadedImage"></i>
  </div>
</template>

<script>
import fs from 'fs'

import { getFileIconClass, getFileTypeFromName } from '@/api/tool'
import { setTimeout } from 'timers'
import thumnail from '@/api/thumnail'

export default {
  name: 'ResIcon',
  props: {
    fileName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      thumnailUrl: '',
      isLocalImage: false,
      isLoadedImage: false,
    }
  },
  computed: {
    resClass() {
      return getFileIconClass(this.fileName)
    },
  },
  mounted() {
    // console.log(this.$el)
    // console.log(this.isLoadedImage && this.isLocalImage)
  },
  watch: {
    url: {
      handler: 'watchUrl',
      immediate: true,
    },
  },
  methods: {
    observeImg() {
      if (this.$el) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
              observer.unobserve(entry.target)
              this.loadImg()
            }
          })
        })
        observer.observe(this.$el)
      }
    },
    loadImg() {
      thumnail.createThumbnail(`file://${this.url}`, 24).then(objectUrl => {
        if (objectUrl) {
          this.thumnailUrl = objectUrl
          this.isLoadedImage = true
        } else {
          this.isLoadedImage = false
        }
      })
    },
    watchUrl() {
      this.isLoadedImage = false
      if (!this.url) return (this.isLocalImage = false)
      if (getFileTypeFromName(this.url) === 'image') {
        fs.access(this.url, err => {
          if (err) return (this.isLocalImage = false)
          this.isLocalImage = true
          this.observeImg()
        })
      } else {
        this.isLocalImage = false
      }
    },
  },
}
</script>

<style>
.res-block {
  display: inline-block;
  width: 24px;
  height: 24px;
}
</style>

