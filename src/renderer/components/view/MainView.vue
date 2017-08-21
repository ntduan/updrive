<template>
  <div class="list-view">
    <div class="list-view-main" ref='listView' tabindex="-1" @keydown="keydown" @dragstart="dragstart" @dragleave="dragleave" @dragend="dragend" @dragover="dragover" @drop="drop">
      <div class="list-operation">
        <div class="list-operation-item" @click="getLink" :class="listOperationSingelItemClass">
          <svg class="svg-icon">
            <use xlink:href="#icon-link"></use>
          </svg>
          获取链接
        </div>
        <div class="list-operation-item" @click="downloadFile" :class="listOperationSingelItemClass">
          <svg class="svg-icon">
            <use xlink:href="#icon-icondownload"></use>
          </svg>
          下载
        </div>
        <div class="list-operation-item" @click="dblclickItem" :class="listOperationSingelItemClass">
          <svg class="svg-icon">
            <use xlink:href="#icon-browse"></use>
          </svg>
          查看
        </div>
        <div class="list-operation-item" @click="deleteFile" :class="listOperationItemClass">
          <svg class="svg-icon">
            <use xlink:href="#icon-delete"></use>
          </svg>
          删除
        </div>
        <div class="list-operation-item" @click="renameFile" :class="listOperationSingelItemClass">
          <svg class="svg-icon">
            <use xlink:href="#icon-edit"></use>
          </svg>
          修改路径
        </div>
      </div>
      <div class="list" @contextmenu.prevent="contextmenu()">
        <div class="files-list" v-if="list.dirInfo.data.length">
          <div class="files-list-column">
            <div class="column-file-name table-column"></div>
            <div class="column-last-modified table-column"></div>
            <div class="column-file-type table-column"></div>
            <div class="column-file-size table-column"></div>
          </div>
          <div class="files-list-header">
            <div class="file-info-item column-file-name" @click="sort('filename')">名称</div>
            <div class="file-info-item column-last-modified" @click="sort('lastModified')">修改日期</div>
            <div class="file-info-item column-file-type" @click="sort('filetype')">类型</div>
            <div class="file-info-item column-file-size" @click="sort('size')">大小</div>
          </div>
          <div class="files-list-body">
            <div
              class="files-list-item"
              v-for="(file, index) in list.dirInfo.data"
              :class="{ 'item-selected': (listItemState[file.uri] && listItemState[file.uri].selected) }"
              :tabindex="getListTabIndex(file.uri)"
              @click.stop="selectItem(file, $event, index)"
              @dblclick.stop="dblclickItem(file.uri)"
              @contextmenu.prevent="contextmenuItem(file)"
            >
              <div class="name file-info-item">
                <i class="res-icon" :class="getFileIconClass(file.folderType, file.filename)"></i>{{file.filename}}
              </div>
              <div class="last-modified file-info-item">{{file.lastModified | timestamp}}</div>
              <div class="mime file-info-item">{{file.filetype}}</div>
              <div class="size file-info-item">{{(file.folderType === 'F' ? '-' : file.size) | digiUnit}}</div>
            </div>
          </div>
        </div>
        <div v-if="!list.dirInfo.data.length" class="empty-list">
          <div class="empty-list-content">
            <p>该文件夹为空</p>
            <p>拖动上传文件</p>
          </div>
        </div>
      </div>
    </div>
    <div class="list-view-detail" v-show="isViewDetail">
      <div class="list-view-detail-header">
        <div>
          <h4>
            {{fileDetail.basicInfo.filename}}
          </h4>
        </div>
        <div class="separate-line-wrap">
          <div class="separate-line"></div>
        </div>
        <span class="list-view-detail-close" @click="toggleShowViewDetail">
          <svg x="0px" y="0px" width="16px" height="16px" viewBox="0 0 10 10" focusable="false">
            <polygon class="a-s-fa-Ha-pa" fill="#000000" points="10,1.01 8.99,0 5,3.99 1.01,0 0,1.01 3.99,5 0,8.99 1.01,10 5,6.01 8.99,10 10,8.99 6.01,5 "></polygon>
          </svg>
        </span>
      </div>
      <div class="list-view-detail-content">
        <div>
          <div v-for="(value, key) in fileDetail.headerInfo" class="list-view-detail-content-item">
            <div class="list-view-detail-content-item-value"><span style="font-weight:bold">{{key}} →&nbsp;&nbsp;</span>{{value}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    sort, nth, indexOf, equals, assocPath, map, compose, assoc, path, cond, and, prop, both, T, always, keys, filter, apply,
    range, pick, merge, converge, length, not, __, reduce, identity, findIndex, last, pipe, propEq, slice, uri, pluck, concat, remove, append
  } from 'ramda'
  import { mapState, mapGetters, dispatch, commit } from 'vuex'
  import Path from 'path'

  import { timestamp, digiUnit } from '../../tools'
  import { uploadFileDialog, uploadDirectoryDialog, downloadFileDialog, messgaeDialog, createContextmenu, showContextmenu, openExternal, windowOpen, writeText } from '../../api/electron.js'

  export default {
    data() {
      return {
        isViewDetail: false
      }
    },
    computed: {
      listOperationItemClass() {
        return {
          disabled: !this.selected.length
        }
      },
      sortInfo() {
        return path(['list', 'sortInfo'], this) || {}
      },
      listOperationSingelItemClass() {
        return {
          disabled: !this.uniqueSelectedUri
        }
      },
      uniqueSelectedUri() {
        const { selected } = this
        if (selected && selected.length !== 1) return ''
        return selected[0]
      },
      selected() {
        return path(['list', 'selected'], this) || []
      },
      listItemState() {
        const setSelected = reduce((result, value) => assocPath([value, 'selected'], true)(result), __, this.selected)
        return setSelected({})
      },
      currentDirPath() {
        return path(['list', 'dirInfo', 'path'], this)
      },
      fileDetail() {
        return path(['list', 'fileDetail'], this, {
          basicInfo: {},
          headerInfo: {},
        })
      },
      ...mapState(['user', 'list']),
      ...mapGetters(['baseHref', 'backUri', 'forwardUri']),
    },
    methods: {
      toggleShowViewDetail() {
        this.isViewDetail = !this.isViewDetail
      },
      getFileIconClass(folderType, filename = '') {
        const extensionName = Path.extname(filename).toLocaleLowerCase()
        return {
          'icon-folder': folderType === 'F',
          'icon-image': [ '.bmp', '.gif', '.ico', '.jpg', '.jpeg', '.png', '.svg', '.webp', '.gifv' ].includes(extensionName),
          'icon-audio': [ '.mp3', '.m4a', '.ogg' ].includes(extensionName),
          'icon-video': [ '.avi', '.mp4', '.flv', '.mov', '.3gp', '.asf', '.wmv', '.mpg', '.f4v', '.m4v', '.mkv' ].includes(extensionName),
          'icon-html': ['.htm', '.html', '.vue'].includes(extensionName),
          'icon-js': ['.js', '.jsx'].includes(extensionName),
          'icon-style': ['.css', '.sass', '.less', '.stylus'].includes(extensionName),
        }
      },
      dragstart($event) {
        return false
      },
      dragleave($event) {
        return false
      },
      dragend($event) {
        return false
      },
      dragover($event) {
        return false
      },
      drop($event) {
        $event.preventDefault()
        this.$store.dispatch({
          type: 'UPLOAD_FILES',
          remotePath: this.currentDirPath,
          localFilePaths: pluck('path', $event.dataTransfer.files),
        })
        return false
      },
      getListTabIndex(uri) {
        return this.selected.includes(uri) ? 0 : -1
      },
      sort(key) {
        this.$store.commit('SET_SORT_INFO', {
          key: key,
          isReverse: this.sortInfo.key === key ? !this.sortInfo.isReverse : this.sortInfo.isReverse,
        })
      },
      findFileByUri(uri = this.uniqueSelectedUri) {
        return last(this.list.dirInfo.data.filter(data => data.uri === uri))
      },
      listGetFocus() {
        this.$refs.listView.focus()
      },
      keydown($event) {
        const { ctrlKey, key, shiftKey, altKey } = $event
        const uriData = pluck('uri', this.list.dirInfo.data)
        const selectUri = selected => this.$store.commit({ type: 'SET_SELECT_LIST', selected: selected })
        if (ctrlKey && !shiftKey && key === 'a') {
          selectUri(uriData)
        }
        // 滚动
        if (!ctrlKey && !shiftKey && (key === 'j' || key === 'ArrowDown')) {
          const currentLastIndex = indexOf(last(this.selected), uriData)
          const targetUri = (currentLastIndex + 1 > uriData.length - 1) ? last(uriData) : nth(currentLastIndex + 1, uriData)
          selectUri([targetUri])
        }
        if (!ctrlKey && !shiftKey && (key === 'k' || key === 'ArrowUp')) {
          const currentLastIndex = indexOf(last(this.selected), uriData)
          const targetUri = (currentLastIndex - 1 < 0) ? nth(0, uriData) : nth(currentLastIndex - 1, uriData)
          selectUri([targetUri])
        }
        if (!ctrlKey && shiftKey && (key === 'j' || key === 'ArrowDown')) {
          const currentLastIndex = indexOf(last(this.selected), uriData)
          const targetUri = (currentLastIndex + 1 > uriData.length - 1) ? last(uriData) : nth(currentLastIndex + 1, uriData)
          selectUri(append(targetUri, this.selected))
        }
        if (!ctrlKey && shiftKey && (key === 'k' || key === 'ArrowUp')) {
          const currentLastIndex = indexOf(last(this.selected), uriData)
          const targetUri = (currentLastIndex - 1 < 0) ? nth(0, uriData) : nth(currentLastIndex - 1, uriData)
          selectUri(append(targetUri, this.selected))
        }
        if (key === 'ArrowRight') {
          if(this.forwardUri !== undefined) {
            this.$store.dispatch({ type: 'GET_LIST_DIR_INFO', remotePath: this.forwardUri, action: 1 })
              .then(() => this.listGetFocus())
          }
        }
        if ((key === 'ArrowLeft') || key === 'Backspace') {
          if(this.backUri !== undefined) {
            this.$store.dispatch({ type: 'GET_LIST_DIR_INFO', remotePath: this.backUri, action: -1 })
              .then(() => this.listGetFocus())
          }
        }
        if (!ctrlKey && !shiftKey && key === 'Enter') {
          this.dblclickItem(last(this.selected))
        }
      },
      selectItem({uri}, $event, index) {
        const data = this.list.dirInfo.data
        const getSelectedList = () => {
          const { selected } = this
          if ($event.shiftKey) {
            const lastIndex = findIndex(pipe(last, propEq('uri'))(selected), data)
            const getBacthFile = lastIndex < index ? slice(lastIndex, index + 1) : slice(index, lastIndex + 1)
            const addedList = pluck('uri', getBacthFile(data))
            return $event.ctrlKey ? concat(selected, addedList) : addedList
          } else if ($event.ctrlKey) {
            return !~selected.indexOf(uri) ? append(uri, selected) : remove(selected.indexOf(uri), 1, selected)
          } else {
            return [uri]
          }
        }
        if(this.isViewDetail) {
          this.getFileDetail(uri)
        }
        this.$store.commit({ type: 'SET_SELECT_LIST', selected: getSelectedList() })
      },
      contextmenuItem({uri}) {
        if (!this.selected.includes(uri)) this.$store.commit({ type: 'SET_SELECT_LIST', selected: [uri] })
      },
      // 右键点击
      contextmenu() {
        this.$nextTick(this.showContextMenu)
      },
      // 显示菜单
      showContextMenu() {
        console.log(this.uniqueSelectedUri)
        showContextmenu({
          appendItems: [
            { hide: !this.uniqueSelectedUri, label: '打开', click: () => this.dblclickItem(this.uniqueSelectedUri) },
            { hide: !this.uniqueSelectedUri, label: '在浏览器中打开', click: () => openExternal(this.getUrl()) },
            { hide: !this.uniqueSelectedUri, type: 'separator' },
            { hide: !this.uniqueSelectedUri, label: '查看详细信息', click: () => this.getFileDetail() },
            { hide: !this.uniqueSelectedUri, label: '获取链接', click: () => this.getLink() },
            { hide: !this.uniqueSelectedUri, label: '修改路径...', click: () => this.renameFile() },
            { hide: !this.selected.length, label: '下载', click: () => this.downloadFile() },
            { hide: !this.uniqueSelectedUri, type: 'separator' },
            { hide: false, label: '新建文件夹', click: () => this.createFolder() },
            { hide: false, label: '上传文件', click: () => this.uploadFile() },
            { hide: false, label: '上传文件夹', click: () => this.uploadDirectory() },
            { hide: !this.uniqueSelectedUri, type: 'separator' },
            { hide: !this.selected.length, label: '删除', click: () => this.deleteFile() },
          ]
        })
      },
      // 查看详细信息
      getFileDetail(uri = '') {
        this.isViewDetail = true
        if(this.uniqueSelectedUri || uri) {
          this.$store.dispatch({
            type: 'GET_FILE_DETAIL_INFO',
            filePath: this.getUrl(uri),
            basicInfo: this.findFileByUri(uri),
          })
        }
      },
      getUrl(uri = this.uniqueSelectedUri) {
        return this.baseHref + encodeURIComponent(uri)
      },
      // 链接
      getLink(uri) {
        writeText(this.getUrl())
      },
      // 全选
      selectAll($event) {
        console.info($event)
      },
      // 双击
      dblclickItem(uri) {
        // 如果是文件夹,则打开目录
        if (/\/$/.test(uri)) {
          const historyUri = this.currentDirPath
          this.$store.dispatch({ type: 'GET_LIST_DIR_INFO', remotePath: uri, action: 0 })
            .then(() => this.listGetFocus())
        } else {
          window.open(this.getUrl(), this.getUrl(), { frame: false })
        }
      },
      // 删除文件
      deleteFile() {
        const { selected } = this
        return messgaeDialog({
          title: '提示',
          buttons: ['删除', '取消'],
          defaultId: 1,
          message: `确定要删除「${Path.basename(selected[0])}」${selected.length > 1 ? `等${selected.length}个文件` : ''}吗?`,
          detail: '操作后文件无法恢复',
        })
          .then(index => {
            if (index !== 0) return
            this.$store
              .dispatch({ type: 'DELETE_FILE', selectedPaths: selected })
          })
      },
      // 下载文件
      downloadFile() {
        if (!this.selected.length) return
        return downloadFileDialog()
          .then(path => {
            if (!path) return
            this.$store.dispatch({ type: 'DOWNLOAD_FILES', downloadPath: this.selected, destPath: path })
          })
      },
      // 修改路径
      renameFile() {
        if (!this.uniqueSelectedUri) return
        this.$store.commit('RENAME_FILE_SET_OLD_PATH', this.uniqueSelectedUri)
        this.$store.commit('OPEN_RENAME_FILE_MODAL')
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
    },
    filters: {
      timestamp,
      digiUnit,
    },
    name: 'ListView'
  }

</script>