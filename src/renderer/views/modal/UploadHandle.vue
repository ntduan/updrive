<template>
  <div class="modal modal-full basic-modal is-active" v-show="modal.uploadHandle.show" @keyup.esc="close" @keyup.enter="confirm">
    <div class="modal-content" ref="autofocus" tabindex="0">
      <div class="modal-header">
        <span class="modal-title">上传文件</span>
        <span class="modal-close-button" @click="close">
          <Icon name="icon-x" />
        </span>
      </div>
      <div class="modal-body">
        <local-image />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import Icon from '@/components/Icon'
import LocalImage from '@/components/LocalImage'

export default {
  name: 'UploadHandle',
  data() {
    return {}
  },
  computed: {
    ...mapState(['modal']),
  },
  components: {
    Icon,
    LocalImage,
  },
  methods: {
    close() {
      this.$store.commit('CLOSE_UPLOAD_HANDLE_MODAL')
    },
  },
  watch: {
    show(val, oldVal) {
      this.$nextTick(() => {
        if (this.$refs.autofocus && val) {
          this.$refs.autofocus.focus()
        }
      })
    },
  },
}
</script>