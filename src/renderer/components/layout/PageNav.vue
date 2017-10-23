<template>
  <div class="bar">
    <div class="button-zone">
      <div class="dropdown is-hoverable">
        <div class="dropdown-trigger">
          <button class="button is-primary">
            <span>新建</span>
          </button>
        </div>
        <div class="dropdown-menu">
          <div class="dropdown-content">
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
        <ul>
          <li :class="{'is-active': !pathArray.length}">
            <a @click.prevent.stop="goto()">{{user.bucketName}}</a>
          </li>
          <li :class="{'is-active': index === pathArray.length - 1}" v-for="(name, index) in pathArray">
            <a @click.prevent.stop="goto(index)">{{name}}</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>


<script>
  import { path, take, split, identity, filter, compose, concat, join } from 'ramda'
  import { mapState } from 'vuex'

  import { uploadFileDialog, uploadDirectoryDialog } from '@/api/electron.js'

  export default {
    name: 'PageNav',
    computed: {
      pathArray() {
        return compose(filter(identity), split('/'))(this.list.dirInfo.path)
      },
      currentDirPath() {
        return path(['list', 'dirInfo', 'path'], this)
      },
      ...mapState(['user', 'list']),
    },
    methods: {
      goto(index) {
        const remotePath = index === undefined ? '/' : concat(join('/', take(index + 1)(this.pathArray)), '/')
        return this.$store.dispatch({ type: 'GET_LIST_DIR_INFO', remotePath, action: 0 })
      },
      // 新建文件夹
      createFolder() {
        return this.$store.commit('OPEN_CREATE_FOLDER_MODAL')
      },
      // 上传文件
      uploadFile() {
        return uploadFileDialog()
          .then(filePaths => {
            if (!filePaths || !filePaths.length) return
            return this.$store
              .dispatch({
                type: 'UPLOAD_FILES',
                remotePath: this.currentDirPath,
                localFilePaths: filePaths,
              })
          })
      },
      // 上传文件夹
      uploadDirectory() {
        return uploadDirectoryDialog()
          .then(folderPaths => {
            if (!folderPaths || !folderPaths.length) return
            return this.$store
              .dispatch({
                type: 'UPLOAD_FILES',
                remotePath: this.currentDirPath,
                localFilePaths: folderPaths,
              })
          })
      }
    }
  }
</script>