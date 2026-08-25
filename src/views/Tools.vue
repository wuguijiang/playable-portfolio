<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import serviceImage from '../assets/tools/cocos-mcp-service.png'
import connectionImage from '../assets/tools/cocos-mcp-connection.png'
import settingsImage from '../assets/tools/cocos-mcp-settings.png'
import toolsImage from '../assets/tools/cocos-mcp-tools.png'
import connectedImage from '../assets/tools/cocos-mcp-connected.jpg'
import desktopAssistantImage from '../assets/tools/cocos-desktop-assistant.png'
import sandboxConsoleImage from '../assets/tools/playable-sandbox-console.png'
import imageCompressorImage from '../assets/tools/image-compressor.png'

const protocolSteps = [
  {
    label: '01 / CONFIG',
    title: '把地址写进项目',
    detail: '控制台生成并写入项目级 Codex 配置。客户端只需要知道本机的 MCP 地址，不需要额外暴露 Cocos 项目文件。',
  },
  {
    label: '02 / CONNECT',
    title: '建立 MCP 会话',
    detail: 'Codex 通过 Streamable HTTP 向 /mcp 发起初始化；扩展记录握手、客户端信息、最近调用与异常状态。',
  },
  {
    label: '03 / CALL',
    title: '把意图翻译为编辑器操作',
    detail: '工具请求进入 Cocos Creator 的 Editor.Message 通道，再由场景、资源和组件接口完成读取或写入。',
  },
  {
    label: '04 / VERIFY',
    title: '回读结果，再给 AI 反馈',
    detail: '写入操作会回读节点、组件或资源确认状态；超时不会直接重试，而是查询该操作的最终结果。',
  },
]

const capabilityGroups = [
  {
    id: 'scene',
    title: '知道该改哪里',
    tools: 'cocos_scene · cocos_node · cocos_component',
    detail: '读取场景树、节点组件和选择状态。AI 可以用 UUID、层级路径、节点名加范围，或当前选中节点定位目标。',
    result: '路径不存在或名称重名时，返回场景根节点、相近路径和候选项；目标不唯一时不执行写入。',
  },
  {
    id: 'assets',
    title: '找到资源与脚本',
    tools: 'cocos_asset · cocos_prefab · cocos_script',
    detail: '浏览与管理资源、预制体和已导入脚本；支持资源整理、预制体创建与实例化，以及脚本组件挂载。',
    result: '重新导入会等待资源数据库与相关编译状态稳定，再把验证结果和新的编译错误带回调用方。',
  },
  {
    id: 'interaction',
    title: '完成可玩的交互接线',
    tools: 'cocos_button_event · cocos_component',
    detail: '为 cc.Button 配置回调，补齐缺少的组件并修改允许写入的属性，避免 AI 只生成脚本却没有接入场景。',
    result: '重复添加同一事件或重复补同一组件会直接返回“已满足”，不会制造多余配置。',
  },
  {
    id: 'diagnostics',
    title: '让问题有反馈闭环',
    tools: 'cocos_diagnostics · cocos_operation_status',
    detail: '读取项目元信息、编辑器日志和最近错误；日志支持时间筛选与游标增量读取，便于持续定位问题。',
    result: '调用超时后保留原 operationId 查询状态，让 AI 区分“失败”“仍在执行”和“已完成”。',
  },
]

const toolNames = [
  'cocos_scene',
  'cocos_node',
  'cocos_component',
  'cocos_button_event',
  'cocos_asset',
  'cocos_prefab',
  'cocos_script',
  'cocos_undo_recording',
  'cocos_diagnostics',
  'cocos_operation_status',
]

const engineeringChoices = [
  {
    title: '只监听本机',
    detail: '服务固定绑定 127.0.0.1，默认端口 3000。这样 AI 可以调用编辑器，但不会把本地 Cocos 控制面暴露到局域网。',
  },
  {
    title: '写操作可追踪',
    detail: '每次写入都要求 operationId，并与首次请求的规范化内容绑定。相同请求可以安全复用，不同请求误用同一 ID 会被拒绝。',
  },
  {
    title: '状态跨重启保留',
    detail: '操作结果会写入项目临时目录的日志，保留 7 天并限制条数。服务重启时未完成的操作会标记为未知，避免盲目二次执行。',
  },
  {
    title: '先保护，再切场景',
    detail: '当前场景未保存时，工具拒绝打开另一场景；节点名称重名、资源找不到、属性没有落盘都会返回结构化错误和恢复建议。',
  },
]

