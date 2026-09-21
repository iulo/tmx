import {createRouter, createWebHashHistory} from 'vue-router'
import MainLayout from './views/MainLayout.vue'
import Dashboard from './views/Dashboard.vue'
import Settings from './views/Settings.vue'
import Rules from './views/Rules.vue'
import Directories from './views/Directories.vue'
import About from './views/About.vue'
import Acknowledgements from './views/Acknowledgements.vue'
import License from './views/License.vue'
import Scan from './views/Scan.vue'

export default createRouter({history: createWebHashHistory(), routes: [
  {path: '/', redirect: '/main/stats'},
  {path: '/main', component: MainLayout, children: [
    {path: 'stats', component: Dashboard},
    {path: 'general', component: Settings},
    {path: 'rules', component: Rules},
    {path: 'directories', component: Directories},
    {path: 'scan', component: Scan},
    {path: 'about', component: About},
  ]},
  {path: '/about', component: About},
  {path: '/ack', component: Acknowledgements},
  {path: '/license', component: License},
]})
