<template>
  <div class="modal modal-md basic-modal is-active" v-show="modal.renameFile.show" tabindex="1" @keyup.esc="close" @keyup.enter="submit">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="modal-header">
        <span class="modal-title">重命名</span>
        <span class="modal-close-button" @click="close">
          <Icon name="icon-x" />
        </span>
      </div>
      <div class="modal-body">
        <p style="margin-bottom: 10px;">请输入新的文件名：</p>
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static" disabled>
              {{bucketName}}
            </a>
          </p>
          <p class="control is-expanded">
            <input class="input" autofocus type="text" v-model="filePath" placeholder="请输入新的文件名">
          </p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="button is-primary" :class="{'is-loading': isSubmitting}" @click="submit">保存</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import Icon from '@/components/uiComponents/Icon'

export default {
  name: 'RenameFile',
  components: {
    Icon,
  },
  data() {
    return {
      isSubmitting: false,
    }
  },
  computed: {
    ...mapState(['modal', 'list']),
    ...mapGetters(['bucketName']),
  },
  methods: {
    close() {
      this.$store.commit('CLOSE_RENAME_FILE_MODAL')
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
          type: 'RENAME_FILE',
          oldPath: this.modal.renameFile.oldPath,
          newPath: this.filePath,
          isFolder: this.isFolder,
        })
        .then(() => {
          this.isSubmitting = false
        })
        .then(() => this.close())
        .catch(() => {
          this.isSubmitting = false
        })
    },
  },
  created() {
    const tailSlashReg = /\/$/
    if (tailSlashReg.test(this.modal.renameFile.oldPath)) {
      this.filePath = this.modal.renameFile.oldPath.replace(tailSlashReg, '')
      this.isFolder = true
    } else {
      this.filePath = this.modal.renameFile.oldPath
      this.isFolder = false
    }
  },
}
</script>