const showcaseTools = [
  {
    id: 'mcp',
    index: '01',
    navTitle: 'Cocos MCP',
    eyebrow: 'COCOS CREATOR EXTENSION / MCP',
    title: '让 AI 进入',
    accent: 'Cocos 编辑器',
    description: 'Cocos MCP 是我独立开发的 Cocos Creator 本地扩展。它把场景、节点、组件、资源和日志封装成可验证的 MCP 工具，让 Codex 能够理解引擎状态、执行编辑操作，并拿到明确的结果反馈。',
    tags: ['TypeScript', 'Streamable HTTP', '127.0.0.1:3000'],
    image: connectedImage,
    alt: 'Cocos MCP 控制台显示服务运行中、Codex 已连接和最近工具调用',
    caption: '服务状态、握手时间、最近调用与错误都留在控制台里。',
    theme: 'mcp',
  },
  {
    id: 'desktop-assistant',
    index: '02',
    navTitle: 'Cocos MCP 助手',
    eyebrow: 'COCOS DESKTOP ASSISTANT',
    title: '项目与 MCP',
    accent: '桌面控制台',
    description: '面向已打开 Cocos 项目的桌面控制台：集中查看项目、扩展、端口和 MCP 健康状态，把安装、连接测试、诊断和操作日志放在一处。',
    tags: ['项目发现', '扩展安装', 'MCP 诊断', '操作日志'],
    image: desktopAssistantImage,
    alt: 'Cocos MCP 助手桌面界面，包含已打开项目、扩展安装、诊断和操作日志',
    caption: '从项目发现到 MCP 健康状态，集中在同一个桌面控制台。',
    theme: 'assistant',
    detailTitle: 'Cocos MCP 助手',
    details: [
      ['已打开的 Cocos', '发现并汇总正在运行的 Cocos 项目，直接看到项目名、服务端口和进程状态。'],
      ['扩展与诊断', '把扩展安装、端口检测、连接测试和健康检查收进同一工作流。'],
      ['操作日志', '记录执行过程，方便回看项目发现、安装、检测和修复结果。'],
    ],
  },
  {
    id: 'playable-sandbox',
    index: '03',
    navTitle: '试玩广告沙盒',
    eyebrow: 'PLAYABLE AD SANDBOX',
    title: '试玩广告',
    accent: '验证沙盒',
    description: '把试玩素材放进渠道和机型语境中预览：切换广告渠道、设备规格、方向与安全区域，并观察 SDK 初始化和交互事件。',
    tags: ['渠道模拟', '设备预览', '安全区域', '事件面板'],
    image: sandboxConsoleImage,
    alt: '试玩广告沙盒界面，包含广告渠道、设备机型、手机预览和事件操作台',
    caption: '渠道、机型、手机预览和事件面板同步呈现。',
    theme: 'sandbox',
    detailTitle: '试玩广告沙盒',
    details: [
      ['渠道语境', '切换 AppLovin、Google Ads、ironSource、Unity Ads、TikTok、Snapchat 与 Meta 等投放环境。'],
      ['设备预览', '用真实手机比例检查横竖屏、安全区域和试玩素材的首屏表现。'],
      ['事件观察', '查看 SDK 初始化与广告事件，并在本地验证打开、点击和退出等交互。'],
    ],
  },
  {
    id: 'image-compressor',
    index: '04',
    navTitle: '像素压缩',
    eyebrow: 'LOCAL IMAGE UTILITY',
    title: '图片压缩',
    accent: '本地处理',
    description: '面向游戏素材处理的本地图片工具：压缩、调整尺寸、编辑、合并与智能抠图都收进同一界面，并保留 PNG 与 WebP 的透明通道。',
    tags: ['压缩图片', '调整尺寸', '保留透明', '本地处理'],
    image: imageCompressorImage,
    alt: '像素压缩工具界面，展示压缩强度、图片上传和导出设置',
    caption: '素材处理在本机完成，保留透明通道与导出控制。',
    theme: 'compressor',
    detailTitle: '像素压缩',
    details: [
      ['素材压缩', '针对 JPG、PNG 和 WebP 输出做体积优化，同时保持图片尺寸可控。'],
      ['透明通道', '保留 PNG 与 WebP 的透明信息，适配游戏 UI、图标和叠层素材。'],
      ['常用处理', '把尺寸调整、编辑、合并与智能抠图整合为同一套本地素材流程。'],
    ],
  },
]

const activeToolIndex = ref(0)
const activeTool = computed(() => showcaseTools[activeToolIndex.value])
let carouselTimer

function selectTool(index) {
  activeToolIndex.value = index
  stopCarousel()
}

function moveTool(direction) {
  activeToolIndex.value = (activeToolIndex.value + direction + showcaseTools.length) % showcaseTools.length
  stopCarousel()
}

function startCarousel() {
  carouselTimer = window.setInterval(() => {
    activeToolIndex.value = (activeToolIndex.value + 1) % showcaseTools.length
  }, 7000)
}

function stopCarousel() {
  if (carouselTimer) window.clearInterval(carouselTimer)
  carouselTimer = undefined
}

onMounted(startCarousel)
onBeforeUnmount(() => {
  stopCarousel()
})
</script>

