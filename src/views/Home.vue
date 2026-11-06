<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { works } from '../data/works.js'

const profile = {
  name: '梨花詩',
  enName: 'Lihua Shi',
  role: 'Cocos 游戏开发',
  status: '大四 · 2027 届',
  intent: 'Cocos 游戏开发 · 试玩广告方向',
  location: '在校 · 可实习 / 全职',
  email: '2926044894@qq.com',
  tagline: '把前端与游戏双栈揉在一起，专注 Cocos 试玩广告的互动体验。',
  summary: '前端写 Vue，游戏用 Cocos Creator。习惯用 Codex 提效，把一个清晰的爽点压缩成用户愿意立刻点击的试玩广告。',
}

// 邮件弹窗
const mailModalOpen = ref(false)
const mailCopied = ref(false)
let copyTimer = null

function openMailModal() {
  mailModalOpen.value = true
  mailCopied.value = false
}

function closeMailModal() {
  mailModalOpen.value = false
  mailCopied.value = false
  if (copyTimer) { clearTimeout(copyTimer); copyTimer = null }
}

async function copyEmail() {
  const text = profile.email
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // fallback：旧浏览器 / 非安全上下文
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    mailCopied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => { mailCopied.value = false }, 2200)
  } catch (e) {
    console.error('复制失败', e)
  }
}

function onKeydown(e) {
  if (e.key === 'Escape' && mailModalOpen.value) closeMailModal()
}

watch(mailModalOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => { window.addEventListener('keydown', onKeydown) })
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (copyTimer) clearTimeout(copyTimer)
})

const basics = [
  { label: '状态', value: '大四 · 2027 届' },
  { label: '岗位', value: 'Cocos 游戏开发' },
  { label: '方向', value: '试玩广告 / H5 互动' },
  { label: '驻地', value: '可实习 · 可全职' },
]

const experiences = [
  {
    id: 'exp-playable',
    period: '近期',
    title: 'Cocos 试玩广告 · 个人项目',
    desc: '基于 Cocos Creator 制作多款试玩广告，覆盖 2D / 3D、合成、解压、消除、闯关与模拟经营等玩法。',
    tags: ['Cocos Creator', 'TypeScript', '试玩广告', 'MCP'],
  },
  {
    id: 'exp-web',
    period: '在校',
    title: 'Web 前端开发 · 课程与实践',
    desc: '用 Vue 3 + Vite 搭建过组件库、工具站与互动页面，习惯把 UI 与逻辑拆开。',
    tags: ['Vue 3', 'Vite', 'TypeScript', '组件化'],
  },
]

const process = [
  { step: '01', title: '看见玩法', desc: '用熟悉物件和清晰目标，让用户一眼看懂要做什么。' },
  { step: '02', title: '动手有反馈', desc: '第一次操作就要有触感、音效、视觉奖励，建立控制感。' },
  { step: '03', title: '留一个钩子', desc: '在最爽的地方停下，把"差一点就赢"变成下载动机。' },
]

// 首页精选：手动指定代表作，按作品 id 对应到游戏页索引
const featuredIds = ['vegetable-ninja', 'refuge', 'rabbit', 'pindou']
const featuredWorks = computed(() => featuredIds
  .map((id) => works.find((game) => game.id === id))
  .filter(Boolean))

function workHref(game) {
  const idx = works.findIndex((work) => work.id === game.id)
  return `/play?game=${idx >= 0 ? idx : 0}`
}
</script>

