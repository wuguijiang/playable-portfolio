<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import shiLogo from './assets/shi-logo.png'

const route = useRoute()
const navItems = [
  { label: '首页', anchor: 'top', page: 'home' },
  { label: '技术栈', anchor: 'skills', page: 'home' },
  { label: '工具', anchor: null, page: 'tools' },
  { label: '试玩', anchor: null, page: 'play' },
  { label: '联系', anchor: 'contact', page: 'home' },
]

function navHref(item) {
  if (item.page === 'tools') return '/tools'
  if (item.page === 'play') return '/play'
  if (route.name === 'tools' || route.name === 'play') return `/#${item.anchor}`
  return `#${item.anchor}`
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-inner shell">
      <router-link to="/" class="brand" aria-label="返回首页">
        <span class="brand-mark" aria-hidden="true">
          <img :src="shiLogo" alt="" />
        </span>
        <span class="brand-name">
          <strong>梨花詩</strong>
          <small>LIHUA SHI · COCOS PLAYABLE</small>
        </span>
      </router-link>

      <nav aria-label="主要导航">
        <router-link
          v-for="item in navItems"
          :key="item.label"
          :to="navHref(item)"
          :class="{ active: item.page && item.page === route.name }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <a class="contact-link" href="mailto:2926044894@qq.com">求职中 · 可联系 ↗</a>
    </div>
  </header>

  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <footer class="footer shell">
    <span>© 2026 梨花詩 · LIHUA SHI · COCOS 2027</span>
    <span>Built with Vue + Vite + Vue Router · Designed in white</span>
  </footer>
</template>
