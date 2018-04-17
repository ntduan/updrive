<template>
  <div class="bar">
    <div class="button-zone">
      <div class="dropdown" :class="{'is-active': isShowCreateDropmenu}" @click="triggerCreateDropmenu()">
        <div class="dropdown-trigger">
          <button class="button is-primary">
            <span>新建</span>
          </button>
        </div>
        <div class="dropdown-background" v-show="isShowCreateDropmenu"></div>
        <div class="dropdown-menu">
          <div class="dropdown-content" @click.stop="void 0">
            <a class="dropdown-item" @click.prevent="createFolder">
              文件夹
            </a>
            <a class="dropdown-item" @click.prevent="uploadFile">
              上传文件
            </a>
            <a class="dropdown-item" @click.prevent="uploadDirectory">
              上传文件夹
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="nav">
      <nav class="breadcrumb is-medium">
        <ul v-if="!pageTitle">
          <li :class="{'is-active': !pathArray.length}">
            <a @click.prevent.stop="goto()">{{auth.user.bucketName}}</a>
          </li>
          <li :class="{'is-active': index === pathArray.length - 1}" v-for="(name, index) in pathArray" :key="name + index">
            <a @click.prevent.stop="goto(index)">{{name}}</a>
          </li>
        </ul>
        <ul v-if="pageTitle">
          <li class="is-active">
            <a>{{pageTitle}}</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import { path, take, split, identity, filter, compose, concat, join } from 'ramda'
import { mapState, mapGetters } from 'vuex'

import Icon from '@/components/Icon'
import { uploadFileDialog, uploadDirectoryDialog } from '@/api/electron.js'

export default {
  name: 'LayoutNav',
  components: {
    Icon,
  },
  data() {
    return {
      isShowCreateDropmenu: false,
    }
  },
  computed: {
    pathArray() {
      return compose(filter(identity), split('/'))(this.list.dirInfo.path)
    },
    pageTitle() {
      return this.$route.meta && this.$route.meta.pageTitle
    },
    currentDirPath() {
      return path(['list', 'dirInfo', 'path'], this)
    },
    ...mapState(['list', 'auth']),
  },
  methods: {
    triggerCreateDropmenu() {
      this.isShowCreateDropmenu = !this.isShowCreateDropmenu
    },
    goto(index) {
      const remotePath =
        index === undefined ? '/' : concat('/', concat(join('/', take(index + 1)(this.pathArray)), '/'))
      return this.$store.dispatch({
        type: 'GET_LIST_DIR_INFO',
        remotePath,
        action: 0,
      })
    },
    //
    setProfile() {
      return this.$store.commit('OPEN_PROFILE_MODAL')
      this.isShowCreateDropmenu = false
    },
    // 新建文件夹
    createFolder() {
      this.$store.commit('OPEN_CREATE_FOLDER_MODAL')
      this.isShowCreateDropmenu = false
    },
    // 上传文件
    uploadFile() {
      uploadFileDialog().then(filePaths => {
        if (!filePaths || !filePaths.length) return
        return this.$store.dispatch('UPLOAD_FILES', {
          remotePath: this.currentDirPath,
          localFilePaths: filePaths,
        })
      })
      this.isShowCreateDropmenu = false
    },
    // 上传文件夹
    uploadDirectory() {
      uploadDirectoryDialog().then(folderPaths => {
        if (!folderPaths || !folderPaths.length) return
        return this.$store.dispatch('UPLOAD_FILES', {
          remotePath: this.currentDirPath,
          localFilePaths: folderPaths,
        })
      })
      this.isShowCreateDropmenu = false
    },
  },
}
</script>
