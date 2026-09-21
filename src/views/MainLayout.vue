<script setup lang="ts">
import {useRoute} from 'vue-router'
import {DataAnalysis, Setting, Tickets, FolderOpened, VideoPlay} from '@element-plus/icons-vue'
import {getCurrentWindow} from '@tauri-apps/api/window'
import {useI18n} from 'vue-i18n'
const route = useRoute()
const {t} = useI18n()
const dragWindow = async (event: MouseEvent) => {
  if (event.button === 0) await getCurrentWindow().startDragging()
}
const links = [
  ['/main/stats', 'statistics', DataAnalysis], ['/main/general', 'general', Setting], ['/main/rules', 'rules', Tickets],
  ['/main/directories', 'directories', FolderOpened], ['/main/scan', 'scan', VideoPlay],
]
</script>
<template>
  <div class="tmx-shell">
    <div class="tmx-drag-strip" @mousedown="dragWindow" />
    <aside class="tmx-sidebar">
      <div class="tmx-brand" @mousedown="dragWindow"><div class="tmx-logo">T</div><div><strong>tmx</strong><small>Time Machine Exclude</small></div></div>
      <el-menu :default-active="route.path" router class="tmx-menu">
        <el-menu-item v-for="([href, label, icon]) in links" :key="href" :index="href"><el-icon><component :is="icon" /></el-icon><span>{{ t(label) }}</span></el-menu-item>
      </el-menu>
      <div class="tmx-sidebar-footer"><RouterLink to="/about" class="about-link">About tmx</RouterLink><br />Protect your backups<br /><span>v0.3.0</span></div>
    </aside>
    <main class="tmx-content"><RouterView /></main>
  </div>
</template>

<style scoped>
.tmx-shell { display:flex; height:100vh; color:var(--el-text-color-primary); background:linear-gradient(135deg,#f7faff 0%,#eef4ff 100%); }.tmx-drag-strip{position:fixed;z-index:10;top:0;left:0;right:0;height:48px;cursor:grab}.tmx-drag-strip:active{cursor:grabbing}
.tmx-sidebar { width:238px; display:flex; flex-direction:column; padding:78px 14px 24px; background:rgba(255,255,255,.8); border-right:1px solid rgba(64,118,190,.12); }
.tmx-brand { display:flex; align-items:center; gap:11px; padding:0 12px 28px; cursor:grab; user-select:none; }.tmx-brand:active{cursor:grabbing}.tmx-brand strong{font-size:21px;letter-spacing:.02em}.tmx-brand small{display:block;color:#8a9ab1;font-size:11px;margin-top:2px}.tmx-logo{width:35px;height:35px;border-radius:11px;display:grid;place-items:center;color:#fff;font-size:20px;font-weight:700;background:linear-gradient(135deg,#409eff,#7b61ff);box-shadow:0 6px 14px #409eff44}.tmx-menu{border:0;background:transparent}.tmx-sidebar-footer{margin-top:auto;padding:14px;color:#9aaac0;font-size:11px;line-height:1.7}.tmx-sidebar-footer span{color:#b8c4d4}.tmx-content{flex:1;min-width:0;overflow:auto;padding:78px 44px 34px}
</style>
