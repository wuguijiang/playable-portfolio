<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import shiLogo from './assets/shi-logo.png'

const route = useRoute()
const menuOpen = ref(false)
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

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

// 路由切换时自动收起抽屉
watch(() => route.fullPath, closeMenu)
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

      <div class="topbar-right">
        <a class="contact-link" href="mailto:2926044894@qq.com">求职中 · 可联系 ↗</a>
        <button
          class="nav-toggle"
          :class="{ open: menuOpen }"
          type="button"
          :aria-expanded="menuOpen"
          aria-label="打开菜单"
          @click="toggleMenu"
        >
          <span></span>
        </button>
      </div>
    </div>
  </header>

  <!-- 移动端抽屉导航 -->
  <transition name="mobile-nav">
    <div v-if="menuOpen" class="mobile-nav-backdrop" @click.self="closeMenu">
      <nav class="mobile-nav" aria-label="移动端导航">
        <div class="mobile-nav-head">
          <b>梨花詩</b>
          <button class="mobile-nav-close" type="button" aria-label="关闭菜单" @click="closeMenu">×</button>
        </div>
        <router-link
          v-for="item in navItems"
          :key="item.label"
          :to="navHref(item)"
          :class="{ active: item.page && item.page === route.name }"
          @click="closeMenu"
        >
          {{ item.label }}
          <span class="arrow">→</span>
        </router-link>
        <div class="mobile-nav-contact">
          <a href="mailto:2926044894@qq.com">求职中 · 可联系 ↗</a>
        </div>
      </nav>
    </div>
  </transition>

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
