<template>
  <div class="task-container">
    <div class="tabs">
      <ul>
        <li :class="{
          'is-active': task.tabKey === key,
        }" v-for="(value, key) in task.taskType" :key="key" @click="switchTab(key)">
          <a>{{value}}</a>
        </li>
      </ul>
      <div class="handle">
        <a @click="toggleShowClearCompletedModal(true)">清除已完成记录</a>
      </div>
    </div>
    <div class="list">
      <div class="files-list" v-if="!isEmptyList">
        <div class="files-list-column">
          <div class="column-file-name table-column" />
          <div class="column-file-size table-column" />
          <div class="column-file-status table-column" />
          <div class="column-file-handle table-column" />
        </div>
        <div class="files-list-header">
          <div class="column-file-name file-info-item">名称</div>
          <div class="column-file-size file-info-item">大小</div>
          <div class="column-file-status file-info-item">状态</div>
          <div class="column-file-handle file-info-item">操作</div>
        </div>
        <div class="files-list-body">
          <div
            class="files-list-item"
            v-for="file in currentList"
            @dblclick.prevent.stop="openFile(file)"
            :key="file.id"
          >
            <div class="name file-info-item">
              <a @click.prevent.stop="openFile(file)" title="打开文件">
                <i class="res-icon" :class="getFileIconClass(file.filename)"></i>{{file.filename}}
              </a>
            </div>
            <div class="size file-info-item">
              {{file.transferred | digiUnit}} / {{file.total | digiUnit}}
            </div>
            <div class="status file-info-item">
              <template v-if="file.errorMessage">
                <p class="has-text-danger">{{file.errorMessage}}</p>
              </template>
              <template v-else>
                <template v-if="isUploading(file)">
                  <progress-bar :progress='getProgress(file)' class="progress-bar"></progress-bar>
                  <div class="task-state">
                    <span>
                      {{file.status && task.status[file.status].name}} {{getProgress(file) | percent}}
                    </span>
                    <span class="task-state-time">
                      {{file.startTime | timestamp('YYYY-MM-DD')}}
                    </span>
                  </div>
                </template>
                <template v-if="isDownloading(file)">
                  <progress-bar :progress='getProgress(file)' class="progress-bar"></progress-bar>
                  <div class="task-state">
                    <span>
                      {{file.status && task.status[file.status].name}} {{getProgress(file) | percent}}
                    </span>
                    <span class="task-state-time">
                      {{file.startTime | timestamp('YYYY-MM-DD')}}
                    </span>
                  </div>
                </template>
                <template v-if="isCompleted(file)">
                  <div class="task-state">
                    <span>
                      {{file.status && task.status[file.status].name}}
                    </span>
                    <span class="task-state-time">
                      {{file.endTime | timestamp('YYYY-MM-DD')}}
                    </span>
                  </div>
                </template>
              </template>
            </div>
            <div class="handle file-info-item">
              <a v-if="file.connectType === 'download'" v-show="isCompleted(file)" @click="showFile(file)">打开</a>
              <a v-if="file.connectType === 'upload'" v-show="isCompleted(file)" @click="copyHref(file)">获取链接</a>
              <a v-show="isCompleted(file) || isError(file)" @click="deleteTask(file)">删除</a>
            </div>
          </div>
        </div>
      </div>
      <table v-if="isEmptyList" class="table empty-list-table">
        <tbody>
          <tr v-for="(value, index) in Array.apply(null, {length: 11})" :key="index" class="empty-list-row">
            <div class="empty-content" v-if="index === 4">
              <p class="has-text-weight-bold" v-show="task.tabKey === 'upload'">没有上传的文件</p>
              <p class="has-text-weight-bold" v-show="task.tabKey === 'download'">没有下载的文件</p>
            </div>
          </tr>
        </tbody>
      </table>
    </div>
    <confirm-modal
      title="是否清空已完成任务？"
      content="该操作无法恢复。"
      :show="showClearCompletedModal"
      @confirm="clearCompleted"
      @close="toggleShowClearCompletedModal"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import ProgressBar from '@/components/ProgressBar'
import ConfirmModal from '@/components/ConfirmModal'
import Icon from '@/components/Icon'
import { timestamp, percent, digiUnit, getFileIconClass } from '@/api/tool'
import { groupBy } from 'ramda'
import { showItemInFolder, openItem, writeText } from '@/api/electron.js'
import Message from '@/api/message'

export default {
  name: 'Task',
  data() {
    return {
      showClearCompletedModal: false,
    }
  },
  components: {
    ConfirmModal,
    ProgressBar,
    Icon,
  },
  computed: {
    isEmptyList() {
      return !this.currentList.length
    },
    currentList() {
      return this.taskData[this.task.tabKey] || []
    },
    taskData() {
      return groupBy(file => {
        return (file.connectType === 'upload' && 'upload') || (file.connectType === 'download' && 'download') || 'error'
      }, this.task.list)
    },
    ...mapState(['task']),
    ...mapGetters(['baseHref']),
  },
  methods: {
    toggleShowClearCompletedModal(value) {
      this.showClearCompletedModal = value !== undefined ? value : !this.showClearCompletedModal
    },
    clearCompleted() {
      this.toggleShowClearCompletedModal(false)
      this.$store.dispatch('CLEAR_COMPLEATE_JOB', { type: this.task.tabKey })
    },
    openFile(file) {
      if (this.isCompleted(file)) {
        const result = openItem(file.localPath)
        if (!result) {
          Message.error('文件不存在')
        }
      }
    },
    switchTab(tabKey) {
      this.$store.commit('SELECT_TAB_KEY', { tabKey })
    },
    getProgress(file) {
      return file.total === 0 ? 1 : parseFloat((file.transferred / file.total).toFixed(2), 10)
    },
    isCompleted(file) {
      return file.status === this.task.status.completed.value
    },
    isError(file) {
      return file.status === this.task.status.error.value
    },
    isUploading(file) {
      return file.connectType === 'upload' && !this.isCompleted(file)
    },
    isDownloading(file) {
      return file.connectType === 'download' && !this.isCompleted(file)
    },
    cancelTask(file) {
      if (this.isCompleted(file)) {
        this.$store.dispatch('CLEAR_COMPLEATE_JOB', { id: file.id })
      }
    },
    deleteTask(file) {
      if (this.isCompleted(file) || this.isError(file)) {
        this.$store.dispatch('CLEAR_COMPLEATE_JOB', { id: file.id })
      }
    },
    showFile(file) {
      if (file.connectType === 'download') {
        const result = showItemInFolder(file.localPath)
        if (!result) {
          Message.error('文件不存在')
        }
      }
    },
    // 获取链接
    copyHref(file) {
      console.log(file)
      if (!this.baseHref) {
        Message.warning('请先设置加速域名，再进行获取链接操作')
        this.$store.commit('OPEN_DOMAIN_SETTING_MODAL')
        return ''
      } else {
        const pathname = new URL(file.url).pathname
        const urlObj = new URL(pathname, this.baseHref)
        let url = urlObj.href
        writeText(url)
        if (url && url.length > 103 && url.substring) {
          url = url.substring(0, 100) + '……'
        }
        Message.success(`${url} 已复制！`)
      }
    },
    getFileIconClass: getFileIconClass,
  },
  filters: {
    percent,
    digiUnit,
    timestamp,
  },
}
</script>
