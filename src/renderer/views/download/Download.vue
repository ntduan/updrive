<template>
  <div class="task-container">
    <div class="tabs">
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
          <div class="column-file-name file-info-header">名称</div>
          <div class="column-file-size file-info-header">大小</div>
          <div class="column-file-status file-info-header">状态</div>
          <div class="column-file-handle file-info-header">操作</div>
        </div>
        <div class="files-list-body">
          <div
            class="files-list-item"
            v-for="file in downloadList"
            :key="file.id"
          >
            <div class="name file-info-item">
              <i class="res-icon" :class="getFileIconClass(file.filename)"></i>{{file.filename}}
            </div>
            <div class="size file-info-item">
              {{file.transferred | digiUnit}} / {{file.total | digiUnit}}
            </div>
            <div class="status file-info-item">
              <template v-if="isError(file)">
                <p class="has-text-danger">{{file.errorMessage}}</p>
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
              <template v-if="!isEnded(file)">
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
            </div>
            <div class="handle file-info-item">
              <a v-show="isCompleted(file)" @click="showFile(file)">打开</a>
              <a v-show="isEnded(file)" @click="deleteTask(file)">删除</a>
            </div>
          </div>
        </div>
      </div>
      <table v-if="isEmptyList" class="table empty-list-table">
        <tbody>
          <tr v-for="(value, index) in Array.apply(null, {length: 9})" :key="index" class="empty-list-row">
            <div class="empty-content" v-if="index === 3">
              <p class="has-text-weight-bold">没有下载的文件</p>
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
import { showItemInFolder, openItem } from '@/api/electron.js'
import Message from '@/api/message'

export default {
  name: 'Download',
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
      return !this.downloadList.length
    },
    downloadList() {
      return this.task.list.filter(file => file.connectType === 'download')
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
      this.$store.dispatch('DELETE_JOB', { connectType: 'download' })
    },
    getProgress(file) {
      return file.total === 0 ? 1 : parseFloat((file.transferred / file.total).toFixed(2), 10)
    },
    isEnded(file) {
      return this.isCompleted(file) || this.isError(file)
    },
    isCompleted(file) {
      return file.status === this.task.status.completed.value
    },
    isError(file) {
      return file.status === this.task.status.error.value
    },
    deleteTask(file) {
      if (this.isEnded(file)) {
        this.$store.dispatch('DELETE_JOB', { id: file.id })
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
    getFileIconClass: getFileIconClass,
  },
  filters: {
    percent,
    digiUnit,
    timestamp,
  },
}
</script>
