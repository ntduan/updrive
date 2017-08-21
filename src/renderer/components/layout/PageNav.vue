<template>
  <div class="bar">
    <div class="button-zone">
      <div class="dropmenu">
        <a class="button is-primary">
          <span>新建</span>
        </a>
        <div class="dropmenu-list">
          <nav class="panel">
            <a class="panel-block" href="#" @click.prevent="createFolder">
              文件夹
            </a>
            <a class="panel-block" href="#" @click.prevent="uploadFile">
              上传文件
            </a>
            <a class="panel-block" href="#" @click.prevent="uploadDirectory">
              上传文件夹
            </a>
          </nav>
        </div>
      </div>
    </div>
    <div class="nav">
      <div>
        <div class="breadcrumb-bar">
          <div @click.prevent.stop="goto()" class="path-item">{{user.bucketName}}</div>
        </div>
      </div>
      <div v-for="(name, index) in pathArray">
        <div class="breadcrumb-bar">
          <div class="link-icon">
            <div class="link-icon-inner">
              <svg class="a-s-fa-Ha-pa" x="0px" y="0px" width="20px" height="20px" viewBox="0 0 24 24" focusable="false" fill="#000000">
                <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"></path>
              </svg>
            </div>
          </div>
          <div @click.prevent.stop="goto(index)" class="path-item">{{name}}</div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import { path, take, split, identity, filter, compose, concat, join } from 'ramda'
  import { mapState } from 'vuex'

  import { uploadFileDialog, uploadDirectoryDialog } from '../../api/electron.js'

  export default {
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
        const remotePath = index === undefined ? '' : concat(join('/', take(index + 1)(this.pathArray)), '/')
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