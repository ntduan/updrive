<template>
  <transition name="fade" v-on:enter="enter">
    <div class="modal modal-folder is-active" v-show="modal.createFolder.show" tabindex="1" @keyup.esc="close" @keyup.enter="submit">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">创建文件夹</span>
          <span class="modal-close-button" @click="close">
            <svg class="svg-icon"><use xlink:href="#icon-x"></use></svg>
          </span>
        </div>
        <div class="modal-body">
          <p class="control">
            <input class="input" autofocus type="text" v-model="folderName" placeholder="请输入文件夹名称">
          </p>
        </div>
        <div class="modal-footer">
          <button class="button is-primary" @click="submit">创建</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import {
    mapState
  } from 'vuex'

  export default {
    data() {
      return {
        folderName: '',
      }
    },
    methods: {
      close() {
        this.$store.commit('CLOSE_CREATE_FOLDER_MODAL')
      },
      enter(el) {
        this.$nextTick(() => {
          el.querySelector('input[autofocus]').focus()
        })
      },
      submit() {
        this.$store
          .dispatch({
            type: 'CREATE_FOLDER',
            folderName: this.folderName,
            remotePath: this.list.dirInfo.path
          })
          .then(() => this.close())
          .then(() => this.$store.dispatch('REFRESH_LIST'))
      }
    },
    computed: {
      ...mapState(['modal', 'list']),
    }
  }
</script>