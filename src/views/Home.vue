<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { works, workTypes } from '../data/works.js'
import rabbitCover from '../assets/covers/rabbit.svg'

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

const skillGroups = [
  {
    id: 'web',
    tag: 'WEB',
    title: '前端 / Web Coding',
    hint: '日常写代码的底座',
    items: [
      { name: 'HTML', level: 5, note: '语义化 / 无障碍' },
      { name: 'CSS', level: 5, note: '布局 / 动画 / 响应式' },
      { name: 'JavaScript', level: 5, note: 'ES2022+ / 异步' },
      { name: 'TypeScript', level: 4, note: '类型体操 / 泛型' },
      { name: 'Vue', level: 4, note: '组合式 API / 生态' },
      { name: 'Web Coding', level: 4, note: 'Canvas / WebGL 基础' },
    ],
  },
  {
    id: 'ai',
    tag: 'AI',
    title: 'AI 辅助开发',
    hint: '把主流模型和 Agent 串进日常的开发链',
    items: [
      { name: '主流模型调用', level: 5, note: 'DeepSeek · GPT · MiniMax · 豆包 · 征途' },
      { name: 'AI 编码 Agent', level: 5, note: 'Codex · Trea · Workbody' },
      { name: '提示词工程', level: 5, note: '模板库 / 复杂任务拆解' },
      { name: 'AI 辅助 Debug', level: 4, note: '报错定位 / 性能分析' },
      { name: '工具串联', level: 4, note: 'Cocos MCP / 工作流自动化' },
    ],
  },
  {
    id: 'cocos',
    tag: 'COCOS',
    title: 'Cocos Creator',
    hint: '游戏开发主引擎',
    items: [
      { name: 'Cocos Creator', level: 5, note: '编辑器 / 场景 / 预制体' },
      { name: 'TypeScript 游戏开发', level: 4, note: '组件 / 生命周期' },
      { name: 'Cocos MCP', level: 4, note: 'AI 串联工作流' },
      { name: 'UI 框架', level: 4, note: 'Button / Layout / List' },
      { name: '动画系统', level: 4, note: 'Tween / Spine' },
      { name: '物理 / 碰撞', level: 3, note: 'Box2D / 射线检测' },
    ],
  },
]

