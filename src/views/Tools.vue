<script setup>
import mcpAssistantImage from '../assets/tools/cocos-mcp-assistant.png'
import sandboxImage from '../assets/tools/playable-sandbox.png'

const toolCards = [
  {
    id: 'assistant',
    index: '01',
    label: 'DESKTOP ASSISTANT',
    title: 'Cocos MCP 助手',
    description: '把项目发现、扩展部署、MCP 连通性与结构检查收进同一个 Windows 桌面工具。',
    tags: ['项目扫描', 'MCP 诊断', '结构工具'],
  },
  {
    id: 'sandbox',
    index: '02',
    label: 'PLAYABLE SANDBOX',
    title: '试玩广告沙盒',
    description: '将试玩包放进渠道、设备与安全区语境里，直接检查真实投放前的互动表现。',
    tags: ['设备模拟', '渠道事件', '本地预览'],
  },
]

const assistantFeatures = [
  ['自动发现项目', '扫描本机已打开的 Cocos Creator 项目，集中查看项目路径、端口和进程状态。'],
  ['安全部署扩展', '一键安装 MCP 服务、PA 框架与 HTML5 构建扩展；安装前校验，失败时回滚。'],
  ['诊断 MCP 连接', '检查扩展、配置、端口监听、/health 与 /mcp JSON-RPC 连通性，并能导出报告。'],
  ['整理项目结构', '浏览场景树、导出场景信息供 AI 使用、对比标准结构，并只补齐缺失内容。'],
]

const sandboxFeatures = [
  ['渠道环境', '按 AppLovin、Google Ads、ironSource、Unity Ads、TikTok、Snapchat 与 Meta 切换预览语境。'],
  ['多设备尺寸', '内置 iPhone 16、iPhone 17 PM、iPhone SE、Galaxy S25、A16、A06 等机型尺寸。'],
  ['画面校验', '切换横竖屏与安全区，加载 HTML 或 ZIP，在手机画框中查看试玩实际表现。'],
  ['事件观察', '记录设备与素材操作日志，并触发 MRAID、Exit API、Meta、TikTok、AppLovin 等广告事件。'],
]
</script>

