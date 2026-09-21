<script setup lang="ts">
import {useRoute} from 'vue-router'
import {DataAnalysis, Setting, Tickets, FolderOpened, VideoPlay, Expand, Fold, InfoFilled} from '@element-plus/icons-vue'
import {useI18n} from 'vue-i18n'
import {ref} from 'vue'
const route = useRoute()
const {t} = useI18n()
const compactSidebar = ref(false)
const links = [
  ['/main/stats', 'statistics', DataAnalysis], ['/main/general', 'general', Setting], ['/main/rules', 'rules', Tickets],
  ['/main/directories', 'directories', FolderOpened], ['/main/scan', 'scan', VideoPlay], ['/main/about', 'about', InfoFilled],
]
</script>
<template>
  <div class="tmx-shell">
    <aside class="tmx-sidebar" :class="{compact: compactSidebar}" :style="{width: compactSidebar ? '72px' : '210px'}">
      <div class="tmx-brand"><div class="tmx-logo">T</div><div v-if="!compactSidebar" class="brand-copy"><div class="brand-title"><strong>tmx</strong><el-button class="sidebar-toggle" text circle :icon="Fold" @click="compactSidebar = true" /></div><small>Time Machine Exclude</small></div><el-button v-else class="sidebar-toggle compact-toggle" text circle :icon="Expand" @click="compactSidebar = false" /></div>
      <el-menu :default-active="route.path" router class="tmx-menu">
        <el-menu-item v-for="([href, label, icon]) in links" :key="href" :index="href"><el-icon><component :is="icon" /></el-icon><span v-if="!compactSidebar">{{ t(label) }}</span></el-menu-item>
      </el-menu>
      <div class="tmx-sidebar-footer"><span class="slogan">Control what Time Machine backs up<br /></span><span>v0.3.0</span></div>
    </aside>
    <main class="tmx-content"><RouterView /></main>
  </div>
</template>

<style scoped>
.tmx-shell { display:flex; height:100vh; color:var(--el-text-color-primary); background:linear-gradient(135deg,#f7faff 0%,#eef4ff 100%); border-top:1px solid var(--el-border-color); }
.tmx-sidebar { position:relative; flex:0 0 auto; display:flex; flex-direction:column; padding:12px 14px; background:rgba(255,255,255,.8); border-right:1px solid var(--el-border-color); }
.tmx-brand { position:relative; display:flex; align-items:center; gap:11px; height:72px; box-sizing:border-box; padding:0 12px; user-select:none; }.brand-copy{min-width:0}.brand-title{display:flex;align-items:center;gap:8px}.tmx-brand strong{font-size:21px;letter-spacing:.02em}.tmx-brand small{display:block;color:#8a9ab1;font-size:10px;line-height:1.25;margin-top:2px;white-space:nowrap}.tmx-logo{width:35px;height:35px;flex:0 0 35px;border-radius:11px;display:grid;place-items:center;color:#fff;font-size:20px;font-weight:700;background:linear-gradient(135deg,#409eff,#7b61ff);box-shadow:0 6px 14px #409eff44}.tmx-menu{border:0;background:transparent}.tmx-sidebar-footer{margin-top:auto;padding:14px;color:#9aaac0;font-size:11px;line-height:1.7}.tmx-sidebar-footer span{color:#b8c4d4}.tmx-content{flex:1;min-width:0;overflow:auto;padding:24px 44px}
.sidebar-toggle{flex:0 0 auto}.compact-toggle{position:absolute;right:50%;top:-8px;transform:translateX(50%)}.tmx-sidebar.compact{padding-left:8px;padding-right:8px}.tmx-sidebar.compact .tmx-brand{justify-content:center;padding-left:0;padding-right:0}.tmx-sidebar.compact .tmx-menu :deep(.el-menu-item){justify-content:center;padding-left:0!important;padding-right:0!important}.tmx-sidebar.compact .tmx-menu :deep(.el-icon){margin-right:0}.tmx-sidebar.compact .slogan{display:none}.tmx-sidebar.compact .tmx-sidebar-footer{padding-left:0;padding-right:0;text-align:center}
.tmx-sidebar.compact{padding-left:8px;padding-right:8px}.tmx-sidebar.compact .tmx-brand{justify-content:center;padding-left:0;padding-right:0}.tmx-sidebar.compact .tmx-menu :deep(.el-menu-item){justify-content:center;padding-left:0!important;padding-right:0!important}.tmx-sidebar.compact .tmx-menu :deep(.el-icon){margin-right:0}
</style>