const experiences = [
  {
    id: 'exp-playable',
    period: '近期',
    title: 'Cocos 试玩广告 · 个人项目',
    desc: '基于 Cocos Creator 制作 6 款试玩广告，覆盖 2D / 3D、解压、三消、闯关、模拟经营四类。',
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

const devFlow = [
  { step: '01', title: '确认需求', color: '#1677ff', desc: '先聊清楚玩法核心、目标用户、平台与内容，落到一份能直接动手写的需求文档。' },
  { step: '02', title: '搭建框架', color: '#16a34a', desc: '搭场景、写组件原型、定资源规范、跑通一个最小可玩的 Demo，再往上垒功能。' },
  { step: '03', title: '开发迭代', color: '#8b5cf6', desc: '按模块推进玩法 / UI / 动画 / 音效，每完成一块就内测一次，不留到最后才发。' },
  { step: '04', title: '平台适配', color: '#f59e0b', desc: '针对不同分辨率、机型与渠道做适配，处理刘海屏、安全区、横竖屏与加载策略。' },
  { step: '05', title: '功能测试', color: '#ec4899', desc: '用例覆盖主流程、异常路径与边界条件，整理缺陷清单，让 Bug 暴露在小范围内。' },
  { step: '06', title: '打包验证', color: '#06b6d4', desc: '正式打包后做真机验证、性能跑分与首帧时延，确保上线后用户能直接玩到。' },
]

const process = [
  { step: '01', title: '看见玩法', desc: '用熟悉物件和清晰目标，让用户一眼看懂要做什么。' },
  { step: '02', title: '动手有反馈', desc: '第一次操作就要有触感、音效、视觉奖励，建立控制感。' },
  { step: '03', title: '留一个钩子', desc: '在最爽的地方停下，把"差一点就赢"变成下载动机。' },
]

// 主页精选：只展示 4 个，避免跟 Works 页完全重复
const featuredWorks = computed(() => works.slice(0, 4))

const skillMax = 5
function skillPercent(level) {
  return Math.round((level / skillMax) * 100)
}
</script>

<template>
  <main class="page home-page">
    <!-- HERO -->
    <section id="top" class="hero shell">
      <div class="hero-copy">
        <p class="eyebrow">
          <span class="dot" aria-hidden="true"></span>
          RESUME / 2027 · COCOS GAME DEVELOPER
        </p>
        <h1>
          <span class="has-gradient-text has-text-sheen" data-sheen="梨花詩">梨花詩</span>
        </h1>
        <p class="hero-text">
          大四在读 · 求职 <strong>{{ profile.role }}</strong>。<br />
          前端写 Vue、游戏用 Cocos Creator、AI 用 Codex 提效。
        </p>
        <div class="hero-actions">
          <router-link class="btn btn-primary has-btn-sheen" to="/tools">查看工具</router-link>
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

    <!-- ABOUT -->
    <section id="about" class="about shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> 01 / ABOUT</p>
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

    <!-- SKILLS -->
    <section id="skills" class="skills shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> 02 / SKILLS</p>
        <h2>技术栈</h2>
        <p class="section-note">分成三块：Web 前端 / AI 辅助 / Cocos Creator。</p>
      </header>
      <div class="skills-grid">
        <article v-for="group in skillGroups" :key="group.id" class="skill-card">
          <header class="skill-card-head">
            <span class="skill-tag">{{ group.tag }}</span>
            <div>
              <h3>{{ group.title }}</h3>
              <p>{{ group.hint }}</p>
            </div>
          </header>
          <ul class="skill-list">
            <li v-for="skill in group.items" :key="skill.name">
              <div class="skill-row">
                <span class="skill-name">{{ skill.name }}</span>
                <span class="skill-note">{{ skill.note }}</span>
              </div>
              <div class="skill-bar" :aria-label="`${skill.name} 熟练度 ${skill.level} / ${skillMax}`">
                <span :style="{ width: skillPercent(skill.level) + '%' }"></span>
              </div>
            </li>
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

    <!-- DEV FLOW -->
    <section class="devflow shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> 03.5 / DEV FLOW</p>
        <h2>我开发一个游戏的流程</h2>
        <p class="section-note">从拿到需求到正式上线，我习惯拆成这 6 步走，每一步都有交付物。</p>
      </header>
      <ol class="devflow-grid">
        <li v-for="(step, idx) in devFlow" :key="step.step" class="devflow-card">
          <span class="devflow-line" v-if="idx < devFlow.length - 1" aria-hidden="true"></span>
          <header class="devflow-head">
            <span class="devflow-step" :style="{ '--accent-color': step.color }">{{ step.step }}</span>
            <span class="devflow-dot" :style="{ background: step.color }" aria-hidden="true"></span>
          </header>
          <h3>{{ step.title }}</h3>
          <p>{{ step.desc }}</p>
        </li>
      </ol>
    </section>

    <!-- FEATURED WORKS -->
    <section id="works" class="works shell">
      <header class="section-head section-head-row">
        <div>
          <p class="eyebrow"><span class="dot" aria-hidden="true"></span> 04 / WORKS</p>
          <h2>Cocos 试玩广告精选</h2>
          <p class="section-note">这里先放 4 个代表作，直接进入试玩中心体验。</p>
        </div>
        <router-link to="/play" class="works-all-link">
          进入试玩中心
          <span aria-hidden="true">→</span>
        </router-link>
      </header>

      <div class="game-grid">
        <router-link
          v-for="(game, idx) in featuredWorks"
          :key="game.id"
          :to="`/play?game=${idx}`"
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
            <span class="card-id">0{{ game.id }}</span>
          </div>
        </router-link>
      </div>
    </section>

    <!-- PLAYABLE PLACEHOLDER -->
    <section id="playable" class="playable shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> 05 / PLAYABLE DEMO</p>
        <h2>亲自试一下我做的 Cocos 游戏</h2>
        <p class="section-note">下面是我用 Cocos Creator 真实打包的 9:16 试玩广告，点开就能玩。</p>
      </header>

      <router-link to="/play" class="playable-cta">
        <div class="playable-cta-art">
          <img :src="rabbitCover" alt="Rabbit 试玩封面" />
          <span class="playable-cta-tag">9:16 · 2D 跑酷</span>
          <span class="playable-cta-pulse" aria-hidden="true"></span>
        </div>
        <div class="playable-cta-body">
          <p class="eyebrow"><span class="dot" aria-hidden="true"></span> RABBIT · COCOS PLAYABLE</p>
          <h3>小兔子跑酷</h3>
          <p>点屏幕 = 跳跃，长按 = 二段跳。吃最多萝卜，看你能拿多少分。</p>
          <span class="playable-cta-go">点击进入试玩中心 →</span>
        </div>
      </router-link>
    </section>

    <!-- PROCESS -->
    <section class="process shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> 06 / HOW I WORK</p>
        <h2>我做试玩广告的方法</h2>
        <p class="section-note">每一秒都分配了任务：让用户 <strong>看懂、动手、想赢</strong>。</p>
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
