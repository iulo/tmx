<script setup lang="ts">import {cargoLicenses,npmLicenses} from '../licenses';const licenses=[...cargoLicenses,...npmLicenses]</script>
<template><section class="page"><h1>Licenses</h1><el-table :data="licenses" stripe><el-table-column prop="name" label="Package"/><el-table-column prop="version" label="Version" width="120"/><el-table-column prop="license" label="License"/></el-table></section></template>
<style scoped>.page{max-width:900px;margin:40px auto}.page h1{font-size:28px;margin-bottom:24px}</style>
