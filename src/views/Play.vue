<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { works } from '../data/works.js'

const route = useRoute()

// 默认进入页面时选中最新接入的真实试玩
const activeId = ref('meow-meow')
const active = computed(() => works.find((w) => w.id === activeId.value) || works[0])
const orientationMode = ref('portrait')
const iframeRef = ref(null)
const supportsOrientationSwitch = computed(() => Boolean(active.value.orientationSwitch))
const isLandscape = computed(() => supportsOrientationSwitch.value && orientationMode.value === 'landscape')
const aspectLabel = computed(() => (isLandscape.value ? '16:9 · 横屏' : '9:16 · 竖屏'))
const orientationButtonLabel = computed(() => (isLandscape.value ? '切到竖屏' : '切到横屏'))

function resetOrientationForActive() {
  orientationMode.value = active.value.orientationSwitch?.defaultMode || 'portrait'
}

function notifyIframeResize() {
  nextTick(() => {
    const frameWindow = iframeRef.value?.contentWindow
    if (!frameWindow) return
    frameWindow.dispatchEvent(new frameWindow.Event('resize'))
  })
}

function toggleOrientation() {
  if (!supportsOrientationSwitch.value) return
  orientationMode.value = isLandscape.value ? 'portrait' : 'landscape'
  notifyIframeResize()
}

/* ── 全屏试玩 ──────────────────────────────────────────────────
   全屏是把**同一个** .phone-frame 提成 fixed 居中放大，而不是复制一份
   —— 复制出来就是一个新的 iframe，游戏会从头重新加载，进度全丢。
   退出方式：点手机框以外的区域，或者按 Esc。 */
const isFullscreen = ref(false)

function openFullscreen() {
  isFullscreen.value = true
  document.body.style.overflow = 'hidden' // 全屏时别让页面跟着滚
}

function closeFullscreen() {
  if (!isFullscreen.value) return
  isFullscreen.value = false
  document.body.style.overflow = ''
}

function toggleFullscreen() {
  if (isFullscreen.value) closeFullscreen()
  else openFullscreen()
}

function onFullscreenKey(e) {
  if (e.key === 'Escape') closeFullscreen()
}

/* ── 「回到试玩」浮动按钮 ────────────────────────────────────────
   往下滚去看文案或「其他试玩」之后，想把那个竖屏框滚回正中，用滚轮
   经常一滑就过头。这个按钮固定挂在**视口右侧**而不是手机框右边 ——
   挂在框右边的话，等滚过头它自己也跟着滚没了，等于白加。
   只在手机框没有完整露出来时才浮现，平时不碍事。 */
const showScrollCue = ref(false)
let cueRaf = 0

function scrollToPlayer() {
  const frame = document.querySelector('.play-frame')
  if (!frame) return
  const rect = frame.getBoundingClientRect()
  const top = rect.top + window.scrollY
  const vh = window.innerHeight
  const target = rect.height > vh - 48
    ? top - 16                        // 框比视口还高 → 顶到上边就够了
    : top - (vh - rect.height) / 2    // 否则让它垂直居中
  window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
}

// 滚动/改变视口时判断手机框露没露全，露全了就收起按钮。
// 用 rAF 节流，别让 scroll 事件把主线程刷爆。
function updateScrollCue() {
  if (cueRaf) return
  cueRaf = requestAnimationFrame(() => {
    cueRaf = 0
    const frame = document.querySelector('.play-frame')
    if (!frame) { showScrollCue.value = false; return }
    const rect = frame.getBoundingClientRect()
    const vh = window.innerHeight
    showScrollCue.value = !(rect.top >= -4 && rect.bottom <= vh + 4)
  })
}

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
onMounted(() => {
  syncFromQuery()
  schedulePrefetch()
  window.addEventListener('keydown', onFullscreenKey)
  window.addEventListener('scroll', updateScrollCue, { passive: true })
  window.addEventListener('resize', updateScrollCue)
  updateScrollCue()
})
watch(() => route.query.game, syncFromQuery)

// iframe 懒加载：只有点击"立即试玩"才挂载
const iframeMounted = ref(false)
const iframeKey = ref(0) // 切换 game 或重新加载时递增