<template>
  <main class="page home-page">
    <!-- HERO -->
    <section id="top" class="hero shell">
      <div class="hero-copy">
        <p class="eyebrow">
          <span class="dot" aria-hidden="true"></span>
          PORTFOLIO / 2027 · COCOS GAME DEVELOPER
        </p>
        <h1>
          <span class="has-gradient-text has-text-sheen" data-sheen="梨花詩">梨花詩</span>
        </h1>
        <p class="hero-text">
          大四在读 · 求职 <strong>{{ profile.role }}</strong>。<br />
          前端写 Vue、游戏用 Cocos Creator、AI 用 Codex 提效。
        </p>
        <div class="hero-actions">
          <router-link class="btn btn-primary has-btn-sheen" to="/play">试玩作品</router-link>
          <button class="btn btn-ghost" type="button" @click="openMailModal">发邮件 ↗</button>
          <span class="hero-meta">Cocos Creator · TS · Vue · Codex</span>
        </div>
      </div>

      <aside class="hero-card" aria-label="候选人速览">
        <div class="hero-card-head">
          <span class="avatar" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#1677ff" />
              <text x="32" y="40" text-anchor="middle" font-family="Noto Sans SC, sans-serif" font-size="22" font-weight="800" fill="#fff">梨</text>
            </svg>
          </span>
          <div>
            <p class="hero-card-name">{{ profile.name }} <small>· {{ profile.enName }}</small></p>
            <p class="hero-card-role">{{ profile.intent }}</p>
          </div>
        </div>
        <dl class="hero-card-list">
          <div v-for="item in basics" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
        <div class="hero-card-tags">
          <span>Cocos Creator</span>
          <span>TypeScript</span>
          <span>Vue 3</span>
          <span>Codex</span>
          <span>Playable Ads</span>
        </div>
      </aside>
    </section>

    <!-- FEATURED WORKS -->
    <section id="works" class="works shell">
      <header class="section-head section-head-row">
        <div>
          <p class="eyebrow"><span class="dot" aria-hidden="true"></span> 01 / WORKS</p>
          <h2>Cocos 游戏与试玩精选</h2>
          <p class="section-note">从 {{ works.length }} 个可玩作品里挑了 4 个不同玩法，点开直接上手。</p>
        </div>
        <router-link to="/play" class="works-all-link">
          全部 {{ works.length }} 个作品
          <span aria-hidden="true">→</span>
        </router-link>
      </header>

      <div class="game-grid">
        <router-link
          v-for="(game, idx) in featuredWorks"
          :key="game.id"
          :to="workHref(game)"
          class="game-card"
          :style="{ '--primary': game.colors[0], '--secondary': game.colors[1] }"
        >
          <div class="card-art">
            <img :src="game.cover" :alt="`${game.subtitle}游戏封面`" />
            <span class="art-tag">COCOS · {{ game.dimension }}</span>
          </div>
          <div class="card-info">
            <div>
              <p>{{ game.type }} · {{ game.label }}</p>
              <h3>{{ game.title }}</h3>
              <span>{{ game.subtitle }}</span>
            </div>
            <span class="card-id">{{ String(idx + 1).padStart(2, '0') }}</span>
          </div>
        </router-link>
      </div>
    </section>

    <!-- ABOUT -->
    <section id="about" class="about shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> 02 / ABOUT</p>
        <h2>关于我</h2>
        <p class="section-note">{{ profile.tagline }}</p>
      </header>
      <div class="about-grid">
        <article class="about-card">
          <h3>求职意向</h3>
          <p>
            目标岗位是 <strong>Cocos 游戏开发</strong>，偏向 H5 / 试玩广告 / 小游戏方向。
            接受实习与全职，工作地可灵活沟通。
          </p>
          <ul>
            <li>大四在读，2027 年毕业</li>
            <li>前端与 Cocos Creator 双栈，习惯写 TS</li>
            <li>熟悉 Cocos MCP、UI 框架与动画系统</li>
            <li>日常用 Codex 提效，能写清晰的提示词</li>
          </ul>
        </article>
        <article class="about-card">
          <h3>为什么是 Cocos</h3>
          <p>
            喜欢 Cocos 的轻量与可定制：能直接用 TypeScript 写组件，也能用 MCP 把 AI 串进工作流。
            试玩广告对"前 3 秒留住人"要求很高，正好对上我对交互节奏的执念。
          </p>
          <ul>
            <li>把 H5 互动做成可交付的试玩广告</li>
            <li>对素材切点与节拍有感觉</li>
            <li>愿意为美术与表现做工程化适配</li>
          </ul>
        </article>
      </div>
    </section>

    <!-- EXPERIENCE -->
    <section class="experience shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> 03 / EXPERIENCE</p>
        <h2>近期在做的事</h2>
        <p class="section-note">学校课程以外，自己在持续投入的方向。</p>
      </header>
      <ol class="exp-list">
        <li v-for="(item, idx) in experiences" :key="item.id" class="exp-item">
          <span class="exp-index">0{{ idx + 1 }}</span>
          <div class="exp-body">
            <div class="exp-head">
              <h3>{{ item.title }}</h3>
              <span class="exp-period">{{ item.period }}</span>
            </div>
            <p>{{ item.desc }}</p>
            <div class="exp-tags">
              <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </li>
      </ol>
    </section>

    <!-- PROCESS -->
    <section class="process shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> 04 / HOW I WORK</p>
        <h2>我做一个玩法的方法</h2>
        <p class="section-note">先让用户 <strong>看懂、愿意动手</strong>，再留一个想继续的钩子。</p>
      </header>
      <div class="process-grid">
        <article v-for="step in process" :key="step.step" class="process-card">
          <span class="process-step">{{ step.step }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.desc }}</p>
        </article>
      </div>
    </section>

    <!-- CONTACT -->
    <section id="contact" class="contact shell">
      <div class="contact-card has-drift-bg">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> CONTACT</p>
        <h2>有一个 Cocos 项目想一起做？<br /><em>欢迎聊聊。</em></h2>
        <div class="contact-actions">
          <a class="btn btn-primary" :href="`mailto:${profile.email}`">{{ profile.email }} ↗</a>
          <a class="btn btn-ghost" href="#top">回到顶部 ↑</a>
        </div>
        <ul class="contact-list">
          <li><span>状态</span><b>{{ profile.status }} · 求职中</b></li>
          <li><span>岗位</span><b>Cocos 游戏开发</b></li>
          <li><span>城市</span><b>可实习 · 可远程</b></li>
          <li><span>回复</span><b>1 个工作日内</b></li>
        </ul>
      </div>
    </section>

    <!-- 邮件弹窗 -->
    <transition name="mail-modal">
      <div v-if="mailModalOpen" class="mail-modal-backdrop" @click.self="closeMailModal" role="presentation">
        <div class="mail-modal" role="dialog" aria-modal="true" aria-labelledby="mail-modal-title">
          <button class="mail-modal-close" type="button" @click="closeMailModal" aria-label="关闭">×</button>
          <p class="eyebrow"><span class="dot" aria-hidden="true"></span> CONTACT</p>
          <h3 id="mail-modal-title">直接发邮件给我</h3>
          <p class="mail-modal-hint">点下面的按钮复制邮箱，然后粘到你的邮件客户端。</p>
          <div class="mail-modal-email">
            <span class="mail-modal-email-text">{{ profile.email }}</span>
          </div>
          <div class="mail-modal-actions">
            <button class="btn btn-primary" type="button" @click="copyEmail">
              {{ mailCopied ? '已复制 ✓' : '复制邮箱' }}
            </button>
            <button class="btn btn-ghost" type="button" @click="closeMailModal">关闭</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 复制成功 toast -->
    <transition name="toast">
      <div v-if="mailCopied" class="copy-toast" role="status" aria-live="polite">
        <span class="copy-toast-icon" aria-hidden="true">✓</span>
        <span>复制成功</span>
      </div>
    </transition>
  </main>
</template>
