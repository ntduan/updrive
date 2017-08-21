<template>
  <div class="page-main">
    <main-menu></main-menu>
    <main-view></main-view>
    <create-folder></create-folder>
    <rename-file :key="modal.renameFile.oldPath"></rename-file>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  import MainView from '../view/MainView'
  import MainMenu from '../view/MainMenu'
  import CreateFolder from '../modal/CreateFolder'
  import RenameFile from '../modal/RenameFile'

  export default {
    components: {
      MainView,
      MainMenu,
      CreateFolder,
      RenameFile,
    },
    name: 'PageMain',
    computed: {
      ...mapState(['modal']),
    },
  }
</script>