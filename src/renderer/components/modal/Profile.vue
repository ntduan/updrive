<template>
  <div class="modal modal-md basic-modal is-active" v-show="modal.profile.show" tabindex="1" @keyup.esc="close" @keyup.enter="submit">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="modal-header">
        <span class="modal-title">设置</span>
        <span class="modal-close-button" @click="close">
          <Icon name="icon-x" />
        </span>
      </div>
      <div class="modal-body">
        <p class="control">
          <input class="input" autofocus type="text" v-model="folderName" placeholder="请输入文件夹名称">
        </p>
      </div>
      <div class="modal-footer">
        <button class="button is-primary" :class="{'is-loading': isSubmitting}" @click="submit">创建</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import Icon from '@/components/uiComponents/icon'

export default {
  name: 'Profile',
  components: {
    Icon,
  },
  data() {
    return {
      folderName: '',
      isSubmitting: false,
    }
  },
  computed: {
    ...mapState(['modal', 'list']),
  },
  methods: {
    close() {
      this.$store.commit('CLOSE_PROFILE_MODAL')
    },
    enter(el) {
      this.$nextTick(() => {
        el.querySelector('input[autofocus]').focus()
      })
    },
    submit() {
      if (this.isSubmitting) return false
      this.isSubmitting = true
      this.$store
        .dispatch({
          type: 'CREATE_FOLDER',
          folderName: this.folderName,
          remotePath: this.list.dirInfo.path,
        })
        .then(() => {
          this.folderName = ''
          this.isSubmitting = false
        })
        .then(() => this.close())
        .catch(() => {
          this.isSubmitting = false
        })
    },
  },
}
</script>
