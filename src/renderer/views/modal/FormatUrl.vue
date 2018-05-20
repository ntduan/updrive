<template>
  <div class="modal modal-lg basic-modal is-active" v-show="modal.formatUrl.show" tabindex="1" @keyup.esc="close" @keyup.enter="submit">
    <div class="modal-background"></div>
    <div class="modal-content" ref="autofocus" tabindex="0">
      <div class="modal-header" style="margin-bottom: 16px;">
        <span class="modal-title">获取链接</span>
        <span class="modal-close-button" @click="close">
          <Icon name="icon-x" />
        </span>
      </div>
      <div class="modal-body">
        <div class="tabs is-medium">
          <ul>
            <li :class="{'is-active': profile.data.urlCopyType === type}" v-for="(name, type) in profile.handler.urlCopyType" :key="type" @click="switchFormatType(type)"><a>{{name}}</a></li>
          </ul>
        </div>
        <p class="control" @keyup.enter.stop="void 0">
          <textarea
            style="word-break: break-all;"
            v-show="profile.data.urlCopyType === type"
            v-for="(name, type) in profile.handler.urlCopyType"
            :key="type"
            class="textarea"
            rows="3"
            v-model="copyTexts[type]"
            placeholder="设置需要复制的文本"
          ></textarea>
        </p>
      </div>
      <div class="modal-footer">
        <button class="button is-primary" @click="submit">复制</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import path from 'path'

import { openExternal, writeText } from '@/api/electron'
import { getFileTypeFromName } from '@/api/tool'
import Icon from '@/components/Icon'
import Message from '@/api/message'

export default {
  name: 'CreateFolder',
  components: {
    Icon,
  },
  data() {
    return {
      copyTexts: {},
    }
  },
  computed: {
    copyText() {
      return this.copyTexts[this.profile.data.urlCopyType]
    },
    ...mapState(['modal', 'profile']),
    ...mapGetters(['externalUrls']),
  },
  methods: {
    close() {
      this.$store.commit('CLOSE_FORMAT_URL_MODAL')
    },
    switchFormatType(type) {
      this.$store.dispatch('SET_PROFILE_STORE', { data: { urlCopyType: type } })
    },
    submit() {
      writeText(this.copyText)
      Message.success(`已复制到剪切板！`)
      this.close()
    },
    openExternal(url) {
      openExternal(url)
    },
    initCopyText() {
      const getTitle = url => {
        const pathname = new URL(url).pathname
        return pathname.substring(pathname.lastIndexOf('/') + 1)
      }
      const getMarkDownTemplate = link => {
        const titleUri = getTitle(link)
        const type = getFileTypeFromName(titleUri)
        const title = path.parse(decodeURIComponent(titleUri)).name
        if (type === 'image') {
          return `![${title}](${link})`
        }
        return `[${title}](${link})`
      }
      const getHtmlTemplate = link => {
        const titleUri = getTitle(link)
        const type = getFileTypeFromName(titleUri)
        const title = path.parse(decodeURIComponent(titleUri)).name
        if (type === 'image') {
          return `<img src="${link}" alt="${title}">`
        }
        if (type === 'movie') {
          return `<video src="${link}"></video>`
        }
        if (type === 'music') {
          return `<audio src="${link}"></audio>`
        }
        return `<a href="${link}">${title}</a>`
      }
      this.copyTexts = {
        url: this.modal.formatUrl.url,
        markdown: getMarkDownTemplate(this.modal.formatUrl.url),
        html: getHtmlTemplate(this.modal.formatUrl.url),
      }
    },
  },
  watch: {
    'modal.formatUrl.show'(val, oldVal) {
      this.$nextTick(() => {
        if (val) {
          this.initCopyText()
        }
        if (this.$refs.autofocus && val) {
          this.$refs.autofocus.focus()
        }
      })
    },
  },
}
</script>
