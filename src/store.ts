import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {PreConfig} from './bindings/PreConfig'
import type {ScanStatus} from './bindings/ScanStatus'
import {applyActionBatch, getAutoStart, getConfig, scanStatus, setConfig, startFullScan, stopFullScan, enableAutoStart, disableAutoStart} from './commands'
import type {ExclusionActionBatch} from './bindings/ExclusionActionBatch'
import {listen} from '@tauri-apps/api/event'

export const useAppStore = defineStore('app', () => {
  const config = ref<PreConfig | null>(null)
  const status = ref<ScanStatus>({step: 'idle'})
  const loading = ref(false)
  const result = ref<ExclusionActionBatch>({add: [], remove: []})
  const autoStart = ref(false)
  let unlisten: (() => void) | undefined
  const rules = computed(() => config.value?.rules ?? {})
  const directories = computed(() => config.value?.directories ?? [])
  async function load() { config.value = await getConfig(); autoStart.value = await getAutoStart(); unlisten = await listen<ScanStatus>('scan_status_changed', event => { status.value = event.payload; loading.value = event.payload.step === 'scanning'; if (event.payload.step === 'result') result.value = event.payload.content }) }
  async function save() { if (config.value) await setConfig(config.value) }
  async function addRule(name: string) { if (!config.value || !name.trim() || config.value.rules[name]) return false; config.value.rules[name] = {excludes: [], 'if-exists': []}; await save(); return true }
  async function addDirectory(path: string) { if (!config.value || !path || config.value.directories.some(d => d.path === path)) return false; config.value.directories.push({path, rules: []}); await save(); return true }
  async function removeDirectory(path: string) { if (!config.value) return; config.value.directories = config.value.directories.filter(d => d.path !== path); await save() }
  async function scan() { loading.value = true; await startFullScan(); status.value = await scanStatus() }
  async function stop() { await stopFullScan(); status.value = await scanStatus() }
  async function applyResult(batch: ExclusionActionBatch) { await applyActionBatch(batch); result.value = {add: [], remove: []} }
  async function setAutoStart(value: boolean) { autoStart.value = value; value ? await enableAutoStart() : await disableAutoStart() }
  return {config, status, loading, result, autoStart, rules, directories, load, save, addRule, addDirectory, removeDirectory, applyResult, setAutoStart, scan, stop}
})
