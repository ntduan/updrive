<template>
  <section class="hero is-fullheight is-dark is-bold">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-vcentered">
          <div class="column is-8 is-offset-2">
            <div class="box">
              <div class="columns is-variable is-5">
                <div class="column is-6 account-history" v-if="authHistoryList.length">
                  帐号历史
                  <ul class="menu-list account-history-list">
                    <li v-for="record in authHistoryList" :key="record.key">
                      <a class="record" @click="selectRecord(record)">
                        {{record.key}}<span class="record-delete" @click.stop="deleteRecord(record)">删除</span>
                      </a>
                    </li>
                  </ul>
                </div>
                <div class="column">
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
                    <div class="field">
                      <div class="control">
                        <label class="checkbox">
                          <input type="checkbox" v-model="rememberMe"> 记住帐号
                        </label>
                      </div>
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
      </div>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex'

import { errorHandler } from '@/api/tool.js'

export default {
  name: 'login',
  data() {
    return {
      bucketName: '',
      operatorName: '',
      password: '',
      rememberMe: true,
      authHistoryList: [],
    }
  },
  computed: {
    user() {
      return this.auth.user
    },
    ...mapState(['auth']),
  },
  methods: {
    submit() {
      this.signIn(this.bucketName, this.operatorName, this.password).then(() => {
        if (this.rememberMe) {
          this.user.save()
        }
      })
    },
    signIn(bucketName, operatorName, password) {
      return this.$store
        .dispatch({
          type: 'VERIFICATION_ACCOUNT',
          bucketName,
          operatorName,
          password,
        })
        .then(result => {
          this.$router.push({
            name: 'main',
          })
        })
        .catch(errorHandler)
    },
    selectRecord(record) {
      this.signIn(record.bucketName, record.operatorName, record.password)
    },
    deleteRecord(record) {
      this.user.deleteAuthHistory(record.key).then(() => {
        this.getList()
      })
    },
    getList() {
      return this.user.getAuthHistory().then(data => {
        this.authHistoryList = data.data
      })
    },
  },
  created() {
    this.getList()
  },
}
</script>
