<template>
  <div class="page-main">
    <main-view></main-view>
    <create-folder></create-folder>
    <rename-file :key="modal.renameFile.oldPath"></rename-file>
    <file-progress></file-progress>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import MainView from '@/components/view/MainView'
  import CreateFolder from '@/components/modal/CreateFolder'
  import RenameFile from '@/components/modal/RenameFile'
  import FileProgress from '@/components/modal/FileProgress'

  export default {
    name: 'PageMain',
    components: {
      MainView,
      CreateFolder,
      RenameFile,
      FileProgress,
    },
    computed: {
      ...mapState(['modal']),
    },
  }
</script>