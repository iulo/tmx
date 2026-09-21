<script setup lang="ts">
import {onMounted} from 'vue'
import {useAppStore} from './store'
import {getStore} from './commands'
import {i18n} from './vue-i18n'
const store = useAppStore()
onMounted(async () => { await store.load(); const saved = await getStore('language'); i18n.global.locale.value = saved === 'zh-Hans' ? 'zh-Hans' : saved === 'auto' ? (navigator.language.toLowerCase().startsWith('zh') ? 'zh-Hans' : 'en') : 'en' })
</script>

<template><RouterView /></template>
