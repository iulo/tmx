import {createApp} from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'
import router from './router'
import {i18n} from './vue-i18n'
import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

createApp(App).use(createPinia()).use(router).use(i18n).use(ElementPlus).mount('#root')