/* ── 试玩加载遮罩 ──────────────────────────────────────────────
   试玩包 4~5MB，点「立即试玩」后要下载 → 解 brotli → eval 引擎 →
   初始化场景，这几秒里 iframe 是一片纯黑，干等很难受。

   做法：先由我们自己 fetch 把整包读一遍（所以百分比是真实的"拿到多少
   字节"），读完那些字节就进了 HTTP 缓存；然后再挂 iframe 让它用**原路径**
   加载 —— 此时基本是命中缓存的，几乎瞬时，于是「进度条走完」和
   「iframe 拿到字节」是同一件事，不会各跑各的。

   为什么不直接把 fetch 的内容做成 blob 喂给 iframe：试过，blob 文档的
   baseURI 变了，包里的 new URL(相对路径) 会抛 Invalid URL，
   实测报错。让 iframe 走原路径就没有这个问题。
   万一服务器禁用了缓存，iframe 会重新下一遍，但遮罩一直盖着，
   用户看到的依然是封面 + 进度，不会退化成黑屏。
   ───────────────────────────────────────────────────────────── */
const RING_LENGTH = 264 // 2πr, r = 42
const SLOW_HINT_MS = 6000 // 引擎阶段太久 → 换句安抚文案
const READY_SETTLE_MS = 600 // 探测到引擎后，再等首帧画出来
const HARD_TIMEOUT_MS = 30000 // 绝对兜底，绝不能一直挡着

const showLoader = ref(false)
const loadPhase = ref('download') // download | boot
const loadPercent = ref(0)
const loadSlow = ref(false)

const loaderHint = computed(() => {
  if (loadPhase.value === 'download') return '正在加载试玩包'
  return loadSlow.value ? '引擎首次解压会慢一点，马上就好' : '正在启动游戏引擎'
})

let loadCtl = null
let probeTimer = null
let fakeTimer = null
let slowTimer = null
let exitTimer = null
let prefetchCtl = null
let prefetchedSrc = '' // 已经预热进 HTTP 缓存的包路径

function stopLoadTimers() {
  if (probeTimer) { clearInterval(probeTimer); probeTimer = null }
  if (fakeTimer) { clearInterval(fakeTimer); fakeTimer = null }
  clearTimeout(slowTimer); slowTimer = null
  clearTimeout(exitTimer); exitTimer = null
}

function resetLoader() {
  stopLoadTimers()
  if (loadCtl) { loadCtl.abort(); loadCtl = null }
  showLoader.value = false
  loadPhase.value = 'download'
  loadPercent.value = 0
  loadSlow.value = false
}

function mountIframe() {
  iframeMounted.value = true
  iframeKey.value++
}

function finishLoader(delay = 0) {
  stopLoadTimers()
  if (loadCtl) { loadCtl.abort(); loadCtl = null }
  exitTimer = setTimeout(() => { showLoader.value = false }, delay)
}

// 同源轮询：判断 Cocos 是否真的把画面跑起来了
function isEngineReady() {
  const frame = iframeRef.value
  if (!frame) return false
  try {
    const win = frame.contentWindow
    const doc = win && win.document
    if (!doc || !doc.body) return false

    // 最强信号：引擎进入渲染循环（场景已挂载且已有帧）
    const cc = win.cc
    if (cc && cc.director) {
      const d = cc.director
      if (typeof d.getTotalFrames === 'function' && d.getTotalFrames() > 1) return true
      if (typeof d.getScene === 'function' && d.getScene()) return true
    }

    // 兜底信号：引擎把 GameCanvas 从默认 300×150 改写成设计分辨率
    const canvas = doc.getElementById('GameCanvas') || doc.querySelector('canvas')
    if (canvas && canvas.width > 0 && canvas.height > 0
        && (canvas.width !== 300 || canvas.height !== 150)) return true
  } catch (err) {
    return false // 探测不到就交给超时兜底
  }
  return false
}

// 把整包读一遍并报进度。读完即弃 —— 目的不是把数据留下，
// 而是让这些字节进 HTTP 缓存，紧接着挂载的 iframe 就能直接命中，
// 于是「进度条走完」和「iframe 拿到字节」是同一件事。
async function warmUpSource(src, signal, onProgress) {
  const res = await fetch(src, { signal })
  if (!res.ok || !res.body) throw new Error('HTTP ' + res.status)
  const total = Number(res.headers.get('content-length') || 0)
  const reader = res.body.getReader()
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    received += value.byteLength
    if (total) onProgress(received / total)
  }
}

function startProbe() {
  nextTick(() => {
    if (!showLoader.value) return
    const startedAt = Date.now()
    probeTimer = setInterval(() => {
      if (isEngineReady()) { finishLoader(READY_SETTLE_MS); return }
      if (Date.now() - startedAt > HARD_TIMEOUT_MS) finishLoader(0)
    }, 180)
  })
}

// 进入「引擎启动」阶段：进度条交给无限旋转圈，并开始计"慢"的安抚文案。
// 放在这里而不是用 setTimeout 从点击算，是为了让"慢"只针对引擎阶段 ——
// 下载慢的时候百分比本身就在动，用户不缺反馈，不该换文案。
function enterBootPhase() {
  loadPercent.value = 100
  loadPhase.value = 'boot'
  clearTimeout(slowTimer)
  slowTimer = setTimeout(() => { loadSlow.value = true }, SLOW_HINT_MS)
}

