import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import {presetWind4} from '@unocss/preset-wind4'
import {presetIcons} from '@unocss/preset-icons'

export default defineConfig({root: 'src', plugins: [vue(), UnoCSS({presets: [presetWind4(), presetIcons()]})], build: {outDir: '../dist', emptyOutDir: true}, clearScreen: false})