<template>
  <main class="page tools-page">
    <section class="mcp-hero" :class="`mcp-hero--${activeTool.theme}`">
      <transition name="hero-slide" mode="out-in">
        <div :key="activeTool.id" class="mcp-hero-inner shell">
          <div class="mcp-hero-copy">
            <p class="eyebrow"><span class="dot" aria-hidden="true"></span> {{ activeTool.eyebrow }}</p>
            <h1><span>{{ activeTool.title }}</span><em>{{ activeTool.accent }}</em></h1>
            <p class="mcp-hero-text">{{ activeTool.description }}</p>
            <div class="mcp-hero-actions">
              <a class="btn btn-primary" href="#tool-details">查看工具详情</a>
              <button class="btn btn-ghost" type="button" @click="moveTool(1)">切换下一个工具 &#8594;</button>
            </div>
            <div class="mcp-hero-facts" aria-label="当前工具标签">
              <span v-for="tag in activeTool.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>

          <figure :class="['mcp-hero-console', `mcp-hero-console--${activeTool.id}`]">
            <div class="mcp-hero-console-bar">
              <span class="mcp-console-name">{{ activeTool.index }} / {{ activeTool.eyebrow }}</span>
              <span class="mcp-connected"><i aria-hidden="true"></i> {{ activeTool.id === 'mcp' ? 'Codex 已接入' : '独立工具' }}</span>
            </div>
            <img :src="activeTool.image" :alt="activeTool.alt" />
            <figcaption>{{ activeTool.caption }}</figcaption>
          </figure>
        </div>
      </transition>

      <div class="mcp-hero-pagination" role="tablist" aria-label="工具轮播">
        <button
          v-for="(tool, index) in showcaseTools"
          :key="tool.id"
          type="button"
          role="tab"
          :aria-selected="activeToolIndex === index"
          :aria-label="`切换到${tool.navTitle}`"
          :title="tool.navTitle"
          :class="{ active: activeToolIndex === index }"
          @click="selectTool(index)"
        ></button>
      </div>
    </section>

    <nav id="tool-details" class="tool-subnav" aria-label="工具详情导航">
      <div class="shell tool-subnav-inner" role="tablist">
        <button
          v-for="(tool, index) in showcaseTools"
          :key="tool.id"
          type="button"
          role="tab"
          :aria-selected="activeToolIndex === index"
          :class="{ active: activeToolIndex === index }"
          @click="selectTool(index)"
        >
          <span>{{ tool.index }}</span>
          <b>{{ tool.navTitle }}</b>
          <small>{{ tool.eyebrow }}</small>
        </button>
      </div>
    </nav>

    <template v-if="activeTool.id === 'mcp'">
      <section id="console" class="mcp-proof shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> REAL CONSOLE / CONNECTION</p>
        <h2>先看见连接，<br />再让 AI 接管引擎。</h2>
        <p class="section-note">
          控制台把“服务是否运行、客户端是否真的在活动、最后调用了什么”分开呈现。等待连接和真实客户端接入，是两种不同状态。
        </p>
      </header>

      <div class="mcp-proof-grid">
        <figure class="mcp-screen mcp-screen--service">
          <img :src="serviceImage" alt="Cocos MCP 控制台中的本地服务运行状态和监听端口 3000" />
          <figcaption>
            <span>服务已启动</span>
            <b>本地监听 · 等待客户端</b>
          </figcaption>
        </figure>
        <figure class="mcp-screen mcp-screen--connected">
          <img :src="connectedImage" alt="Cocos MCP 控制台显示 Codex 已接入和 cocos asset 工具调用成功" />
          <figcaption>
            <span>真实客户端已接入</span>
            <b>握手、最近调用、耗时与错误</b>
          </figcaption>
        </figure>
        <div class="mcp-proof-copy">
          <p class="mcp-kicker">CONNECTION TRACKER</p>
          <h3>区分“端口开着”和“AI 真正在用”。</h3>
          <p>
            扩展用最近两分钟的真实客户端活动判断连接状态，并显示客户端名称、最后握手时间、最后一次工具调用和最近错误。
            内置自检会单独标识，不会把自检误算为外部客户端接入。
          </p>
          <dl>
            <div><dt>TRANSPORT</dt><dd>官方 MCP SDK</dd></div>
            <div><dt>SESSION</dt><dd>Streamable HTTP</dd></div>
            <div><dt>HEALTH</dt><dd>GET /health</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section id="workflow" class="mcp-workflow">
      <div class="shell">
        <header class="mcp-section-heading">
          <div>
            <p class="eyebrow"><span class="dot" aria-hidden="true"></span> HOW IT WORKS</p>
            <h2>一次 AI 调用，怎样到达 Cocos。</h2>
          </div>
          <p>
            不是让模型直接碰项目文件，而是先通过 MCP 取得受约束的编辑器能力，再将每一步的结果带回对话。
          </p>
        </header>

        <ol class="mcp-flow">
          <li v-for="step in protocolSteps" :key="step.label">
            <span class="mcp-flow-label">{{ step.label }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.detail }}</p>
          </li>
        </ol>

        <div class="mcp-route" aria-label="工具调用路径">
          <span>Codex</span>
          <b>POST <code>/mcp</code></b>
          <span>Cocos MCP</span>
          <b>Editor.Message</b>
          <span>Cocos Creator</span>
          <b>结构化结果</b>
          <span>Codex</span>
        </div>
      </div>
    </section>

    <section class="mcp-setup shell">
      <div class="mcp-setup-copy">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> PROJECT-LEVEL SETUP</p>
        <h2>地址、健康检查和配置，都在项目里完成。</h2>
        <p>
          控制台可以复制配置、写入当前项目配置并一键自检。默认端点是 <code>http://127.0.0.1:3000/mcp</code>，
          健康检查走 <code>/health</code>；端口、自动启动和编辑器请求超时都可保存到项目设置中。
        </p>
      </div>
      <figure class="mcp-screen mcp-screen--settings">
        <img :src="settingsImage" alt="Cocos MCP 服务设置页，包含监听端口、请求超时、Codex 接入地址和一键自检" />
        <figcaption>项目级配置避免影响全局 Codex 环境，同时保留可复制、可恢复的接入过程。</figcaption>
      </figure>
    </section>

    <section class="mcp-capabilities">
      <div class="shell">
        <header class="mcp-section-heading">
          <div>
            <p class="eyebrow"><span class="dot" aria-hidden="true"></span> WHAT IT SOLVES</p>
            <h2>把“帮我改一下”变成<br />能定位、能执行、能反馈的操作。</h2>
          </div>
          <p>
            AI 最难的不是生成一段代码，而是知道该作用到哪个场景对象、改完有没有生效、出错后下一步该怎么走。
          </p>
        </header>

        <div class="mcp-capability-list">
          <article v-for="(group, index) in capabilityGroups" :key="group.id" class="mcp-capability">
            <span>0{{ index + 1 }}</span>
            <div>
              <p class="mcp-tool-id">{{ group.tools }}</p>
              <h3>{{ group.title }}</h3>
              <p>{{ group.detail }}</p>
              <p class="mcp-result"><b>反馈：</b>{{ group.result }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="mcp-tools-gallery">
      <div class="shell">
        <header class="mcp-section-heading">
          <div>
            <p class="eyebrow"><span class="dot" aria-hidden="true"></span> TOOL SURFACE</p>
            <h2>把工具范围放到台面上。</h2>
          </div>
          <p>
            工具页可逐项启用或关闭，保存后服务自动更新。用清晰的能力边界替代“一句提示词可以改一切”的不确定性。
          </p>
        </header>

        <div class="mcp-gallery-grid">
          <figure class="mcp-screen mcp-screen--connection">
            <img :src="connectionImage" alt="Cocos MCP 客户端连接详情，显示最近客户端、最后握手、最后调用和最后错误" />
            <figcaption>客户端活动面板</figcaption>
          </figure>
          <figure class="mcp-screen mcp-screen--tools">
            <img :src="toolsImage" alt="Cocos MCP 工具列表，列出场景、节点、组件、资源和脚本等工具开关" />
            <figcaption>10 个可配置工具</figcaption>
          </figure>
        </div>

        <div class="mcp-tool-strip" aria-label="Cocos MCP 工具列表">
          <span v-for="name in toolNames" :key="name">{{ name }}</span>
        </div>
      </div>
    </section>

    <section class="mcp-engineering shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> ENGINEERING DECISIONS</p>
        <h2>我为“AI 接管编辑器”补上的约束。</h2>
        <p class="section-note">
          让 AI 能操作，不等于让 AI 可以随意操作。真正可用的桥梁，要把安全、幂等、验证和恢复放进协议层。
        </p>
      </header>

      <div class="mcp-engineering-list">
        <article v-for="(choice, index) in engineeringChoices" :key="choice.title">
          <span>0{{ index + 1 }}</span>
          <div>
            <h3>{{ choice.title }}</h3>
            <p>{{ choice.detail }}</p>
          </div>
        </article>
      </div>
    </section>

      <section class="mcp-contact shell">
        <div>
          <p class="eyebrow"><span class="dot" aria-hidden="true"></span> INDEPENDENT DEVELOPMENT</p>
          <h2>从试玩广告开发里的真实摩擦，<br />做出一套 AI 能理解的 Cocos 工作流。</h2>
        </div>
        <a class="btn btn-primary" href="mailto:2926044894@qq.com">交流 Cocos MCP ↗</a>
      </section>
    </template>

    <section v-else class="tool-detail-preview" :class="`tool-detail-preview--${activeTool.theme}`">
      <div class="shell tool-detail-preview-inner">
        <header>
          <p class="eyebrow"><span class="dot" aria-hidden="true"></span> {{ activeTool.index }} / {{ activeTool.eyebrow }}</p>
          <h2>{{ activeTool.navTitle }}</h2>
          <p>{{ activeTool.description }}</p>
        </header>

        <figure>
          <img :src="activeTool.image" :alt="activeTool.alt" />
          <figcaption>{{ activeTool.caption }}</figcaption>
        </figure>

        <div class="tool-detail-points">
          <article v-for="([title, detail], index) in activeTool.details" :key="title">
            <span>0{{ index + 1 }}</span>
            <div>
              <h3>{{ title }}</h3>
              <p>{{ detail }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.tools-page { padding-top: 0; }
.tools-page .eyebrow { letter-spacing: 0; }
.mcp-hero {
  display: flex;
  flex-direction: column;
  min-height: calc(100svh - 72px);
  overflow: hidden;
  color: #edf6f7;
  background:
    linear-gradient(90deg, rgba(93, 214, 190, .1) 1px, transparent 1px),
    linear-gradient(rgba(93, 214, 190, .08) 1px, transparent 1px),
    #182129;
  background-size: 56px 56px;
}
.mcp-hero-inner {
  display: grid;
  flex: 1;
  grid-template-columns: minmax(0, 1.02fr) minmax(340px, .98fr);
  gap: clamp(40px, 7vw, 94px);
  align-items: center;
  min-height: 590px;
  padding: 80px 0 72px;
}
.mcp-hero .eyebrow { color: #9cb7c4; }
.mcp-hero .eyebrow .dot,
.mcp-workflow .eyebrow .dot { background: #55d6bb; box-shadow: 0 0 0 4px rgba(85, 214, 187, .15); }
.mcp-hero h1 {
  margin: 0;
  font-size: clamp(48px, 5.7vw, 78px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0;
}
.mcp-hero h1 > span,
.mcp-hero h1 em { display: block; white-space: nowrap; }
.mcp-hero h1 em { color: #55d6bb; font-style: normal; }
.mcp-hero-text {
  max-width: 620px;
  margin-top: 26px;
  color: #b7c8d2;
  font-size: 16px;
  line-height: 1.9;
}
.mcp-hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 30px; }
.mcp-hero-actions .btn { border-radius: 6px; }
.mcp-hero-actions .btn-primary { background: #55d6bb; color: #102027; }
.mcp-hero-actions .btn-primary:hover { background: #8cebd7; }
.mcp-hero-actions .btn-ghost { border-color: #50626d; color: #edf6f7; }
.mcp-hero-actions .btn-ghost:hover { border-color: #55d6bb; color: #55d6bb; }
.mcp-hero-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  margin-top: 38px;
  border-top: 1px solid #3c4b55;
  border-bottom: 1px solid #3c4b55;
}
.mcp-hero-facts span {
  padding: 11px 15px;
  border-right: 1px solid #3c4b55;
  color: #a6c4c9;
  font: 500 11px 'DM Mono', monospace;
  letter-spacing: 0;
}
.mcp-hero-facts span:first-child { padding-left: 0; }
.mcp-hero-facts span:last-child { border-right: 0; }
.mcp-hero-console {
  margin: 0;
  overflow: hidden;
  border: 1px solid #41545e;
  border-radius: 6px;
  background: #20282e;
  box-shadow: 22px 24px 0 rgba(8, 13, 17, .38);
}
.mcp-hero-console-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 44px;
  padding: 10px 14px;
  border-bottom: 1px solid #41545e;
  background: #171e23;
}
.mcp-console-name { color: #acc0c9; font: 500 10.5px 'DM Mono', monospace; letter-spacing: 0; }
.mcp-connected { display: inline-flex; align-items: center; gap: 7px; color: #c4dde0; font-size: 12px; white-space: nowrap; }
.mcp-connected i { width: 8px; height: 8px; border-radius: 50%; background: #55d6bb; box-shadow: 0 0 0 4px rgba(85, 214, 187, .12); }
.mcp-hero-console img { width: 100%; min-height: 390px; object-fit: cover; object-position: top; }
.mcp-hero-console figcaption { padding: 13px 14px; color: #9db1bb; border-top: 1px solid #41545e; font-size: 12px; line-height: 1.65; }
.mcp-hero--assistant {
  color: #102a4c;
  background:
    linear-gradient(90deg, rgba(55, 109, 194, .1) 1px, transparent 1px),
    linear-gradient(rgba(55, 109, 194, .08) 1px, transparent 1px),
    #e8f0fb;
}
.mcp-hero--sandbox {
  color: #153852;
  background:
    linear-gradient(90deg, rgba(52, 142, 214, .1) 1px, transparent 1px),
    linear-gradient(rgba(52, 142, 214, .08) 1px, transparent 1px),
    #ddf0fb;
}
.mcp-hero--compressor {
  color: #173344;
  background:
    linear-gradient(90deg, rgba(39, 147, 209, .1) 1px, transparent 1px),
    linear-gradient(rgba(39, 147, 209, .08) 1px, transparent 1px),
    #eff7fb;
}
.mcp-hero--assistant .mcp-hero-inner,
.mcp-hero--sandbox .mcp-hero-inner,
.mcp-hero--compressor .mcp-hero-inner {
  width: min(1420px, calc(100% - 80px));
  grid-template-columns: minmax(350px, .78fr) minmax(560px, 1.22fr);
  gap: clamp(44px, 6vw, 100px);
}
.mcp-hero--assistant .eyebrow,
.mcp-hero--sandbox .eyebrow,
.mcp-hero--compressor .eyebrow { color: #52718b; }
.mcp-hero--assistant .eyebrow .dot,
.mcp-hero--sandbox .eyebrow .dot,
.mcp-hero--compressor .eyebrow .dot { background: #258fd0; box-shadow: 0 0 0 4px rgba(37, 143, 208, .14); }
.mcp-hero--assistant h1 em { color: #275ed6; }
.mcp-hero--sandbox h1 em { color: #1785c2; }
.mcp-hero--compressor h1 em { color: #218dcc; }
.mcp-hero--assistant .mcp-hero-text,
.mcp-hero--sandbox .mcp-hero-text,
.mcp-hero--compressor .mcp-hero-text { color: #45647a; }
.mcp-hero--assistant .mcp-hero-actions .btn-primary { background: #2f64d8; color: #fff; }
.mcp-hero--sandbox .mcp-hero-actions .btn-primary,
.mcp-hero--compressor .mcp-hero-actions .btn-primary { background: #238dca; color: #fff; }
.mcp-hero--assistant .mcp-hero-actions .btn-ghost,
.mcp-hero--sandbox .mcp-hero-actions .btn-ghost,
.mcp-hero--compressor .mcp-hero-actions .btn-ghost { border-color: #91afc4; color: #21445b; background: rgba(255, 255, 255, .4); }
.mcp-hero--assistant .mcp-hero-facts,
.mcp-hero--sandbox .mcp-hero-facts,
.mcp-hero--compressor .mcp-hero-facts { border-color: #b8cedc; }
.mcp-hero--assistant .mcp-hero-facts span,
.mcp-hero--sandbox .mcp-hero-facts span,
.mcp-hero--compressor .mcp-hero-facts span { border-color: #b8cedc; color: #426882; }
.mcp-hero--assistant .mcp-hero-console,
.mcp-hero--sandbox .mcp-hero-console,
.mcp-hero--compressor .mcp-hero-console { border-color: #9ab6c9; background: #edf6fa; box-shadow: 22px 24px 0 rgba(37, 82, 108, .16); }
.mcp-hero--assistant .mcp-hero-console-bar,
.mcp-hero--sandbox .mcp-hero-console-bar,
.mcp-hero--compressor .mcp-hero-console-bar { border-color: #a8c3d4; background: #f9fdff; }
.mcp-hero--assistant .mcp-console-name,
.mcp-hero--sandbox .mcp-console-name,
.mcp-hero--compressor .mcp-console-name { color: #426882; }
.mcp-hero--assistant .mcp-connected,
.mcp-hero--sandbox .mcp-connected,
.mcp-hero--compressor .mcp-connected { color: #3c6783; }
.mcp-hero--assistant .mcp-connected i,
.mcp-hero--sandbox .mcp-connected i,
.mcp-hero--compressor .mcp-connected i { background: #238dca; box-shadow: 0 0 0 4px rgba(35, 141, 202, .12); }
.mcp-hero--assistant .mcp-hero-console figcaption,
.mcp-hero--sandbox .mcp-hero-console figcaption,
.mcp-hero--compressor .mcp-hero-console figcaption { border-color: #a8c3d4; color: #426882; background: #f9fdff; }
.mcp-hero-console--desktop-assistant img,
.mcp-hero-console--playable-sandbox img,
.mcp-hero-console--image-compressor img {
  height: clamp(420px, 48vh, 540px);
  min-height: 0;
  object-fit: cover;
  object-position: center top;
  background: #edf6fa;
}
.mcp-hero-console--playable-sandbox img { object-fit: contain; }
.mcp-hero-pagination {
  display: flex;
  flex: none;
  justify-content: center;
  gap: 10px;
  margin-top: auto;
  padding: 0 24px 30px;
}
.mcp-hero-pagination button {
  width: 9px;
  height: 9px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #70858e;
  opacity: .7;
  transition: transform .2s, background .2s, opacity .2s;
}
.mcp-hero-pagination button:hover,
.mcp-hero-pagination button:focus-visible { opacity: 1; transform: scale(1.2); }
.mcp-hero-pagination button:focus-visible { outline: 2px solid #edf6f7; outline-offset: 4px; }
.mcp-hero-pagination button.active { background: #55d6bb; opacity: 1; }
.mcp-hero--assistant .mcp-hero-pagination button,
.mcp-hero--sandbox .mcp-hero-pagination button,
.mcp-hero--compressor .mcp-hero-pagination button { background: #8aa8bb; }
.mcp-hero--assistant .mcp-hero-pagination button:focus-visible,
.mcp-hero--sandbox .mcp-hero-pagination button:focus-visible,
.mcp-hero--compressor .mcp-hero-pagination button:focus-visible { outline-color: #275ed6; }
.mcp-hero--assistant .mcp-hero-pagination button.active { background: #275ed6; }
.mcp-hero--sandbox .mcp-hero-pagination button.active,
.mcp-hero--compressor .mcp-hero-pagination button.active { background: #238dca; }
.hero-slide-enter-active,
.hero-slide-leave-active { transition: opacity .24s ease, transform .24s ease; }
.hero-slide-enter-from { opacity: 0; transform: translateX(18px); }
.hero-slide-leave-to { opacity: 0; transform: translateX(-18px); }

.tool-subnav { border-bottom: 1px solid #d7e1e4; background: #fff; }
.tool-subnav-inner { display: grid; grid-template-columns: repeat(4, 1fr); }
.tool-subnav button {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 10px;
  align-content: center;
  min-height: 88px;
  padding: 15px 18px;
  border: 0;
  border-right: 1px solid #d7e1e4;
  color: #526873;
  background: #fff;
  text-align: left;
  transition: background .2s, color .2s;
}
.tool-subnav button:first-child { border-left: 1px solid #d7e1e4; }
.tool-subnav button:hover,
.tool-subnav button.active { color: #0d7665; background: #edf9f7; box-shadow: inset 0 -3px #55d6bb; }
.tool-subnav button > span { grid-row: span 2; color: #168b78; font: 500 11px 'DM Mono', monospace; }
.tool-subnav b { font-size: 14px; line-height: 1.35; }
.tool-subnav small { margin-top: 4px; color: #82949c; font: 500 9.5px 'DM Mono', monospace; line-height: 1.3; letter-spacing: 0; }

.tool-detail-preview { padding: 94px 0; background: #f2f7fb; }
.tool-detail-preview--sandbox { background: #e7f4fb; }
.tool-detail-preview--compressor { background: #f4f9fc; }
.tool-detail-preview-inner {
  display: grid;
  grid-template-columns: minmax(260px, .68fr) minmax(0, 1.32fr);
  gap: 38px 58px;
  align-items: start;
}
.tool-detail-preview header { padding-top: 14px; }
.tool-detail-preview h2 { margin-top: 12px; font-size: clamp(36px, 4.6vw, 58px); line-height: 1.15; letter-spacing: 0; }
.tool-detail-preview header > p:last-child { margin-top: 20px; color: #45647a; font-size: 15px; line-height: 1.9; }
.tool-detail-preview figure {
  margin: 0;
  overflow: hidden;
  border: 1px solid #abc5d2;
  border-radius: 6px;
  background: #eef6fa;
  box-shadow: 18px 18px 0 rgba(70, 151, 188, .13);
}
.tool-detail-preview figure img { display: block; width: 100%; min-height: 360px; object-fit: contain; background: #eef6fa; }
.tool-detail-preview figcaption { padding: 12px 14px; border-top: 1px solid #abc5d2; color: #52718b; background: #f9fdff; font-size: 12px; line-height: 1.6; }
.tool-detail-points { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid #b9cfd9; border-left: 1px solid #b9cfd9; }
.tool-detail-points article {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 12px;
  min-height: 152px;
  padding: 22px;
  border-right: 1px solid #b9cfd9;
  border-bottom: 1px solid #b9cfd9;
  background: rgba(255, 255, 255, .38);
}
.tool-detail-points article > span { color: #238dca; font: 500 10.5px 'DM Mono', monospace; }
.tool-detail-points h3 { font-size: 17px; line-height: 1.35; letter-spacing: 0; }
.tool-detail-points p { margin-top: 7px; color: #52718b; font-size: 13px; line-height: 1.75; }

.tool-carousel { padding: 88px 0 94px; border-bottom: 1px solid #d7e4e7; background: #f4fafa; }
.tool-carousel-heading {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, .65fr);
  gap: 56px;
  align-items: end;
  margin-bottom: 38px;
}
.tool-carousel-heading h2 {
  font-size: clamp(30px, 4.1vw, 52px);
  font-weight: 900;
  line-height: 1.16;
  letter-spacing: 0;
}
.tool-carousel-heading > p { color: var(--ink-2); font-size: 14.5px; line-height: 1.85; }
.tool-carousel-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid #bfced3;
  border-bottom: 1px solid #bfced3;
}
.tool-carousel-tabs button {
  min-height: 58px;
  padding: 0 18px;
  border: 0;
  border-left: 1px solid #bfced3;
  color: #526973;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  transition: background .2s, color .2s;
}
.tool-carousel-tabs button:last-child { border-right: 1px solid #bfced3; }
.tool-carousel-tabs button:hover,
.tool-carousel-tabs button.active { color: #0f7363; background: #e1f5f1; }
.tool-carousel-tabs button span {
  display: inline-block;
  margin-right: 10px;
  color: #168b78;
  font: 500 11px 'DM Mono', monospace;
}
.tool-carousel-stage { position: relative; padding: 28px 0 58px; }
.tool-carousel-item {
  display: grid;
  grid-template-columns: minmax(250px, .65fr) minmax(0, 1.35fr);
  gap: 46px;
  align-items: center;
}
.tool-carousel-copy { padding: 18px 0 18px 22px; border-left: 3px solid #55d6bb; }
.tool-carousel-copy > p:first-child {
  color: #168b78;
  font: 500 11px 'DM Mono', monospace;
  letter-spacing: 0;
}
.tool-carousel-copy h3 { margin-top: 16px; font-size: clamp(30px, 3.3vw, 46px); line-height: 1.15; letter-spacing: 0; }
.tool-carousel-description { margin-top: 18px; color: var(--ink-2); font-size: 14.5px; line-height: 1.9; }
.tool-carousel-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 24px; }
.tool-carousel-tags span {
  padding: 6px 9px;
  border: 1px solid #bfced3;
  border-radius: 4px;
  color: #317866;
  background: #fff;
  font: 500 10.5px 'DM Mono', monospace;
  letter-spacing: 0;
}
.tool-carousel-note { display: block; margin-top: 30px; color: #779099; font: 500 11px 'DM Mono', monospace; letter-spacing: 0; }
.tool-carousel-image {
  position: relative;
  min-height: 392px;
  margin: 0;
  overflow: hidden;
  border: 1px solid #bdced3;
  border-radius: 6px;
  background: #eaf1f4;
  box-shadow: 18px 18px 0 #d9ebe9;
}
.tool-carousel-image img { width: 100%; height: 100%; min-height: 392px; object-fit: cover; object-position: center; }
.tool-carousel-image figcaption {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 6px 9px;
  border: 1px solid rgba(255, 255, 255, .52);
  border-radius: 4px;
  color: #effafb;
  background: rgba(14, 29, 35, .78);
  font: 500 10px 'DM Mono', monospace;
  letter-spacing: 0;
}
.tool-carousel-controls {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #56717a;
  font: 500 11px 'DM Mono', monospace;
  letter-spacing: 0;
}
.tool-carousel-arrow {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid #9bb9bf;
  border-radius: 4px;
  color: #245f68;
  background: #fff;
  font-size: 16px;
  line-height: 1;
  transition: background .2s, border-color .2s, color .2s;
}
.tool-carousel-arrow:hover { border-color: #168b78; color: #fff; background: #168b78; }
.tool-slide-enter-active,
.tool-slide-leave-active { transition: opacity .18s ease, transform .18s ease; }
.tool-slide-enter-from { opacity: 0; transform: translateX(12px); }
.tool-slide-leave-to { opacity: 0; transform: translateX(-12px); }

.mcp-proof { padding: 100px 0; }
.mcp-proof .section-head h2,
.mcp-section-heading h2,
.mcp-setup h2,
.mcp-engineering h2,
.mcp-contact h2 {
  font-size: clamp(30px, 4.1vw, 54px);
  font-weight: 900;
  line-height: 1.16;
  letter-spacing: 0;
}
.mcp-proof-grid {
  display: grid;
  grid-template-columns: minmax(0, .95fr) minmax(0, .74fr) minmax(260px, .7fr);
  align-items: start;
  gap: 22px;
}
.mcp-screen {
  margin: 0;
  overflow: hidden;
  border: 1px solid #cbd6db;
  border-radius: 6px;
  background: #20282e;
  box-shadow: 0 20px 42px -32px rgba(15, 23, 42, .68);
}
.mcp-screen img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
.mcp-screen figcaption {
  display: grid;
  gap: 4px;
  padding: 11px 13px;
  border-top: 1px solid #3c4a52;
  color: #a9bbc3;
  background: #20282e;
  font-size: 12px;
}
.mcp-screen figcaption span { color: #edf6f7; font-weight: 700; }
.mcp-screen figcaption b { font-weight: 500; line-height: 1.55; }
.mcp-screen--service { aspect-ratio: 688 / 748; }
.mcp-screen--connected { aspect-ratio: 527 / 599; margin-top: 58px; }
.mcp-proof-copy { padding: 28px 0 0 6px; }
.mcp-kicker { color: #168b78; font: 500 11px 'DM Mono', monospace; letter-spacing: 0; }
.mcp-proof-copy h3 { margin-top: 18px; font-size: 26px; line-height: 1.3; letter-spacing: 0; }
.mcp-proof-copy > p:not(.mcp-kicker) { margin-top: 14px; color: var(--ink-2); font-size: 14px; line-height: 1.85; }
.mcp-proof-copy dl { display: grid; gap: 0; margin-top: 28px; border-top: 1px solid var(--line); }
.mcp-proof-copy dl > div { display: flex; justify-content: space-between; gap: 20px; padding: 11px 0; border-bottom: 1px solid var(--line); }
.mcp-proof-copy dt { color: var(--muted); font: 500 10px 'DM Mono', monospace; letter-spacing: 0; }
.mcp-proof-copy dd { color: var(--ink); font: 700 12px 'DM Mono', monospace; letter-spacing: 0; }

.mcp-workflow { padding: 94px 0; color: #edf6f7; background: #182129; }
.mcp-section-heading {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(270px, .65fr);
  gap: 60px;
  align-items: end;
  margin-bottom: 44px;
}
.mcp-section-heading > div .eyebrow { margin-bottom: 14px; }
.mcp-section-heading > p { color: var(--ink-2); font-size: 14.5px; line-height: 1.85; }
.mcp-workflow .mcp-section-heading > p { color: #b7c8d2; }
.mcp-flow {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid #3d4c56;
  border-bottom: 1px solid #3d4c56;
}
.mcp-flow li { position: relative; min-height: 272px; padding: 25px 23px 28px; }
.mcp-flow li + li { border-left: 1px solid #3d4c56; }
.mcp-flow li:not(:last-child)::after {
  position: absolute;
  right: -8px;
  bottom: 30px;
  z-index: 1;
  width: 15px;
  height: 15px;
  border-top: 1px solid #55d6bb;
  border-right: 1px solid #55d6bb;
  content: '';
  transform: rotate(45deg);
  background: #182129;
}
.mcp-flow-label { color: #55d6bb; font: 500 10.5px 'DM Mono', monospace; letter-spacing: 0; }
.mcp-flow h3 { margin-top: 52px; font-size: 22px; line-height: 1.28; letter-spacing: 0; }
.mcp-flow p { margin-top: 13px; color: #b3c4cf; font-size: 13.5px; line-height: 1.8; }
.mcp-route {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
  margin-top: 28px;
  color: #b8cdd1;
  font: 500 11px 'DM Mono', monospace;
  letter-spacing: 0;
}
.mcp-route span { padding: 7px 10px; border: 1px solid #475862; border-radius: 4px; }
.mcp-route b { color: #55d6bb; font-weight: 500; }
.mcp-route code { color: #55d6bb; background: transparent; }

.mcp-setup {
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
  gap: 70px;
  align-items: center;
  padding: 98px 0;
}
.mcp-setup-copy > p:not(.eyebrow) { max-width: 580px; margin-top: 22px; color: var(--ink-2); font-size: 15px; line-height: 1.9; }
.mcp-setup-copy code { color: #087a68; background: #e9f7f4; }
.mcp-screen--settings { aspect-ratio: 657 / 697; }
.mcp-screen--settings figcaption { color: #a9bbc3; }

.mcp-capabilities { padding: 94px 0; border-top: 1px solid #dce5e8; border-bottom: 1px solid #dce5e8; background: #f3f8f8; }
.mcp-capabilities .mcp-section-heading > p { color: var(--ink-2); }
.mcp-capability-list { border-top: 1px solid #cbd6db; }
.mcp-capability {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  gap: 22px;
  padding: 29px 0;
  border-bottom: 1px solid #cbd6db;
}
.mcp-capability > span { color: #168b78; font: 500 12px 'DM Mono', monospace; letter-spacing: 0; }
.mcp-tool-id { color: #168b78; font: 500 11px 'DM Mono', monospace; line-height: 1.5; letter-spacing: 0; }
.mcp-capability h3 { margin-top: 9px; font-size: 23px; line-height: 1.3; letter-spacing: 0; }
.mcp-capability p:not(.mcp-tool-id) { max-width: 780px; margin-top: 9px; color: var(--ink-2); font-size: 14px; line-height: 1.8; }
.mcp-capability .mcp-result { color: #51656c; }
.mcp-result b { color: var(--ink); }

.mcp-tools-gallery { padding: 96px 0; }
.mcp-gallery-grid { display: grid; grid-template-columns: minmax(230px, .42fr) minmax(0, 1.58fr); gap: 24px; align-items: start; }
.mcp-screen--connection { aspect-ratio: 687 / 572; }
.mcp-screen--tools { aspect-ratio: 1683 / 1294; }
.mcp-tool-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 24px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
}
.mcp-tool-strip span {
  padding: 6px 9px;
  border: 1px solid #cbd6db;
  border-radius: 4px;
  color: #317866;
  background: #f5fbfa;
  font: 500 10.5px 'DM Mono', monospace;
  letter-spacing: 0;
}

.mcp-engineering { padding: 100px 0; }
.mcp-engineering-list { display: grid; grid-template-columns: repeat(2, 1fr); border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
.mcp-engineering-list article {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 16px;
  min-height: 184px;
  padding: 26px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.mcp-engineering-list article > span { color: #168b78; font: 500 11px 'DM Mono', monospace; letter-spacing: 0; }
.mcp-engineering-list h3 { font-size: 19px; line-height: 1.3; letter-spacing: 0; }
.mcp-engineering-list p { margin-top: 10px; color: var(--ink-2); font-size: 13.5px; line-height: 1.8; }

.mcp-contact {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 28px;
  padding: 52px 0 94px;
  border-top: 2px solid var(--ink);
}
.mcp-contact h2 { margin-top: 12px; }
.mcp-contact .btn { flex: none; border-radius: 6px; }

@media (max-width: 960px) {
  .mcp-hero { min-height: 0; }
  .mcp-hero-inner { flex: none; grid-template-columns: 1fr; min-height: 0; padding: 64px 0; }
  .mcp-hero--assistant .mcp-hero-inner,
  .mcp-hero--sandbox .mcp-hero-inner,
  .mcp-hero--compressor .mcp-hero-inner {
    width: min(1180px, calc(100% - 48px));
    grid-template-columns: 1fr;
  }
  .mcp-hero-console--desktop-assistant img,
  .mcp-hero-console--playable-sandbox img,
  .mcp-hero-console--image-compressor img {
    height: auto;
    object-fit: contain;
  }
  .mcp-hero-console { max-width: 620px; }
  .tool-subnav-inner { grid-template-columns: repeat(2, 1fr); }
  .tool-subnav button:nth-child(3) { border-left: 1px solid #d7e1e4; }
  .tool-detail-preview-inner { grid-template-columns: 1fr; }
  .tool-detail-preview header { max-width: 680px; }
  .tool-detail-preview figure { max-width: 860px; }
  .tool-detail-points { grid-template-columns: repeat(3, 1fr); }
  .tool-carousel-heading { grid-template-columns: 1fr; gap: 18px; }
  .tool-carousel-item { grid-template-columns: 1fr; gap: 30px; }
  .tool-carousel-image { max-width: 820px; }
  .mcp-proof-grid { grid-template-columns: repeat(2, 1fr); }
  .mcp-proof-copy { grid-column: 1 / -1; max-width: 640px; padding-left: 0; }
  .mcp-screen--connected { margin-top: 42px; }
  .mcp-section-heading { grid-template-columns: 1fr; gap: 18px; }
  .mcp-flow { grid-template-columns: repeat(2, 1fr); }
  .mcp-flow li:nth-child(3) { border-left: 0; border-top: 1px solid #3d4c56; }
  .mcp-flow li:nth-child(4) { border-top: 1px solid #3d4c56; }
  .mcp-flow li:nth-child(2)::after { display: none; }
  .mcp-setup { grid-template-columns: 1fr; gap: 34px; }
  .mcp-setup-copy { max-width: 640px; }
}

@media (max-width: 640px) {
  .mcp-hero-inner { padding: 48px 0 52px; }
  .mcp-hero--assistant .mcp-hero-inner,
  .mcp-hero--sandbox .mcp-hero-inner,
  .mcp-hero--compressor .mcp-hero-inner { width: min(100% - 28px, 620px); }
  .mcp-hero h1 { font-size: clamp(40px, 11vw, 56px); }
  .mcp-hero-text { font-size: 15px; }
  .mcp-hero-console img { min-height: 0; }
  .mcp-hero-facts span { padding: 9px 10px; font-size: 10px; }
  .mcp-hero-pagination { padding-bottom: 24px; }
  .tool-subnav-inner { grid-template-columns: 1fr; }
  .tool-subnav button,
  .tool-subnav button:first-child,
  .tool-subnav button:nth-child(3) { min-height: 72px; border-left: 0; border-right: 0; border-bottom: 1px solid #d7e1e4; }
  .tool-subnav button:last-child { border-bottom: 0; }
  .tool-detail-preview { padding: 62px 0; }
  .tool-detail-preview figure img { min-height: 230px; }
  .tool-detail-points { grid-template-columns: 1fr; }
  .tool-detail-points article { min-height: 0; padding: 22px 0; border-right: 0; }
  .mcp-proof,
  .tool-carousel,
  .mcp-workflow,
  .mcp-setup,
  .mcp-capabilities,
  .mcp-tools-gallery,
  .mcp-engineering { padding: 62px 0; }
  .mcp-proof-grid,
  .mcp-gallery-grid,
  .mcp-engineering-list { grid-template-columns: 1fr; }
  .tool-carousel-tabs { grid-template-columns: 1fr; }
  .tool-carousel-tabs button { border-right: 1px solid #bfced3; }
  .tool-carousel-tabs button + button { border-top: 1px solid #bfced3; }
  .tool-carousel-stage { padding-bottom: 54px; }
  .tool-carousel-copy { padding-left: 16px; }
  .tool-carousel-image,
  .tool-carousel-image img { min-height: 230px; }
  .mcp-screen--connected { margin-top: 0; }
  .mcp-proof-copy { grid-column: auto; padding-top: 2px; }
  .mcp-flow { grid-template-columns: 1fr; }
  .mcp-flow li { min-height: 0; padding: 24px 0 28px; }
  .mcp-flow li + li,
  .mcp-flow li:nth-child(3),
  .mcp-flow li:nth-child(4) { border-top: 1px solid #3d4c56; border-left: 0; }
  .mcp-flow li:not(:last-child)::after { display: none; }
  .mcp-flow h3 { margin-top: 24px; }
  .mcp-capability { grid-template-columns: 38px minmax(0, 1fr); gap: 12px; }
  .mcp-capability h3 { font-size: 20px; }
  .mcp-engineering-list article { min-height: 0; padding: 24px 0; border-right: 0; }
  .mcp-contact { align-items: flex-start; flex-direction: column; padding: 42px 0 62px; }
}
</style>
