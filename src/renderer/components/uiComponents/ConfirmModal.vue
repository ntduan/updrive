<template>
  <div class="modal modal-sm basic-modal is-active" @keyup.esc="close" @keyup.enter="confirm" v-show="show">
    <div class="modal-background"></div>
    <div class="modal-content" ref="autofocus" tabindex="0">
      <div class="modal-header">
        <span class="modal-title">{{this.title}}</span>
        <span class="modal-close-button" @click="close">
          <Icon name="icon-x" />
        </span>
      </div>
      <div class="modal-body">
        <slot>
          <p class="has-text-weight-bold">{{content}}</p>
        </slot>
      </div>
      <div class="modal-footer">
        <a class="button is-primary" @click="confirm">确定</a>
        <a class="button is-text" @click="close">取消</a>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from '@/components/UIComponents/Icon'

export default {
  name: 'ConfirmModal',
  data() {
    return {}
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    content: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
  },
  components: {
    Icon,
  },
  methods: {
    close() {
      this.$emit('close')
    },
    confirm() {
      this.$emit('confirm')
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

<style scoped>
.modal-body {
  font-size: 14px;
}
.modal .modal-footer .button {
  margin: 0 8px;
}
.button.is-text {
  text-decoration: none;
}
</style>
