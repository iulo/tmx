<script setup lang="ts">
import {useAppStore} from '../store'
import {getStore, setStore} from '../commands'
import {i18n} from '../vue-i18n'
import {ref, onMounted} from 'vue'

const store = useAppStore()
const language = ref('auto')

onMounted(async () => { language.value = await getStore('language') ?? 'auto' })

async function changeLanguage(value: string) {
  await setStore('language', value)
  i18n.global.locale.value = value === 'auto'
    ? (navigator.language.toLowerCase().startsWith('zh') ? 'zh-Hans' : 'en')
    : value as 'en' | 'zh-Hans'
}
</script>

<template><section class="page"><div class="page-heading"><div><h1>{{ $t('general') }}</h1><p>{{ $t('timemachine_exclude_is_running') }}</p></div></div><el-card class="settings-card"><el-form label-position="top"><el-form-item :label="$t('language')"><el-select v-model="language" @change="changeLanguage"><el-option value="auto" :label="$t('lang_auto')"/><el-option value="en" label="English"/><el-option value="zh-Hans" label="简体中文"/></el-select></el-form-item><el-form-item label="Start at login"><el-switch v-model="store.autoStart" active-text="Launch tmx when you sign in" @change="store.setAutoStart" /></el-form-item><el-form-item label="Backup behavior"><el-switch v-if="store.config" v-model="store.config['no-include']" active-text="Do not include matching files" @change="store.save" /></el-form-item><el-form-item label="Dump support"><el-switch v-if="store.config" v-model="store.config['support-dump']" active-text="Enable NODUMP support" @change="store.save" /></el-form-item></el-form></el-card></section></template>
<style scoped>.page{max-width:960px;margin:auto}.page-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:26px}.page-heading h1{margin:0;font-size:27px}.page-heading p,.muted{color:#8a9ab1}.settings-card{max-width:720px}</style>
