<template>
  <transition :name="transition" mode="in-out" appear :appear-active-class="enterClass" :enter-active-class="enterClass" :leave-active-class="leaveClass"
    @after-leave="afterLeave">
    <div class="message-box animated" v-if="show">
      <article :class="['message', type ? `is-${type}` : '']">
        <div class="message-header">
          <button class="delete touchable" @click="close()" v-if="showCloseButton"></button>
          <span class="icon" v-if="icon">
              <i :class="['fa', `fa-${icon}`]"></i>
            </span> {{ title }}
        </div>
        <div class="message-body" v-if="message">{{ message }}</div>
      </article>
    </div>
  </transition>
</template>

<script>
  import Vue from 'vue'
  export default {
    props: {
      type: String,
      title: String,
      message: String,
      direction: {
        type: String,
        default: 'Down'
      },
      duration: {
        type: Number,
        default: 1500
      },
      container: {
        type: String,
        default: '.messages'
      },
      showCloseButton: Boolean
    },
    data() {
      return {
        $_parent_: null,
        icons: {
          normal: '',
          primary: 'arrow-circle-right',
          info: 'info-circle',
          success: 'check-circle',
          warning: 'exclamation-circle',
          danger: 'times-circle'
        },
        show: true
      }
    },
    created() {
      let $parent = this.$parent
      if (!$parent) {
        let parent = document.querySelector(this.container)
        if (!parent) {
          // Lazy creating `div.notifications` container.
          const className = this.container.replace('.', '')
          const Messages = Vue.extend({
            name: 'Messages',
            render(h) {
              return h('div', {
                'class': {
                  [`${className}`]: true
                }
              })
            }
          })
          $parent = new Messages().$mount()
          document.body.appendChild($parent.$el)
        } else {
          $parent = parent.__vue__
        }
        // Hacked.
        this.$_parent_ = $parent
      }
    },
    mounted() {
      if (this.$_parent_) {
        this.$_parent_.$el.appendChild(this.$el)
        this.$parent = this.$_parent_
        delete this.$_parent_
      }
      if (this.duration > 0) {
        this.timer = setTimeout(() => this.close(), this.duration)
      }
    },
    destroyed() {
      this.$el.remove()
    },
    computed: {
      transition() {
        return `bounce-${this.direction}`
      },
      enterClass() {
        return `bounceIn${this.direction}`
      },
      leaveClass() {
        return `bounceOut${this.direction === 'Up' ? 'Down' : 'Up'}`
      },
      icon() {
        return this.icons[this.type]
      }
    },
    methods: {
      close() {
        clearTimeout(this.timer)
        this.show = false
      },
      afterLeave() {
        this.$destroy()
      }
    }
  }
</script>

<style>
  .messages {
    position: fixed;
    top: 15px;
    left: 0;
    width: 100%;
    z-index: 1024 + 234;
    pointer-events: none;
    transform: translate3d(0, 0, 0);
  }

  .message-box {
    position: absolute;
    left: 50%;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    pointer-events: all;
  }

  .message {
    position: relative;
    right: 50%;
  }

  .delete {
    float: right;
  }

  .icon {
    vertical-align: middle;
  }
</style>