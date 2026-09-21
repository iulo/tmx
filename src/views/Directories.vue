<script setup lang="ts">
import {useAppStore} from '../store'
import {ElMessage, ElMessageBox} from 'element-plus'
import {open} from '@tauri-apps/plugin-dialog'
const store = useAppStore()
async function addDirectory() { const selected = await open({directory: true, multiple: false}); if (typeof selected === 'string' && await store.addDirectory(selected)) ElMessage.success('Directory added') }
async function removeDirectory(path: string) { await ElMessageBox.confirm(`Remove ${path}?`, 'Confirm', {type: 'warning'}); await store.removeDirectory(path); ElMessage.success('Directory removed') }
</script>
<template><section class="page"><div class="heading"><div><h1>Directories</h1><p>Directories watched by tmx.</p></div><el-button type="primary" @click="addDirectory">Add directory</el-button></div><el-card><el-table :data="store.directories" stripe><el-table-column prop="path" label="Path" min-width="420"/><el-table-column label="Rules" width="180"><template #default="{row}"><el-tag>{{ row.rules.length }} rules</el-tag></template></el-table-column><el-table-column label="Actions" width="120"><template #default="{row}"><el-button link type="danger" @click="removeDirectory(row.path)">Remove</el-button></template></el-table-column></el-table><el-empty v-if="!store.directories.length" description="No directories configured"/></el-card></section></template>
<style scoped>.page{max-width:960px;margin:auto}.heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:26px}.heading h1{margin:0;font-size:27px}.heading p{color:#8a9ab1}</style>
