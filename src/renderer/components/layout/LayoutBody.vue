<template>
  <div class="layout-body">
    <list />
    <!-- 改变key，可以触发 created 生命周期  -->
    <rename-file :key="modal.renameFile.oldPath" />
    <file-progress />
    <create-folder />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import List from '@/components/view/List'
import CreateFolder from '@/components/modal/CreateFolder'
import RenameFile from '@/components/modal/RenameFile'
import FileProgress from '@/components/modal/FileProgress'

export default {
  name: 'LayoutBody',
  components: {
    List,
    CreateFolder,
    RenameFile,
    FileProgress,
  },
  computed: {
    ...mapState(['modal']),
  },
}
</script>