function startPlayable(src) {
  resetLoader()
  showLoader.value = true
  loadPhase.value = 'download'
  loadPercent.value = 0

  // 预取已经把字节放进缓存了 → 下载阶段直接跳过，立刻挂 iframe
  if (prefetchedSrc === src) {
    if (prefetchCtl) { prefetchCtl.abort(); prefetchCtl = null }
    enterBootPhase()
    mountIframe()
    startProbe()
    return
  }

  // 正式加载优先：掐掉还在跑的预取，把带宽让出来
  if (prefetchCtl) { prefetchCtl.abort(); prefetchCtl = null }

  const ctl = new AbortController()
  loadCtl = ctl

  // 拿不到 content-length 时的缓动假进度，保证始终有反馈
  fakeTimer = setInterval(() => {
    if (loadPercent.value < 92) {
      loadPercent.value = Math.min(92, loadPercent.value + Math.max(0.5, (92 - loadPercent.value) * 0.05))
    }
  }, 140)

  const proceed = () => {
    if (ctl.signal.aborted) return
    if (fakeTimer) { clearInterval(fakeTimer); fakeTimer = null }
    loadCtl = null
    enterBootPhase()
    mountIframe() // 字节已经在缓存里，这一步几乎是瞬时的
    startProbe()
  }

  // 预热失败也照常往下走 —— 那就让 iframe 自己去下载，遮罩继续盖着
  warmUpSource(src, ctl.signal, (ratio) => {
    if (fakeTimer) { clearInterval(fakeTimer); fakeTimer = null }
    loadPercent.value = Math.min(99, ratio * 100)
  }).then(proceed, proceed)
}

function loadIframe() {
  const src = active.value?.playableSrc
  if (!src) return
  startPlayable(src)
}

function reloadIframe() {
  const src = active.value?.playableSrc
  if (!src) return
  startPlayable(src)
}

/* ── 空闲预取：停在试玩页时就把包先读进 HTTP 缓存，
   点「立即试玩」时连下载阶段都省了，直接进引擎启动。
   边下边看体积，超过 8MB 立刻放弃（rabbit.html 有 40MB，不能白下）。 */
const PREFETCH_LIMIT = 8 * 1024 * 1024

function schedulePrefetch() {
  if (prefetchCtl) { prefetchCtl.abort(); prefetchCtl = null }
  prefetchedSrc = ''
  const src = active.value?.playableSrc
  if (!src || typeof fetch !== 'function') return

  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500))
  idle(() => {
    if (iframeMounted.value) return // 已经在正式加载了，别重复拉
    const ctl = new AbortController()
    prefetchCtl = ctl
    runPrefetch(src, ctl)
  }, { timeout: 4000 })
}

async function runPrefetch(src, ctl) {
  try {
    const res = await fetch(src, { signal: ctl.signal, priority: 'low' })
    if (!res.ok || !res.body) return
    const reader = res.body.getReader()
    let seen = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      seen += value.byteLength
      if (seen > PREFETCH_LIMIT) { ctl.abort(); return }
    }
    if (ctl.signal.aborted) return
    prefetchedSrc = src // 读完 → 字节已进缓存，等待被 startPlayable 认领
  } catch (err) {
    // 预取失败无所谓，正式加载照常走网络
  }
}

// 切换到其他 game
function selectGame(game) {
  resetLoader()
  activeId.value = game.id
  // 切到设计稿游戏时不要显示旧 iframe
  iframeMounted.value = false
  iframeKey.value++
}

