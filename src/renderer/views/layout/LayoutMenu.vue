<template>
  <aside class="menu">
    <div class="profile" @click="toggleProfileMenu">
      <div class="profile-name">
        <div class="profile-name-content">{{auth.user.operatorName}}/{{auth.user.bucketName}}</div>
        <Icon class="icon-angle-down" name="icon-angle-down" />
      </div>
      <div class="profile-usage">已使用 {{auth.usage | digiUnit}}</div>
      <div v-show="isShowProfileMenu">
        <div class="dropdown-background"></div>
        <div>
          <div class="dropdown-content" @click.stop="void 0">
            <div class="dropdown-content-profile-name">{{auth.user.operatorName}}/{{auth.user.bucketName}}</div>
            <hr class="dropdown-divider">
            <a class="dropdown-item" @click.prevent="openDomainSetting(true)">
              加速域名设置
            </a>
            <hr class="dropdown-divider">
            <a class="dropdown-item" @click.prevent="openExternal(externalUrls.domain)">
              云存储服务设置
            </a>
            <a class="dropdown-item" @click.prevent="openExternal(externalUrls.createBucket)">
              创建云存储服务
            </a>
            <a class="dropdown-item" @click.prevent="openExternal(externalUrls.issues)">
              报告一个问题
            </a>
            <hr class="dropdown-divider">
            <a class="dropdown-item" @click.prevent="toggleAccount">
              切换账号
            </a>
          </div>
        </div>
      </div>
    </div>
    <hr class="dropdown-divider" style="margin-bottom:0;margin-top:0;">
    <ul class="menu-list">
      <li>
        <router-link :to="{name: 'main'}" :class="{'is-active': currentRouteName === 'main'}">
          <Icon name="icon-files" />
          全部文件
        </router-link>
      </li>
      <li>
        <router-link :to="{name: 'task'}" :class="{'is-active': currentRouteName === 'task'}">
          <Icon name="icon-task" />
          任务列表<span v-show="workingTaskNum" class="task-tag tag is-danger is-rounded">{{workingTaskNum}}</span>
        </router-link>
      </li>
    </ul>
    <div class="app-info" @click="toggleAboutmodal(true)">
      <div>{{appName}} v{{appVersion}}</div>
      <div class="app-upgrade-tip" v-show="upgradeUrl"></div>
    </div>
    <div class="modal basic-modal is-active about-modal" @click.stop="toggleAboutmodal(false)" v-show="showAboutModal" tabindex="1" @keyup.esc="toggleAboutmodal(false)">
      <div class="modal-content" @click.stop="void 0">
        <div class="modal-header">
          <span class="modal-title">关于</span>
          <span class="modal-close-button" @click.stop="toggleAboutmodal(false)">
            <Icon name="icon-x" />
          </span>
        </div>
        <div class="modal-body">
          <div class="brand-block">
            <div class="brand-img">
              <img src="../../imgs/updrive.svg" alt="updrive">
            </div>
            <div class="brand-name">
              {{appName}}
            </div>
            <div class="brand-version">
              v{{appVersion}}
            </div>
            <div>github: <a @click.prevent.stop="openExternal(externalUrls.repository)">{{externalUrls.repository}}</a></div>
            <div>历史版本下载: <a @click.prevent.stop="openExternal(externalUrls.releases)">{{externalUrls.releases}}</a></div>
          </div>
          <div class="change-logs">
            <div class="upgrade-download-tip" v-show="upgradeUrl">
              <span class="has-text-danger">发现新版本 v{{latestRelease.version}}！</span>
              <a :href="upgradeUrl">立即下载</a>
            </div>
            <div class="change-logs-content" v-show="upgradeData.length">
              <div>
                <article class="message is-success">
                  <div class="message-body">
                    <div class="version-message" v-for="release in upgradeData" :key="release.version">
                      <h3>v{{release.version}}</h3>
                      <ul>
                        <li v-for="(log, index) in release.change_logs" :key="index" v-if="release.change_logs">
                          {{log}}
                        </li>
                      </ul>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import os from 'os'
import semver from 'semver'

import { digiUnit } from '@/api/tool'
import Icon from '@/components/Icon'
import { openExternal, getVersion, getName } from '@/api/electron.js'

export default {
  name: 'LayoutMenu',
  components: {
    Icon,
  },
  data() {
    return {
      isShowProfileMenu: false,
      appVersion: '',
      appName: '',
      showAboutModal: false,
      upgradeUrl: '',
      latestRelease: {},
      upgradeData: [],
    }
  },
  computed: {
    workingTaskNum() {
      return this.task.list.filter(
        file => file.status !== this.task.status.completed.value && file.status !== this.task.status.error.value,
      ).length
    },
    currentRouteName() {
      return this.$route.name
    },
    ...mapState(['task', 'auth']),
    ...mapGetters(['externalUrls']),
  },
  created() {
    this.getUsage()
    this.getAppInfo()
    this.getUpgradeInfo()
  },
  methods: {
    openDomainSetting(value) {
      this.$store.commit('OPEN_DOMAIN_SETTING_MODAL')
      this.isShowProfileMenu = false
    },
    toggleAboutmodal(value) {
      this.showAboutModal = value !== undefined ? value : !this.showAboutModal
    },
    toggleProfileMenu() {
      this.isShowProfileMenu = !this.isShowProfileMenu
    },
    toggleAccount() {
      this.$router.push({ name: 'login' })
      this.$store.dispatch('LOGOUT')
      this.isShowProfileMenu = false
    },
    openExternal(href) {
      openExternal(href)
      this.isShowProfileMenu = false
    },
    getUsage() {
      this.$store.dispatch('GET_USAGE')
    },
    getAppInfo() {
      this.appVersion = getVersion()
      this.appName = getName()
    },
    getUpgradeInfo() {
      const platform = os.platform() === 'darwin' || os.platform() === 'win32' ? os.platform() : 'other'
      fetch('https://raw.githubusercontent.com/aniiantt/updrive/release/upgrade.json')
        .then(response => {
          return response.json()
        })
        .then(data => {
          this.upgradeData = data
          this.latestRelease = this.upgradeData[0]
          if (semver.lt(this.appVersion, this.latestRelease.version)) {
            this.upgradeUrl = this.latestRelease.package_urls[platform]
          }
        })
    },
  },
  filters: {
    digiUnit,
  },
}
</script>
