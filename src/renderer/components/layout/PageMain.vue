<template>
  <div class="page-main">
    <!-- <main-menu></main-menu> -->
    <main-view></main-view>
    <create-folder></create-folder>
    <!-- 改变key，可以触发 created 生命周期  -->
    <rename-file :key="modal.renameFile.oldPath"></rename-file>
    <file-progress></file-progress>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import MainView from '@/components/view/MainView'
  import MainMenu from '@/components/view/MainMenu'
  import CreateFolder from '@/components/modal/CreateFolder'
  import RenameFile from '@/components/modal/RenameFile'
  import FileProgress from '@/components/modal/FileProgress'

  export default {
    name: 'PageMain',
    components: {
      MainView,
      MainMenu,
      CreateFolder,
      RenameFile,
      FileProgress,
    },
    computed: {
      ...mapState(['modal']),
    },
  }
</script>