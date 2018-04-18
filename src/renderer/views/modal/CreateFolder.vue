<template>
  <div class="modal modal-sm basic-modal is-active" v-show="modal.createFolder.show" tabindex="1" @keyup.esc="close" @keyup.enter="submit">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="modal-header">
        <span class="modal-title">创建文件夹</span>
        <span class="modal-close-button" @click="close">
          <Icon name="icon-x" />
        </span>
      </div>
      <div class="modal-body">
        <p class="control">
          <input class="input" ref="autofocus" type="text" v-model="folderName" placeholder="请输入文件夹名称">
        </p>
      </div>
      <div class="modal-footer">
        <button class="button is-primary" :class="{'is-loading': isSubmitting}" @click="submit" :disabled="!folderName">创建</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import Icon from '@/components/Icon'

export default {
  name: 'CreateFolder',
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
      this.$store.commit('CLOSE_CREATE_FOLDER_MODAL')
    },
    valid() {
      if (!this.folderName) return false
      return true
    },
    submit() {
      if (this.isSubmitting || !this.valid()) return false
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
  watch: {
    'modal.createFolder.show'(val, oldVal) {
      this.$nextTick(() => {
        if (this.$refs.autofocus && val) {
          this.$refs.autofocus.focus()
        }
      })
    },
  },
}
</script>
