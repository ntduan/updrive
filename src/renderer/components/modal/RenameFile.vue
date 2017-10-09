<template>
  <div class="modal modal-rename is-active" v-show="modal.renameFile.show" tabindex="1" @keyup.esc="close" @keyup.enter="submit">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="modal-header">
        <span class="modal-title">修改路径</span>
        <span class="modal-close-button" @click="close">
          <svg class="svg-icon"><use xlink:href="#icon-x"></use></svg>
        </span>
      </div>
      <div class="modal-body">
        <p style="margin-bottom: 10px;">请输入新的文件路径：</p>
        <div class="field has-addons">
          <p class="control">
            <a class="button is-static" disabled>
              {{user.bucketName}}/
            </a>
          </p>
          <p class="control is-expanded">
            <input class="input" autofocus type="text" v-model="filePath" placeholder="请输入新的文件路径">
          </p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="button is-primary" @click="submit">保存</button>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    computed: {
      ...mapState(['user', 'modal', 'list']),
    },
    methods: {
      close() {
        this.$store.commit('CLOSE_RENAME_FILE_MODAL')
      },
      enter(el) {
        this.$nextTick(() => { el.querySelector('input[autofocus]').focus()})
      },
      submit() {
        this.$store
          .dispatch({ type: 'RENAME_FILE', oldPath: this.modal.renameFile.oldPath, newPath: this.filePath, isFolder: this.isFolder})
          .then(() => this.close())
      }
    },
    created() {
      const tailReg = /\/$/
      if(tailReg.test(this.modal.renameFile.oldPath)) {
        this.filePath = this.modal.renameFile.oldPath.replace(tailReg, '')
        this.isFolder = true
      } else {
        this.filePath = this.modal.renameFile.oldPath
        this.isFolder = false
      }
    },
  }
</script>