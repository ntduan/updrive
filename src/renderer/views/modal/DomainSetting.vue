<template>
  <div class="modal modal-md basic-modal is-active" v-show="modal.domainSetting.show" tabindex="1" @keyup.esc="close" @keyup.enter="submit">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="modal-header">
        <span class="modal-title">加速域名设置</span>
        <span class="modal-close-button" @click="close">
          <Icon name="icon-x" />
        </span>
      </div>
      <div class="modal-body">
        <p class="control">
          <input
            class="input"
            :class="{'is-danger': isDomaininvaild}"
            ref="autofocus"
            type="text"
            v-model="domain"
            placeholder="请输入一个你的服务的加速域名（包含 http:// 或 https://）"
          />
        </p>
        <p class="has-text-danger" v-show="isDomaininvaild">请输入包含 http:// 或 https:// 的正确的域名</p>
        <hr>
        <article class="message">
          <div class="message-body">
            <p>获取链接之前，需要指定一个加速域名用来生成链接（包含 http:// 或 https://）。你可以通过访问<a class="message-link" title="点击查看加速域名" @click="openExternal(externalUrls.domain)">又拍云控制台</a>查看你绑定的加速域名。</p>
            <p>在 2017-10-26 前创建的服务绑定的默认的加速域名的格式：<code>http://{yourBucketName}.b0.upaiyun.com</code></p>
            <p>新创建的服务绑定的默认的加速域名的格式：<code>http://{yourBucketName}.test.upcdn.net</code></p>
          </div>
        </article>
      </div>
      <div class="modal-footer">
        <button class="button is-primary" :class="{'is-loading': isSubmitting}" @click="submit" :disabled="!domain">保存</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import { openExternal } from '@/api/electron.js'
import Icon from '@/components/Icon'
import Message from '@/api/message.js'

export default {
  name: 'CreateFolder',
  components: {
    Icon,
  },
  data() {
    return {
      domain: '',
      isDomaininvaild: false,
      isSubmitting: false,
    }
  },
  computed: {
    ...mapState(['modal', 'profile']),
    ...mapGetters(['externalUrls']),
  },
  methods: {
    close() {
      this.$store.commit('CLOSE_DOMAIN_SETTING_MODAL')
    },
    valid() {
      if (!this.domain) return false
      try {
        new URL(this.domain)
      } catch (err) {
        this.isDomaininvaild = true
        return false
      }
      return true
    },
    submit() {
      if (this.isSubmitting || !this.valid()) return false
      this.isSubmitting = true
      this.$store
        .dispatch('SET_PROFILE_STORE', {
          data: { domain: this.domain },
        })
        .then(() => Message.success('操作成功'))
        .then(() => {
          this.isSubmitting = false
        })
        .then(() => this.close())
        .catch(() => {
          this.isSubmitting = false
        })
    },
    openExternal(url) {
      openExternal(url)
    },
  },
  watch: {
    'modal.domainSetting.show'(val, oldVal) {
      this.$nextTick(() => {
        if (val) {
          this.domain = this.profile.data.domain
          this.isDomaininvaild = false
        }
        if (this.$refs.autofocus && val) {
          this.$refs.autofocus.focus()
        }
      })
    },
  },
}
</script>
