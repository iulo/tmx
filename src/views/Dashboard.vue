<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {invoke} from '@tauri-apps/api/core'
import {DocumentAdd, DocumentRemove} from '@element-plus/icons-vue'
const metrics = ref<Record<string, any> | null>(null)
const cards = [['files-excluded','Files excluded',DocumentAdd], ['files-included','Files included',DocumentRemove]] as const
onMounted(async () => { metrics.value = await invoke('metrics') })
</script>
<template><section class="page"><div class="page-heading"><div><h1>Looks good</h1><p>tmx is running quietly in the background.</p></div><el-tag type="success" effect="light"><span class="dot" /> Protected</el-tag></div><div class="metric-grid"><el-card v-for="([key,label,icon]) in cards" :key="key" shadow="hover" class="metric"><div class="metric-icon"><el-icon><component :is="icon" /></el-icon></div><div><div class="metric-value">{{ metrics?.[key] ?? '—' }}</div><div class="metric-label">{{ label }}</div></div></el-card></div><el-card class="activity" header="Latest activity"><p v-if="metrics?.['last-excluded']">{{ metrics['last-excluded'] }}</p><el-empty v-else description="No files excluded yet" :image-size="80" /></el-card></section></template>
<style scoped>.page{max-width:960px;margin:auto}.page-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}.page-heading h1{margin:0;font-size:27px}.page-heading p{margin:7px 0 0;color:#8a9ab1}.dot{display:inline-block;width:7px;height:7px;margin-right:5px;border-radius:50%;background:#67c23a}.metric-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.metric{display:flex;align-items:center;gap:16px}.metric-icon{width:48px;height:48px;display:grid;place-items:center;border-radius:14px;color:#409eff;background:#ecf5ff;font-size:23px}.metric-value{font-size:28px;font-weight:650}.metric-label{margin-top:3px;color:#8a9ab1;font-size:13px}.activity{margin-top:18px}.activity p{color:#66788f;word-break:break-all}@media(max-width:700px){.tmx-sidebar{width:190px}.tmx-content{padding:25px 20px}.metric-grid{grid-template-columns:1fr}}
</style>
