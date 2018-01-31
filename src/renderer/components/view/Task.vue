<template>
  <div class="task-container">
    <div class="tabs">
      <ul>
        <li :class="{
          'is-active': task.tabKey === key,
        }" v-for="(value, key) in task.taskType" :key="key" @click="switchTab(key)"><a>{{value}}</a></li>
      </ul>
      <div class="handle">
        <a @click="toggleShowClearCompletedModal(true)">清除所有记录</a>
      </div>
    </div>
    <div class="list">
      <div class="files-list">
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
            v-for="file in task.list"
            :key="file.id"
            v-if="filterList(file)"
          >
            <div class="name file-info-item">
              <i class="res-icon" :class="getFileIconClass(file.filename)"></i>{{file.filename}}
            </div>
            <div class="size file-info-item">{{file.transferred | digiUnit}} / {{file.total | digiUnit}}</div>
            <div class="status file-info-item">{{file.status && task.status[file.status].name}}</div>
            <div class="handle file-info-item"></div>
          </div>
        </div>
      </div>
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
import { mapState } from 'vuex'
import { digiUnit, getFileIconClass } from '@/api/tool'
import ConfirmModal from '@/components/UIComponents/ConfirmModal'

export default {
  name: 'Task',
  data() {
    return {
      showClearCompletedModal: false,
    }
  },
  components: {
    ConfirmModal,
  },
  computed: {
    ...mapState(['task']),
  },
  methods: {
    toggleShowClearCompletedModal(value) {
      this.showClearCompletedModal = value !== undefined ? value : !this.showClearCompletedModal
    },
    clearCompleted() {
      this.toggleShowClearCompletedModal(false)
      console.log('daslkdalsjdklajdkasjkdljas')
    },
    switchTab(tabKey) {
      this.$store.commit('SELECT_TAB_KEY', { tabKey })
    },
    filterList(file) {
      const isCompleted = file.status === this.task.status.completed.value
      if (this.task.tabKey === 'completed') {
        return isCompleted
      }
      if (this.task.tabKey === 'uploading' && !isCompleted) {
        return file.connectType === 'upload'
      }
      if (this.task.tabKey === 'downloading' && !isCompleted) {
        return file.connectType === 'download'
      }
    },
    getFileIconClass: getFileIconClass,
  },
  filters: {
    digiUnit,
  },
}
</script>