<template>
  <main class="page tools-page">
    <section class="tools-hero shell">
      <div class="tools-hero-copy">
        <p class="eyebrow">
          <span class="dot" aria-hidden="true"></span>
          INDEPENDENT TOOL / COCOS CREATOR
        </p>
        <h1>
          超级 COCOS
          <em>让开发与试玩验证在一处完成。</em>
        </h1>
        <p class="tools-hero-text">
          我独立开发的 Windows 工具套件。它一边负责 Cocos 项目与 MCP 扩展的接入、诊断和结构整理，
          一边为可试玩广告提供渠道、设备与事件模拟，让开发后的验证不再靠猜。
        </p>
        <div class="tools-hero-actions">
          <a class="btn btn-primary" href="#assistant">查看 MCP 助手</a>
          <a class="btn btn-ghost" href="#sandbox">查看试玩沙盒</a>
        </div>
      </div>

      <dl class="tools-metrics" aria-label="工具概览">
        <div><dt>TOOLS</dt><dd>2</dd><span>桌面工具 + 本地沙盒</span></div>
        <div><dt>EXTENSIONS</dt><dd>3</dd><span>MCP / PA / HTML5 构建</span></div>
        <div><dt>DEVICE PRESETS</dt><dd>6+</dd><span>iPhone 与 Galaxy 尺寸</span></div>
        <div><dt>TECH</dt><dd>C#</dd><span>.NET 8 · WinForms</span></div>
      </dl>
    </section>

    <section class="tool-index shell" aria-label="工具目录">
      <article v-for="tool in toolCards" :key="tool.id" class="tool-index-item">
        <div class="tool-index-head">
          <span class="tool-index-number">{{ tool.index }}</span>
          <span class="tool-index-label">{{ tool.label }}</span>
        </div>
        <h2>{{ tool.title }}</h2>
        <p>{{ tool.description }}</p>
        <div class="tool-index-tags">
          <span v-for="tag in tool.tags" :key="tag">{{ tag }}</span>
        </div>
        <a class="tool-index-link" :href="`#${tool.id}`">查看界面 <span aria-hidden="true">↓</span></a>
      </article>
    </section>

    <section id="assistant" class="tool-showcase shell">
      <header class="tool-section-head">
        <div>
          <p class="eyebrow"><span class="dot" aria-hidden="true"></span> 01 / COCOS MCP ASSISTANT</p>
          <h2>一个面板，接住项目与 MCP 的琐碎操作。</h2>
          <p>
            面向 Cocos Creator 开发者的桌面助手：先发现已打开的项目，再将安装、健康检查、结构工具和操作日志串成同一条工作流。
          </p>
        </div>
        <span class="tool-platform">WINDOWS · .NET 8</span>
      </header>

      <div class="tool-showcase-grid">
        <figure class="tool-screen tool-screen--assistant">
          <img :src="mcpAssistantImage" alt="Cocos MCP 助手桌面界面，包含项目扫描、MCP 状态、扩展安装和操作日志" />
          <span class="tool-callout tool-callout--right tool-callout--assistant-projects">已打开项目</span>
          <span class="tool-callout tool-callout--left tool-callout--assistant-status">MCP 状态与诊断</span>
          <span class="tool-callout tool-callout--right tool-callout--assistant-actions">安装、测试与日志</span>
          <figcaption>截图中的 Rabbit 项目已被识别；右侧汇总扩展、端口、监听与健康状态。</figcaption>
        </figure>

        <div class="tool-feature-list">
          <article v-for="([title, detail], index) in assistantFeatures" :key="title" class="tool-feature-row">
            <span>0{{ index + 1 }}</span>
            <div>
              <h3>{{ title }}</h3>
              <p>{{ detail }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="sandbox" class="tool-showcase tool-showcase--tint">
      <div class="shell">
        <header class="tool-section-head">
          <div>
            <p class="eyebrow"><span class="dot" aria-hidden="true"></span> 02 / PLAYABLE AD SANDBOX</p>
            <h2>把试玩包放进真实投放环境里检查。</h2>
            <p>
              本地沙盒会托管试玩资源，在一个可切换渠道和设备的操作台中还原广告落地后的关键条件。
            </p>
          </div>
          <span class="tool-platform">LOCAL PREVIEW</span>
        </header>

        <div class="tool-showcase-grid tool-showcase-grid--reverse">
          <div class="tool-feature-list">
            <article v-for="([title, detail], index) in sandboxFeatures" :key="title" class="tool-feature-row">
              <span>0{{ index + 1 }}</span>
              <div>
                <h3>{{ title }}</h3>
                <p>{{ detail }}</p>
              </div>
            </article>
          </div>

          <figure class="tool-screen tool-screen--sandbox">
            <img :src="sandboxImage" alt="试玩广告沙盒，左侧选择渠道和设备，中间显示手机试玩画面，右侧显示事件操作台" />
            <span class="tool-callout tool-callout--right tool-callout--sandbox-config">渠道与设备</span>
            <span class="tool-callout tool-callout--left tool-callout--sandbox-preview">试玩画面</span>
            <span class="tool-callout tool-callout--left tool-callout--sandbox-events">事件操作台</span>
            <figcaption>左侧设定投放环境，中间预览游戏画面，右侧观察日志并触发广告渠道事件。</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="tool-process shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> WHY I BUILT IT</p>
        <h2>把开发时反复切换的窗口，收敛成可复用的流程。</h2>
      </header>
      <div class="tool-process-grid">
        <article>
          <span>01</span>
          <h3>发现项目</h3>
          <p>从正在运行的 Cocos Creator 进程里找到项目，而不是手动翻路径。</p>
        </article>
        <article>
          <span>02</span>
          <h3>连接与整理</h3>
          <p>安装扩展、检查 MCP、导出场景结构，让编辑器里的信息可被后续工具使用。</p>
        </article>
        <article>
          <span>03</span>
          <h3>带环境试玩</h3>
          <p>用设备、安全区、渠道事件和操作日志验证试玩广告，在交付前尽早发现问题。</p>
        </article>
      </div>
    </section>

    <section class="tools-contact shell">
      <div class="tools-contact-inner">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> INDEPENDENT DEVELOPMENT</p>
        <h2>工具本身，也是我把开发经验<br />变成可复用能力的一次实践。</h2>
        <a class="btn btn-primary" href="mailto:2926044894@qq.com">交流工具与 Cocos 开发 ↗</a>
      </div>
    </section>
  </main>
</template>
