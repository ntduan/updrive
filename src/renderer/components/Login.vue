<template>
  <section class="hero is-fullheight is-dark is-bold">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-vcentered">
          <div class="column is-6 is-offset-3">
            <div class="box">
              <form @submit.prevent="submit" class="login-form" novalidate>
                <div class="field">
                  <label class="label">服务名</label>
                  <p class="control">
                    <input class="input" type="text" v-model.trim="bucketName" placeholder="服务名称">
                  </p>
                </div>
                <div class="field">
                  <label class="label">操作员</label>
                  <p class="control">
                    <input class="input" type="text" v-model.trim="operatorName" placeholder="操作员账号">
                  </p>
                </div>
                <div class="field">
                  <label class="label">密码</label>
                  <p class="control">
                    <input class="input" type="password" v-model.trim="password" placeholder="操作员密码">
                  </p>
                </div>
                <hr>
                <div class="field">
                  <p class="control">
                    <button type="submit" class="button is-primary is-fullwidth">登录</button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import {
    mapState
  } from 'vuex'

  import {
    md5sum
  } from '@/api/tool.js'

  export default {
    name: 'login',
    data() {
      return {
        bucketName: '',
        operatorName: '',
        password: '',
      }
    },
    methods: {
      submit() {
        this.$store
          .dispatch({
            type: 'VERIFICATION_ACCOUNT',
            bucketName: this.bucketName,
            operatorName: this.operatorName,
            password: this.password,
          })
          .then(result => {
            this.$router.push({
              name: 'main'
            })
          })
          .catch(error => {
            alert(error)
          })
      }
    }
  }
</script>