// 切换 game 时把页面滚回顶部（用户可能在底部列表点击）
watch(activeId, () => {
  resetLoader()
  closeFullscreen() // 换游戏就退出全屏，免得放大着切到别的游戏
  resetOrientationForActive()
  nextTick(() => {
    const stage = document.querySelector('.play-stage')
    if (stage) stage.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
  schedulePrefetch()
})

onUnmounted(() => {
  resetLoader()
  if (prefetchCtl) { prefetchCtl.abort(); prefetchCtl = null }
  window.removeEventListener('keydown', onFullscreenKey)
  window.removeEventListener('scroll', updateScrollCue)
  window.removeEventListener('resize', updateScrollCue)
  if (cueRaf) { cancelAnimationFrame(cueRaf); cueRaf = 0 }
  document.body.style.overflow = '' // 别把整页滚动锁死在外面
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
        下面是我用 Cocos Creator 真实打包的试玩广告，默认 9:16，可直接玩。
        支持横竖屏的游戏会显示方向切换按钮。
        加载需要几秒，耐心等一下。
      </p>
    </section>

    <!-- Stage: 9:16 iframe + 描述 -->
    <section class="play-stage shell">
      <div
        class="play-frame"
        :class="{ 'is-landscape': isLandscape }"
        :style="{ '--primary': active.colors[0], '--secondary': active.colors[1] }"
      >
        <div class="phone-frame" :class="{ 'is-fullscreen': isFullscreen }">
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
              <span class="play-cover-tag">{{ aspectLabel }} · {{ active.dimension }}</span>
            </div>
            <!-- 挂载后用 iframe 嵌入 -->
            <iframe
              v-else
              ref="iframeRef"
              :key="iframeKey"
              :src="active.playableSrc"
              class="play-iframe"
              frameborder="0"
              allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
              allowfullscreen
              scrolling="no"
              :title="`${active.title} 试玩广告`"
            ></iframe>

            <!-- 加载遮罩：盖住引擎初始化期间的黑屏，封面打底所以永远不是纯黑 -->
            <transition name="play-loader">
              <div v-if="showLoader" class="play-loader">
                <img class="play-loader-bg" :src="active.cover" alt="" aria-hidden="true" />
                <div class="play-loader-veil" aria-hidden="true"></div>
                <div class="play-loader-body">
                  <svg class="play-loader-ring" viewBox="0 0 100 100" aria-hidden="true">
                    <circle class="play-loader-track" cx="50" cy="50" r="42" />
                    <circle
                      v-if="loadPhase === 'download'"
                      class="play-loader-bar"
                      cx="50"
                      cy="50"
                      r="42"
                      :stroke-dasharray="RING_LENGTH"
                      :stroke-dashoffset="RING_LENGTH * (1 - loadPercent / 100)"
                    />
                    <circle v-else class="play-loader-spin" cx="50" cy="50" r="42" />
                  </svg>
                  <span v-if="loadPhase === 'download'" class="play-loader-num">
                    {{ Math.round(loadPercent) }}<i>%</i>
                  </span>
                  <span v-else class="play-loader-dots" aria-hidden="true"><i></i><i></i><i></i></span>
                </div>
                <p class="play-loader-hint">{{ loaderHint }}</p>
              </div>
            </transition>
          </div>
          <div class="phone-home" aria-hidden="true"></div>
        </div>
        <div class="play-frame-actions">
          <div class="play-frame-buttons">
            <button
              v-if="supportsOrientationSwitch"
              type="button"
              class="play-orientation"
              @click="toggleOrientation"
            >↔ {{ orientationButtonLabel }}</button>
            <button
              v-if="iframeMounted && active.playableSrc"
              type="button"
              class="play-reload"
              @click="reloadIframe"
            >↻ 重新加载</button>
            <button
              v-if="iframeMounted && active.playableSrc"
              type="button"
              class="play-fullscreen"
              :aria-pressed="isFullscreen"
              @click="toggleFullscreen"
            >{{ isFullscreen ? '✕ 退出全屏' : '⛶ 全屏' }}</button>
          </div>
          <span class="play-frame-tip">
            {{ active.hasPlayable ? active.iframeTip : '点击其他游戏即可切换' }}
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

        <div v-if="supportsOrientationSwitch" class="play-orientation-note">
          <b>横竖屏切换</b>
          <p>{{ active.orientationSwitch.hint }}</p>
        </div>

        <div v-if="active.controls" class="play-control-tips">
          <h4>怎么玩</h4>
          <ul>
            <li v-for="control in active.controls" :key="control">{{ control }}</li>
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
    <!-- 「回到试玩」浮动按钮：固定在视口右侧，滚到哪儿都点得到 -->
    <button
      v-if="showScrollCue && !isFullscreen"
      type="button"
      class="play-scroll-cue"
      title="把试玩屏幕滚到视口正中"
      @click="scrollToPlayer"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6.5" y="2.5" width="11" height="19" rx="3" />
        <path d="M12 8.6v6" />
        <path d="M9.6 12.3 12 14.7l2.4-2.4" />
      </svg>
      <span>回到试玩</span>
    </button>

    <!-- 全屏时的「点空白处退出」层。它和手机框不是父子关系，
         所以点手机框本身不会冒泡到这里，只有点外面才退出。 -->
    <Teleport to="body">
      <div v-if="isFullscreen" class="play-fullscreen-backdrop" @click="closeFullscreen">
        <span class="play-fullscreen-hint">点击空白处退出全屏 · 或按 Esc</span>
      </div>
    </Teleport>
  </main>
</template>
