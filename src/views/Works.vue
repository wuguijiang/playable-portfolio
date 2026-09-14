<script setup>
import { computed, ref } from 'vue'
import { works, workTypes } from '../data/works.js'

const activeFilter = ref('全部')

const filteredWorks = computed(() => (
  activeFilter.value === '全部'
    ? works
    : works.filter((game) => game.type === activeFilter.value)
))
const typeCount = computed(() => new Set(works.map((game) => game.type)).size)

// 每张卡片点进去都进试玩中心 /play
// 有 playableSrc 的会真挂 iframe，没有的会在 Play 页显示"设计稿 · 暂未打包"
// 注意：Play 页是按 works 里的全局下标取游戏的，所以这里必须传全局下标，
// 不能用筛选后列表的 idx，否则切了类型会跳到别的游戏。
function playHref(game) {
  const idx = works.findIndex((item) => item.id === game.id)
  return `/play?game=${idx >= 0 ? idx : 0}`
}
</script>

<template>
  <main class="page works-page">
    <!-- Page Hero -->
    <section class="works-hero shell">
      <p class="eyebrow">
        <span class="dot" aria-hidden="true"></span>
        WORKS / {{ works.length }} COCOS PLAYABLES
      </p>
      <h1 class="works-title">
        <span>每一款</span>
        <em>都想上手</em>
        <span>玩玩。</span>
      </h1>
      <p class="works-intro">
        这里收录我用 Cocos Creator 做的 {{ works.length }} 款试玩广告，按类型分了合成 / 解压 / 消除 / 闯关 / 经营。
        点击任意一张可以查看 1:1 封面 + 详细说明。
      </p>

      <div class="works-stats">
        <div><b>{{ works.length }}</b><span>个作品</span></div>
        <div><b>2D · 3D</b><span>形态</span></div>
        <div><b>{{ typeCount }}</b><span>类型覆盖</span></div>
        <div><b>TS</b><span>开发语言</span></div>
      </div>
    </section>

    <!-- Filters -->
    <section class="works-filters shell">
      <div class="filters" role="tablist" aria-label="作品类型筛选">
        <button
          v-for="t in workTypes"
          :key="t"
          type="button"
          :class="{ active: activeFilter === t }"
          @click="activeFilter = t"
        >
          {{ t }}
        </button>
      </div>
      <span class="filter-count">共 {{ filteredWorks.length }} 个</span>
    </section>

    <!-- Works grid -->
    <section class="works-grid shell">
      <router-link
        v-for="game in filteredWorks"
        :key="game.id"
        :to="playHref(game)"
        class="work-card"
        :style="{ '--primary': game.colors[0], '--secondary': game.colors[1] }"
      >
        <div class="work-art">
          <img :src="game.cover" :alt="`${game.subtitle}游戏封面`" />
          <span class="work-id">{{ String(works.findIndex((item) => item.id === game.id) + 1).padStart(2, '0') }}</span>
          <span class="work-tag">COCOS · {{ game.dimension }}</span>
          <span class="work-type" :style="{ background: game.colors[0] }">{{ game.type }}</span>
          <span v-if="game.hasPlayable" class="work-badge">PLAYABLE</span>
        </div>
        <div class="work-info">
          <p class="work-meta">
            <span>{{ game.type }} · {{ game.label }}</span>
            <span>{{ game.platform }}</span>
          </p>
          <h2 class="work-title">{{ game.title }}</h2>
          <p class="work-subtitle">{{ game.subtitle }}</p>
          <p class="work-desc">{{ game.description }}</p>
          <div class="work-spec">
            <div><span>引擎</span><b>{{ game.engine }}</b></div>
            <div><span>形态</span><b>{{ game.dimension }} 游戏</b></div>
            <div><span>平台</span><b>{{ game.platform }}</b></div>
          </div>
          <div class="work-tags">
            <span v-for="tag in game.tags" :key="tag">{{ tag }}</span>
          </div>
          <span class="work-go">{{ game.hasPlayable ? '立即试玩' : '查看详情' }} →</span>
        </div>
      </router-link>
    </section>

    <!-- CTA -->
    <section class="works-cta shell">
      <div class="works-cta-card has-drift-bg">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> WANT MORE</p>
        <h3>想看更多在做的 Demo，或者一起做下一款？</h3>
        <div class="works-cta-actions">
          <router-link to="/" class="btn btn-ghost">回到首页 ←</router-link>
          <a class="btn btn-primary" href="mailto:2926044894@qq.com">发邮件聊聊 ↗</a>
        </div>
      </div>
    </section>
  </main>
</template>
