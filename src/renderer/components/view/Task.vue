<template>
  <div class="task-container">
    <div class="tabs">
      <ul>
        <li :class="{
          'is-active': tabKey === key,
        }" v-for="(value, key) in task.taskType" :key="key" @click="selectTabs(key)"><a>{{value}}</a></li>
      </ul>
    </div>
    <div class="list">
        <div class="files-list">
          <div class="files-list-column">
            <div class="column-file-name table-column"></div>
            <div class="table-column"></div>
            <div class="table-column"></div>
            <div class="table-column"></div>
            <div class="table-column"></div>
            <div class="table-column"></div>
          </div>
          <div class="files-list-header">
            <div class="file-info-item column-file-name">名称</div>
            <div class="file-info-item">大小</div>
            <div class="file-info-item">状态</div>
            <div class="file-info-item">上传日期</div>
            <div class="file-info-item">操作</div>
          </div>
          <div class="files-list-body">
            <div class="files-list-item" v-for="file in task.taskList" :key="file.id">
              <div class="name file-info-item">{{file.filename}}</div>
              <div class="file-info-item"></div>
              <div class="file-info-item"></div>
              <div class="file-info-item"></div>
            </div>
            <!-- <div class="card-block" v-for="data in taskList" :key="data.id">
              <div class="card-block-title">
                {{data.filename}}
                <br>
                <p style="color:#a5a5a5;">
                  {{data.done | digiUnit}}/{{data.size | digiUnit}}&nbsp;&nbsp;{{data.status | uploadStatus}}
                </p>
              </div>
              <div class="card-block-icon" v-show="data.status === '0' || data.status === '1'">
                <progress-bar :progress='data.percentage' class="progress-bar"></progress-bar>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, dispatch, commit } from 'vuex'

export default {
  name: 'Task',
  data() {
    return {
      selectTabKey: '',
    }
  },
  computed: {
    tabKey() {
      return this.selectTabKey || (this.task.taskType && Object.keys(this.task.taskType)[0])
    },
    ...mapState(['task']),
  },
  methods: {
    selectTabs(key) {
      this.selectTabKey = key
    },
  },
}
</script>
