import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Play from '../views/Play.vue'
import Tools from '../views/Tools.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/tools', name: 'tools', component: Tools },
  { path: '/works', redirect: '/tools' },
  { path: '/play', name: 'play', component: Play },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
