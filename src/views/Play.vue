<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { works } from '../data/works.js'

const route = useRoute()

// 默认进入页面时选中真实可玩的 rabbit
const activeId = ref('rabbit')
const active = computed(() => works.find((w) => w.id === activeId.value) || works[0])

// 从 URL 读 ?game= 自动选中（比如从作品页点过来）
function syncFromQuery() {
  const idx = Number(route.query.game)
  if (Number.isInteger(idx) && idx >= 0 && idx < works.length) {
    const target = works[idx]
    if (target) {
      activeId.value = target.id
      iframeMounted.value = false
      iframeKey.value++
    }
  }
}
onMounted(syncFromQuery)
watch(() => route.query.game, syncFromQuery)

// iframe 懒加载：只有点击"立即试玩"才挂载
const iframeMounted = ref(false)
const iframeKey = ref(0) // 切换 game 或重新加载时递增

function loadIframe() {
  iframeMounted.value = true
  iframeKey.value++
}

function reloadIframe() {
  iframeKey.value++
}

// 切换到其他 game
function selectGame(game) {
  activeId.value = game.id
  // 切到设计稿游戏时不要显示旧 iframe
  iframeMounted.value = false
  iframeKey.value++
}

// 切换 game 时把页面滚回顶部（用户可能在底部列表点击）
watch(activeId, () => {
  nextTick(() => {
    const stage = document.querySelector('.play-stage')
    if (stage) stage.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
})

const games = computed(() => works)
const playableGames = computed(() => works.filter((g) => g.hasPlayable))
</script>

<template>
  <main class="page play-page">
    <!-- Hero -->
    <section class="play-hero shell">
      <p class="eyebrow"><span class="dot" aria-hidden="true"></span> PLAY / TRY NOW</p>
      <h1>亲自动手，<em>体验一下</em>。</h1>
      <p class="play-hero-intro">
        下面是我用 Cocos Creator 真实打包的试玩广告，9:16 真实尺寸，可直接玩。
        加载需要几秒，耐心等一下。
      </p>
    </section>

    <!-- Stage: 9:16 iframe + 描述 -->
    <section class="play-stage shell">
      <div class="play-frame" :style="{ '--primary': active.colors[0], '--secondary': active.colors[1] }">
        <div class="phone-frame">
          <div class="phone-notch" aria-hidden="true"></div>
          <div class="phone-screen">
            <!-- 未挂载时显示封面 + 开始按钮 -->
            <div v-if="!iframeMounted || !active.playableSrc" class="play-cover">
              <img :src="active.cover" :alt="`${active.subtitle}游戏封面`" />
              <div class="play-cover-overlay">
                <button
                  v-if="active.playableSrc"
                  type="button"
                  class="play-start"
                  @click="loadIframe"
                >
                  <span class="play-icon" aria-hidden="true">▶</span>
                  <span>立即试玩</span>
                </button>
                <span v-else class="play-soon">设计稿 · 暂未打包</span>
              </div>
              <span class="play-cover-tag">9:16 · {{ active.dimension }}</span>
            </div>
            <!-- 挂载后用 iframe 嵌入 -->
            <iframe
              v-else
              :key="iframeKey"
              :src="active.playableSrc"
              class="play-iframe"
              frameborder="0"
              allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
              allowfullscreen
              scrolling="no"
              :title="`${active.title} 试玩广告`"
            ></iframe>
          </div>
          <div class="phone-home" aria-hidden="true"></div>
        </div>
        <div class="play-frame-actions">
          <button
            v-if="iframeMounted && active.playableSrc"
            type="button"
            class="play-reload"
            @click="reloadIframe"
          >↻ 重新加载</button>
          <span class="play-frame-tip">
            {{ active.hasPlayable ? '已挂载 · 鼠标点击屏幕跳跃' : '点击其他游戏即可切换' }}
          </span>
        </div>
      </div>

      <aside class="play-info">
        <p class="eyebrow">
          <span class="dot" aria-hidden="true"></span>
          {{ active.type }} · {{ active.label }}
        </p>
        <h2>{{ active.title }}</h2>
        <p class="play-subtitle">{{ active.subtitle }}</p>
        <p class="play-desc">{{ active.longDescription || active.description }}</p>

        <div class="play-spec">
          <div><span>引擎</span><b>{{ active.engine }}</b></div>
          <div><span>形态</span><b>{{ active.dimension }} 游戏</b></div>
          <div><span>平台</span><b>{{ active.platform }}</b></div>
        </div>

        <div class="play-tags">
          <span v-for="tag in active.tags" :key="tag">{{ tag }}</span>
        </div>

        <div class="play-control-tips">
          <h4>怎么玩</h4>
          <ul>
            <li>📱 移动端：<b>点击屏幕</b> = 跳跃</li>
            <li>💻 桌面端：<b>点击</b> = 跳跃 · <b>长按</b> = 二段跳</li>
            <li>🥕 吃到最多萝卜 = 最佳成绩</li>
          </ul>
        </div>
      </aside>
    </section>

    <!-- 更多试玩（像 4399） -->
    <section class="more-games shell">
      <header class="more-games-head">
        <div>
          <p class="eyebrow"><span class="dot" aria-hidden="true"></span> MORE PLAYABLES</p>
          <h2>其他试玩</h2>
          <p class="section-note">
            点击切换当前试玩。<b>{{ playableGames.length }}</b> 个可玩 · <b>{{ games.length - playableGames.length }}</b> 个正在设计。
          </p>
        </div>
        <router-link to="/tools" class="more-games-link">
          查看我的工具
          <span aria-hidden="true">→</span>
        </router-link>
      </header>

      <div class="more-games-grid">
        <button
          v-for="game in games"
          :key="game.id"
          type="button"
          class="more-game-card"
          :class="{ active: game.id === activeId }"
          :style="{ '--primary': game.colors[0], '--secondary': game.colors[1] }"
          @click="selectGame(game)"
        >
          <div class="more-game-art">
            <img :src="game.cover" :alt="`${game.subtitle}游戏封面`" />
            <span v-if="game.hasPlayable" class="more-game-badge playable">PLAYABLE</span>
            <span v-else class="more-game-badge soon">设计中</span>
            <span v-if="game.id === activeId" class="more-game-now">正在玩</span>
          </div>
          <div class="more-game-info">
            <h3>{{ game.title }}</h3>
            <p>{{ game.subtitle }}</p>
            <span class="more-game-meta">{{ game.type }} · {{ game.dimension }} 游戏</span>
          </div>
        </button>
      </div>
    </section>
  </main>
</template>
