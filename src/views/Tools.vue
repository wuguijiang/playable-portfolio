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
import mcpInstall01 from '../assets/tools/mcp-install-01-extensions.jpg'
import mcpInstall02 from '../assets/tools/mcp-install-02-menu.png'
import mcpInstall03 from '../assets/tools/mcp-install-03-manager.png'
import mcpInstall04 from '../assets/tools/mcp-install-04-open-console.png'
import mcpInstall05 from '../assets/tools/mcp-install-05-running.png'
import mcpConfig01 from '../assets/tools/mcp-config-01-copy-url.jpg'
import mcpConfig02 from '../assets/tools/mcp-config-02-settings.jpg'
import mcpConfig03 from '../assets/tools/mcp-config-03-plugins.jpg'
import mcpConfig04 from '../assets/tools/mcp-config-04-add-mcp.jpg'
import mcpConfig05 from '../assets/tools/mcp-config-05-form.jpg'
import mcpConfig06 from '../assets/tools/mcp-config-06-waiting.jpg'
import mcpConfig07 from '../assets/tools/mcp-config-07-test.png'
import mcpConfig08 from '../assets/tools/mcp-config-08-connected.jpg'
import zhilingqiuLogoImage from '../assets/tools/zhilingqiu-logo.png'
import zhilingqiuManagerImage from '../assets/tools/zhilingqiu-manager.png'
import zhilingqiuBallImage from '../assets/tools/zhilingqiu-ball.png'
import assistantHome from '../assets/tools/assistant-01-home.png'
import assistantExt01 from '../assets/tools/assistant-02-extinstall-1.png'
import assistantExt02 from '../assets/tools/assistant-03-extinstall-2.png'
import assistantExtFolder from '../assets/tools/assistant-04-extfolder.png'
import assistantExtsThree from '../assets/tools/assistant-05-exts-three.png'
import assistantEmpty01 from '../assets/tools/assistant-10-empty-1.png'
import assistantEmpty02 from '../assets/tools/assistant-11-empty-2.png'
import assistantFolderBtn from '../assets/tools/assistant-12-create-folder-btn.png'
import assistantFolderResult from '../assets/tools/assistant-13-folder-result.png'
import assistantFolderTree from '../assets/tools/assistant-14-folder-tree.png'
import assistantSceneDefault from '../assets/tools/assistant-15-scene-default.png'
import assistantSceneBtn from '../assets/tools/assistant-16-create-scene-btn.png'
import assistantSceneResult from '../assets/tools/assistant-17-scene-create-result.png'
import assistantSceneHierarchy from '../assets/tools/assistant-18-scene-hierarchy.png'
import assistantSandboxEntry from '../assets/tools/assistant-19-sandbox-entry.png'
import assistantSandboxPreview from '../assets/tools/assistant-20-sandbox-preview.png'
import assistantImgTabs from '../assets/tools/assistant-21-img-tabs.png'
import assistantCompress from '../assets/tools/assistant-22-compress.png'
import assistantResize from '../assets/tools/assistant-23-resize.png'
import assistantEdit from '../assets/tools/assistant-24-edit.png'
import assistantMerge from '../assets/tools/assistant-25-merge.png'
import assistantFeedbackUI from '../assets/tools/assistant-26-feedback-ui.png'

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
    title: '回读结果 再给 AI 反馈',
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
    title: '先保护 再切场景',
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
    tags: ['TypeScript', 'Streamable HTTP', '127.0.0.1:3100'],
    image: connectedImage,
    alt: 'Cocos MCP 控制台显示服务运行中、Codex 已连接和最近工具调用',
    caption: '服务状态、握手时间、最近调用与错误都留在控制台里。',
    theme: 'mcp',
    projectMeta: {
      name: 'Cocos MCP（cocos-mcp-shi）',
      minVersion: 'Cocos Creator 3.8.6 及以上',
      stack: 'TypeScript · Vue 3 · Model Context Protocol SDK · Streamable HTTP',
    },
    background: [
      { label: '背景', text: '在使用 Codex 等 AI 编程工具开发 Cocos Creator 项目时，单纯修改脚本文件无法覆盖场景节点、组件、资源、预制体和按钮事件等编辑器内操作。本工具通过 MCP 协议将 Codex 与 Cocos Creator 编辑器连接，使 AI 能够在明确边界内读取和修改项目。' },
      { label: '解决的问题', text: '减少人工在编辑器中重复创建节点、挂载组件、配置属性和管理资源的工作，同时解决 AI 写入操作难以确认结果、超时后可能重复执行、节点名称存在歧义等可靠性问题。' },
      { label: '适用人群', text: 'Cocos Creator 游戏开发者、独立开发者、工具链开发者，以及希望构建 AI 辅助游戏开发流程的团队。' },
      { label: '应用场景', text: '场景搭建、节点和组件配置、UI 按钮事件绑定、资源与预制体管理、脚本挂载、项目日志诊断，以及批量或可重复的编辑器操作。' },
    ],
    installImgs: [
      { src: mcpInstall01, cap: 'Step 01 · 把重命名后的 cocos-mcp-shi 放入项目 extensions 目录' },
      { src: mcpInstall02, cap: 'Step 02 · 打开 扩展 > 扩展管理器' },
      { src: mcpInstall03, cap: 'Step 03 · 刷新已安装扩展并启用 cocos-mcp-shi' },
      { src: mcpInstall04, cap: 'Step 04 · 从扩展菜单打开 Cocos MCP 控制台' },
      { src: mcpInstall05, cap: 'Step 05 · 确认本地服务运行，等待 Codex 客户端连接' },
    ],
    installSteps: [
      '解压压缩包后将文件夹重命名为 cocos-mcp-shi，放入项目根目录/extensions/cocos-mcp-shi/（不要多嵌套同名文件夹）。',
      '在 extensions/cocos-mcp-shi/ 目录执行 npm install 与 npm run build，完成依赖安装与扩展编译。',
      '打开 Cocos Creator 扩展 > 扩展管理器 > 已安装扩展，刷新后启用 cocos-mcp-shi。',
      '选择 扩展 > Cocos MCP > Open MCP Console，确认控制台显示服务“运行中”。',
    ],
    configImgs: [
      { src: mcpConfig01, cap: '① 在 Cocos MCP 控制台复制 MCP 服务地址' },
      { src: mcpConfig02, cap: '② 打开 Codex 设置' },
      { src: mcpConfig03, cap: '③ 进入插件设置' },
      { src: mcpConfig04, cap: '④ 切换到 MCP 并选择添加 MCP 服务器' },
      { src: mcpConfig05, cap: '⑤ 填写名称，选择流式 HTTP，粘贴服务地址后保存' },
      { src: mcpConfig06, cap: '⑥ 服务运行但尚未连接时显示等待客户端' },
      { src: mcpConfig07, cap: '⑦ 在 Codex 中询问连接状态，确认会话、工具与调用均成功' },
      { src: mcpConfig08, cap: '⑧ 连接成功后控制台显示 Codex 已连接' },
    ],
    codexConfigToml: '[mcp_servers.cocos_mcp_shi]\nurl = "http://127.0.0.1:3100/mcp"',
    toolsSpec: [
      { name: 'cocos_scene', desc: '检查当前场景与节点树、列出场景资源、安全打开场景、保存活动场景。当前场景有未保存修改时会阻止切换，避免数据丢失。' },
      { name: 'cocos_node', desc: '搜索、检查、创建、更新、移动和删除节点；支持修改名称、启用状态、位置、旋转与缩放，并验证修改是否持久化。' },
      { name: 'cocos_component', desc: '列出、确保存在、添加、移除和配置组件；支持基础类型、枚举、节点引用、资源引用及数组属性。目标状态已经满足时返回 changed=false。' },
      { name: 'cocos_button_event', desc: '为 cc.Button 添加或清空点击事件，支持目标节点、目标组件、处理函数和自定义数据；不会重复添加完全相同的事件。' },
      { name: 'cocos_asset', desc: '浏览和检查资源、解析 UUID 与 URL，并创建文件夹、重新导入、复制、移动、重命名、删除或导入资源；TS 重导入可等待并验证编译结果。' },
      { name: 'cocos_prefab', desc: '列出和检查预制体，从场景节点创建预制体，以及在指定父节点下实例化预制体。' },
      { name: 'cocos_script', desc: '将已被 Cocos 导入的 TypeScript / JavaScript 组件脚本挂载到节点，或移除脚本组件；重复挂载识别为无需修改。' },
      { name: 'cocos_diagnostics', desc: '读取项目元数据、构建器状态、项目日志和编辑器日志；支持按时间、关键词和游标增量读取，快速定位近期错误。' },
      { name: 'cocos_undo_recording', desc: '开始、提交或取消真实的 Cocos 场景撤销记录，便于把多步编辑组织为可撤销操作。' },
      { name: 'cocos_operation_status', desc: '查询写入操作的持久化状态，可等待最多 10 秒获取最终结果。写入超时后应先查询状态，再决定是否重试。' },
    ],
    commonParams: [
      { name: 'action', meaning: '指定工具要执行的动作，例如 inspect、create、set、save 或 delete。' },
      { name: 'operationId', meaning: '写入操作必需的不超过 128 字符的唯一标识，用于幂等控制、超时恢复和状态查询。' },
      { name: 'target', meaning: '语义化节点目标，可使用 uuid、path、name + under 或 selected 四种模式之一。' },
      { name: 'url / targetUrl', meaning: 'Cocos 资源地址。项目资源通常使用 db://assets/ 开头，场景与预制体需使用对应扩展名。' },
      { name: 'waitMs', meaning: '查询操作状态时可选的等待时间，范围为 0 至 10000 毫秒。' },
    ],
    typicalFlow: [
      '先使用 cocos_scene 检查当前场景，确认场景名称、保存状态和节点层级。',
      '使用 cocos_node search 或语义化 target 精确定位目标节点。',
      '执行节点、组件、资源、预制体或事件写入，并为每个独立写入生成唯一 operationId。',
      '检查返回的 verification 信息，确认目标存在、属性已持久化或资源数据库已刷新。',
      '若请求超时，使用原 operationId 调用 cocos_operation_status，确认状态后再决定是否重试。',
      '完成场景修改后调用 cocos_scene save 保存场景。',
    ],
    targetExamples: `{ "target": { "uuid": "node-uuid" } }
{ "target": { "path": "/Canvas/StartButton" } }
{ "target": { "name": "StartButton", "under": "/Canvas" } }
{ "target": { "selected": true } }`,
    consoleReliability: [
      '可停靠的 Vue 控制台支持启动和停止服务、配置端口、自动启动和编辑器请求超时。',
      '控制台可复制或写入 Codex 项目配置，展示真实客户端握手、调用与错误。',
      '支持一键协议自检与项目自检，并可在端口冲突时选择备用端口。',
      '可以启用或禁用单个 MCP 工具；cocos_operation_status 始终保持启用。',
      '操作记录保存在项目临时目录中，默认保留七天，最多保存 1000 条；服务重启后仍可查询已完成和失败的结果。',
    ],
    summary: {
      tech: [
        '语义化节点定位降低了 UUID 依赖。',
        '所有写入执行后验证，减少静默失败。',
        'operationId 解决重复执行和超时恢复问题。',
        '服务仅监听本机地址，降低暴露风险。',
      ],
      next: [
        '补充各工具的实际调用截图。',
        '增加完整场景搭建案例和调用结果。',
        '持续扩展可验证的 Cocos 编辑器能力。',
        '补充常见错误、排查步骤和性能数据。',
      ],
    },
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
    homeOverview: {
      image: assistantHome,
      caption: 'Cocos MCP 助手 v3.1 界面：左侧项目列表 + 端口/ID状态、右侧结构工具三步法（检查现状 → 一键创建 → 对比验证），底部一键分析 / 批量诊断。',
    },
    scanProject: {
      impl: '工具通过 Windows 进程信息扫描正在运行的 CocosCreator.exe 和 CocosDashboard.exe，从启动参数中读取项目路径；随后检查项目是否包含 assets 目录，以及 project.json 或 settings 目录。',
      steps: [
        '在 Cocos Creator 中打开目标项目。',
        '启动「Cocos MCP 助手」。',
        '点击底部的「刷新项目」。',
        '在左侧项目列表中选择目标项目。',
        '在右侧「概览」查看扩展状态、MCP 端口、监听状态和健康状态。',
      ],
    },
    extInstall: {
      impl: '工具会将内置的 cocos-mcp-server、pa-framework-plugin、super-html 三个扩展安装到项目的 extensions 目录。安装时先复制到临时目录并校验入口文件和依赖，全部成功后再切换；失败时会回滚，避免破坏原有扩展。',
      installSteps: [
        '在左侧选择项目。',
        '打开「扩展安装」页。',
        '点击「安装三个扩展」。',
      ],
      gallery: [
        { src: assistantExt01, cap: '① 选中「扩展安装」导航 → 点击「安装三个扩展」（MCP服务 + PA框架 + HTML5构建插件）' },
        { src: assistantExt02, cap: '② 安装完成提示：三个扩展已安装到指定路径，需在 Cocos 引擎内手动启动服务器' },
      ],
      postInstall: [
        { src: assistantExtFolder, cap: '③ 项目根目录下出现 extensions 文件夹' },
        { src: assistantExtsThree, cap: '④ extensions 文件夹内包含三个插件：cocos-mcp-server / pa-framework-plugin / super-html' },
      ],
    },
    folderCreate: {
      impl: '仅当 assets 目录为空时，工具会创建标准目录：GameRes、resources、scene、scripts；其中 GameRes 下还会创建 anim、audio、effect、font、materials、models、spine 等分类目录。若已有资源，工具不会改动。',
      steps: [
        '先使用「检测空项目」确认 assets 为「空」。',
        '点击「创建资源文件夹」。',
        '在结果窗口确认已创建的目录。',
        '回到 Cocos Creator 资源管理器复查目录树（GameRes / resources / scene / scripts 等）。',
        '点击「输出当前项目结构」复查结果。',
      ],
      gallery: [
        { src: assistantEmpty01, cap: '① 第1步·检查现状 → 点击「检测空项目」' },
        { src: assistantEmpty02, cap: '② 分层检测结果：场景与资源相互独立' },
        { src: assistantFolderBtn, cap: '③ 第2步·一键创建 → 点击「创建资源文件夹」' },
        { src: assistantFolderResult, cap: '④ 创建结果：已创建 12 个标准资源目录' },
        { src: assistantFolderTree, cap: '⑤ Cocos Creator 中 assets/ 下资源文件夹层级' },
      ],
      note: '自定义资源文件夹将在 v1.1 版本上线。',
    },
    sceneTemplate: {
      impl: '工具通过 MCP 在空场景中创建标准节点层级，并为 UI 节点添加 cc.UITransform。默认结构包括 UI_3D、UI_2D、UIBegin、UIEnd、UIGame、AudioManager、GameManager 等节点。',
      steps: [
        '确保 MCP 服务已连接。',
        '确认当前场景为空或仅包含引擎默认节点（Canvas + Camera）。',
        '在「结构工具」页点击「创建场景模板」。',
        '回到 Cocos Creator 的层级管理器，确认 Canvas/UI_3D、UI_2D/UIBegin/UIEnd/UIGame 以及 AudioManager、GameManager 等节点已生成。',
        '点击「输出当前场景结构」进行复查。',
      ],
      gallery: [
        { src: assistantSceneDefault, cap: '① 场景示例：scene-2d 仅含 Canvas + Camera（引擎默认）' },
        { src: assistantSceneBtn, cap: '② 结构工具页点击「创建场景模板」' },
        { src: assistantSceneResult, cap: '③ 创建结果：10 个规范节点 + MCP 预检通过' },
        { src: assistantSceneHierarchy, cap: '④ Cocos 层级管理器中 UI_3D / UI_2D / UIBegin / UIEnd / UIGame / AudioManager / GameManager 已生成' },
      ],
    },
    sandbox: {
      impl: '试玩广告沙盒页面作为静态网页资源内嵌在桌面程序中。点击功能后，程序自动寻找一个可用的本机端口，通过 HttpListener 启动本地 HTTP 服务，并在默认浏览器中打开沙盒页面。页面资源（HTML/JS/CSS/图片）由程序直接提供；服务仅允许读取内置资源，并拦截非法路径访问。',
      steps: '点击底部「广告沙盒」，浏览器会自动打开预览页面：左侧渠道/机型设置（横竖屏切换、拖入 html 文件入口）、中间手机预览、右侧控制台面板。',
      gallery: [
        { src: assistantSandboxEntry, cap: '① 首页底部 → 点击「广告沙盒」按钮' },
        { src: assistantSandboxPreview, cap: '② 沙盒预览页：设置面板 + 手机预览 + 控制台' },
      ],
    },
    imageEditor: {
      impl: '图片压缩工具同样以内嵌网页方式发布。桌面程序启动本地 HTTP 服务并打开浏览器页面，页面在浏览器侧完成图片处理。工具内置 WebAssembly 图像编码资源，可使用 JPEG / PNG / WebP 编码；服务额外配置了跨域隔离响应头，使网页能够正常使用需要共享内存能力的 WebAssembly 图像处理模块。',
      tabs: ['压缩图片', '像素压缩', '调整图片大小', '编辑图片', '合并图片', '智能抠图'],
      features: [
        {
          name: '批量压缩图片',
          impl: '支持批量导入 JPG / PNG / WebP，提供三档压缩强度（轻度保画质 / 推荐平衡 / 极限压体积）。压缩后保持原始格式和像素尺寸；PNG / WebP 保留透明通道。后台 Worker 并发处理，根据 CPU 核心数自动调节并发数量。',
          steps: ['进入「压缩图片」页面。', '拖入图片或点击「选择图片」批量添加。', '选择轻度 / 推荐 / 极限。', '设置命名方式和输出位置。', '点击「开始压缩」。', '结果区单张或打包下载。'],
          image: assistantCompress,
        },
        {
          name: '调整图片大小',
          impl: '支持按像素或按比例批量调整宽高，可锁定原始比例（填宽自动算高）。支持超过 200% 的放大比例，并保持 JPG / PNG / WebP 的原格式输出。',
          settings: ['调整方式：按像素 / 按比例', '宽度和高度', '缩放百分比', '是否锁定原始比例', '导出文件名是否追加尺寸信息', '自动下载或输出到指定文件夹'],
          image: assistantResize,
        },
        {
          name: '图片编辑',
          impl: '浏览器本地图片编辑画布，对单张图片进行裁切、旋转、翻转、缩放、位置调整、色彩调整、滤镜和水印处理，再导出编辑后的图片。',
          settings: ['裁切比例与裁切位置', '旋转 90° 及水平/垂直翻转', '缩放与位移', '亮度 / 对比度 / 饱和度 / 模糊 / 圆角', '滤镜：原图 / 暖色 / 黑白 / 柔和等', '文字与水印', 'Logo 水印', '背景：透明或纯色', '导出尺寸和 JPG / PNG / WebP 格式'],
          image: assistantEdit,
        },
        {
          name: '合并图片',
          impl: '把多张图片按预设布局排版到同一张画布中，生成拼图或广告素材组合图。可设置画布比例、图片适配方式、间距、边距和背景。',
          settings: ['拼图布局：并排 / 上下 / 三连 / 四连 / 四宫格 / 六宫格 / 七拼 / 八宫格 / 九宫格', '画布比例：横版 / 竖版 / 自定义', '图片适配：完整显示 / 填满画布', '排版参数：顺序 / 间距 / 外边距', '背景：透明 / 白 / 黑 / 浅灰 / 蓝 / 自定义色', '统一导出命名和下载方式'],
          image: assistantMerge,
        },
        {
          name: '智能抠图',
          impl: '此功能效果不佳，建议使用 koukoutu.com。',
        },
      ],
      tabsImage: assistantImgTabs,
    },
    diagnostics: {
      impl: '工具会读取当前所选 Cocos 项目的扩展目录、MCP 配置和端口状态，并自动执行 8 项检查：项目扩展目录、MCP 扩展目录、package.json 解析、关键文件 dist/main.js、mcp-server.json 配置、端口监听、/health 连通性和 /mcp 连通性。诊断结果以通过 / 缺失 / 监听中 / 失败状态集中展示，便于快速定位问题。首页的「连接测试」可单独验证 /health 与 /mcp，适合在安装扩展或启动服务器后立即复查。',
      steps: [
        '在首页选择需要检查的 Cocos 项目。',
        '点击底部「一键诊断」，等待 8 项检查完成。',
        '查看诊断报告中的状态和详细路径，按失败项修复扩展、配置或端口问题。',
        '在 Cocos Creator 的 MCP 面板启动服务器。',
        '返回首页点击「连接测试」，确认 /health 与 /mcp 均可正常访问。',
      ],
    },
    aiRules: {
      impl: 'AI 规范用于保存团队常用的自定义规则，例如代码风格、资源命名、修改边界和验收要求。规则以多条结构化内容保存在当前电脑，并在 AI 反馈转译时自动追加到提示词中。自定义规则与测试反馈助手的固定规则同时生效，但不能覆盖只读查询、安全限制和禁止编造等基础要求。旧版本保存的单段规范也会自动兼容并保留为第一条规则。',
      steps: [
        '点击首页底部「AI规范」。',
        '新增或编辑团队常用规则，每条规则只描述一个明确要求。',
        '保存后关闭窗口，规则会保留在本机。',
        '打开「反馈转译」并发送测试反馈，已保存的规范会自动参与任务整理。',
        '规范发生变化时重新进入「AI规范」修改并保存即可。',
      ],
    },
    aiFeedback: {
      impl: 'AI 反馈转译通过 DeepSeek 多轮对话服务，把测试人员的自然语言反馈整理成 Codex 可以直接执行的标准修改任务。任务默认包含：任务标题、测试反馈、已确认上下文、修改要求、不应修改范围、待 Codex 核查和验收标准，并控制内容精简、聚焦当前问题。选择已打开的 Cocos 项目后，AI 可按需要使用严格只读的项目查询补齐场景、节点、组件、资源、预制体、脚本、配置和构建输出等上下文。窗口支持添加多张截图、从剪贴板粘贴截图、多轮补充、新建对话和复制最后回复。勾选「作为测试反馈发送」时输出 Codex 修改任务；取消勾选切换为普通对话。',
      steps: [
        '点击首页底部「反馈转译」，打开 DeepSeek 测试反馈助手。',
        '在顶部选择当前 Cocos 项目；项目列表变化时点击「刷新」。',
        '首次使用时进入「AI 设置」，填写 API Key，并确认接口地址、模型、图片输入和项目查询设置。',
        '在输入框描述测试问题；需要说明画面时点击「添加截图」，或使用 Ctrl+V 粘贴截图。',
        '保持勾选「作为测试反馈发送」，点击「发送」或回车，等待 AI 读取必要上下文并整理任务。',
        '检查生成的修改要求、核查项和验收标准；需要补充时继续对话。',
        '点击「复制最后回复」，把标准任务交给 Codex 执行；处理其他问题时点击「新对话」。',
      ],
      image: assistantFeedbackUI,
    },
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
  {
    id: 'zhilingqiu',
    index: '05',
    navTitle: '指令球小扣',
    eyebrow: 'PROMPT CLIPBOARD / FLOATING BALL',
    title: '高频提示词',
    accent: '悬浮球直达',
    description: '面向 Cocos + Codex + MCP 开发流程的轻量提示词剪贴板工具。以透明置顶悬浮球常驻桌面，开发者无需切换窗口即可快速调用常用提示词，单击即写入系统剪贴板，按 Ctrl+V 粘贴到 Codex 对话框中使用。',
    tags: ['悬浮球剪贴板', '提示词管理', 'Codex 辅助', 'MCP 工作流'],
    image: zhilingqiuLogoImage,
    alt: '指令球小扣 Logo 与工具首页展示',
    caption: '透明置顶悬浮球，一键复制高频提示词直达 Codex。',
    theme: 'zhilingqiu',
    detailTitle: '指令球小扣',
    details: [
      ['透明置顶悬浮球', '以无边框透明窗口常驻桌面最上层，支持自由拖动并自动记忆位置，双击快速打开管理窗口。'],
      ['快捷提示词面板', '鼠标移入悬浮球即自动展开面板，根据悬浮球位置智能选择展开方向，单击提示词即写入系统剪贴板。'],
      ['提示词管理窗口', '三栏布局：左侧分组导航 + 中间提示词列表 + 右侧编辑面板，支持搜索、新建、编辑、分组拖拽排序与使用统计。'],
      ['数据导入导出', '支持导出全部提示词为 JSON 备份与团队共享，支持从 JSON 导入替换整个资料库，数据全部本地持久化。'],
    ],
    managerImage: zhilingqiuManagerImage,
    ballImage: zhilingqiuBallImage,
    coreFeatures: [
      {
        title: '透明置顶悬浮球',
        items: [
          '悬浮球以透明无边框窗口形式常驻桌面最上层，不遮挡编辑器内容',
          '支持自由拖动到屏幕任意位置，松手后自动记住位置并在下次启动时恢复',
          '双击悬浮球可快速打开提示词管理窗口',
          '主窗口最小化或关闭后，悬浮球自动恢复显示',
        ],
      },
      {
        title: '快捷提示词面板',
        items: [
          '鼠标移入悬浮球即自动展开提示词面板，无需点击',
          '面板根据悬浮球位置智能选择展开方向（左、右、上、下），避免超出屏幕边界',
          '面板默认显示 6 条常用提示词，超出部分可滚动查看',
          '单击任意提示词即写入系统剪贴板，面板底部显示"已复制，可回到 Codex 按 Ctrl+V 粘贴"提示',
          '鼠标移开后面板自动收起，延迟设计避免误触关闭',
        ],
      },
      {
        title: '提示词管理窗口',
        items: [
          '三栏布局：左侧分组导航 + 中间提示词列表 + 右侧编辑面板',
          '支持提示词的新建、编辑、删除、复制操作',
          '提示词分组管理：支持按分组筛选、新建自定义分组',
          '左侧分组支持拖拽排序，顺序本地持久化保存',
          '提示词搜索：支持按标题、内容、分组关键词搜索（快捷键 Ctrl+K 聚焦搜索框）',
          '收藏功能：标记为常用的提示词会显示在悬浮球快捷面板中',
          '使用次数统计：记录每条提示词的使用次数和最后使用时间',
          '排序号管理：修改排序号后自动重新编号，支持精确控制提示词顺序',
        ],
      },
      {
        title: '数据导入导出',
        items: [
          '支持将全部提示词导出为 JSON 文件，方便备份和团队共享',
          '支持从 JSON 文件导入提示词，支持替换整个资料库',
          '所有数据本地持久化存储，不需要账号或服务端',
        ],
      },
    ],
    builtinPrompts: [
      { order: '01', title: '测试 MCP', group: 'MCP', favorite: true },
      { order: '02', title: '编辑器优先规范', group: 'Cocos', favorite: true },
      { order: '03', title: '脚本与资源引用规范', group: 'Cocos', favorite: true },
      { order: '04', title: '项目整理执行规范', group: '项目整理', favorite: true },
    ],
    techStack: [
      { component: '桌面框架', tech: 'Electron', desc: '跨平台桌面应用基础，提供多窗口、系统托盘、剪贴板 API' },
      { component: '前端框架', tech: 'Vue 3 + TypeScript', desc: '响应式 UI，类型安全' },
      { component: '构建工具', tech: 'Vite', desc: '快速开发服务器和生产构建' },
      { component: '图标库', tech: 'Lucide', desc: '轻量 SVG 图标' },
      { component: '打包工具', tech: 'electron-builder', desc: 'Windows NSIS 安装程序生成' },
    ],
    windowArch: [
      { window: '主窗口', duty: '提示词管理界面', feature: '优先启动，关闭/最小化后自动恢复悬浮球' },
      { window: '悬浮球窗口', duty: '透明置顶小球', feature: '无边框透明，始终置顶，不显示在任务栏' },
      { window: '面板窗口', duty: '快捷提示词列表', feature: '按需展开，智能定位，延迟加载' },
    ],
    efficiency: {
      cocos: [
        { title: '编辑器优先', desc: '单击"编辑器优先规范"提示词，Codex 会优先通过 MCP 在编辑器内完成节点创建、组件挂载和属性配置，避免运行时动态创建' },
        { title: '引用规范', desc: '使用"脚本与资源引用规范"提示词，强制通过 @property 绑定引用，杜绝节点名称查找和硬编码资源路径' },
        { title: '安全整理', desc: '使用"项目整理执行规范"提示词，分阶段整理项目并逐项等待人工确认，不破坏现有玩法' },
        { title: '连接自检', desc: '使用"测试 MCP"提示词，快速验证 MCP 连接与会话状态，排查端口占用和会话失效问题' },
      ],
      codex: [
        { title: '无需切换窗口', desc: '悬浮球常驻桌面，在 Cocos 编辑器和 Codex 对话框之间无需切换窗口即可调用提示词' },
        { title: '一键复制粘贴', desc: '单击提示词即写入剪贴板，在 Codex 对话框按 Ctrl+V 即可粘贴，比手动输入节省数倍时间' },
        { title: '提示词复用', desc: '高频指令（如"测试 MCP"、"编辑器优先规范"）沉淀为固定条目，避免每次手动输入' },
        { title: '使用统计', desc: '通过使用次数追踪高频指令，优化提示词管理策略' },
      ],
    },
    faq: [
      { question: '悬浮球不显示？', answers: ['主窗口可能正在显示：双击系统托盘图标或关闭主窗口即可恢复悬浮球', '首次启动延迟：主窗口启动后约 900ms 才预热悬浮球窗口，请稍候', '位置超出屏幕：悬浮球位置会自动校正到屏幕可视范围内'] },
      { question: '快捷面板为空？', answers: ['快捷面板只显示标记为"常用"的提示词。在管理窗口中，编辑提示词时勾选"显示在悬浮球"选项即可将其加入快捷面板。'] },
      { question: '如何备份提示词？', answers: ['在管理窗口左下角点击"导出"按钮，可将全部提示词导出为 JSON 文件。需要恢复时点击"导入"按钮选择 JSON 文件即可。'] },
      { question: '数据存储在哪里？', answers: ['所有数据存储在本地，不需要账号或服务端。提示词数据存储在应用的 localStorage 中，窗口位置存储在 userData 目录的 window-state.json 文件中。卸载应用时如需保留数据，请先导出备份。'] },
    ],
    usageSteps: [
      { title: '悬浮球操作', items: [['鼠标移入', '自动展开快捷提示词面板'], ['单击提示词', '将提示词内容写入系统剪贴板'], ['双击悬浮球', '打开提示词管理窗口'], ['拖动悬浮球', '移动到屏幕任意位置，松手后自动记忆']] },
      { title: '快捷面板使用流程', items: [['Step 1', '将鼠标移到悬浮球上，面板自动展开'], ['Step 2', '面板中显示已收藏的常用提示词，按排序号排列'], ['Step 3', '点击需要的提示词，面板底部会显示"已复制"确认'], ['Step 4', '切换到 Codex 对话框，按 Ctrl+V 粘贴提示词'], ['Step 5', '将鼠标移开悬浮球和面板，面板自动收起']] },
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

function preloadShowcaseImages() {
  showcaseTools.forEach((tool) => {
    const img = new Image()
    img.src = tool.image
  })
}

function scrollToDetails() {
  const target = document.getElementById('tool-details')
  if (!target) return

  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY - 80,
    behavior: 'smooth',
  })
}

onMounted(() => {
  preloadShowcaseImages()
  startCarousel()
})
onBeforeUnmount(() => {
  stopCarousel()
})
</script>

<template>
  <main class="page tools-page">
    <section class="mcp-hero" :class="`mcp-hero--${activeTool.theme}`">
      <div class="mcp-hero-inner shell">
        <div class="mcp-hero-copy">
          <p class="eyebrow"><span class="dot" aria-hidden="true"></span> {{ activeTool.eyebrow }}</p>
          <h1><span>{{ activeTool.title }}</span><em>{{ activeTool.accent }}</em></h1>
          <p class="mcp-hero-text">{{ activeTool.description }}</p>
          <div class="mcp-hero-actions">
            <button class="btn btn-primary" type="button" @click="scrollToDetails">查看工具详情</button>
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
        <h2>先看见连接<br />再让 AI 接管引擎</h2>
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
          <h3>区分：端口开着 与 AI 真正在用</h3>
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
            <h2>一次 AI 调用 怎样到达 Cocos</h2>
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
        <h2>地址 健康检查 配置 都在项目里完成</h2>
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
            <h2>把 帮我改一下 变成<br />能定位 能执行 能反馈的操作</h2>
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
            <h2>把工具范围放到台面上</h2>
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
        <h2>我为 AI 接管编辑器 补上的约束</h2>
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

    <section class="mcp-bg shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> PROJECT BRIEF</p>
        <h2>可靠的 Cocos Creator 自动化工作流</h2>
        <p class="section-note">
          项目名称 {{ activeTool.projectMeta.name }} · 适配 {{ activeTool.projectMeta.minVersion }} · 技术栈 {{ activeTool.projectMeta.stack }}
        </p>
      </header>
      <div class="mcp-bg-grid">
        <article v-for="b in activeTool.background" :key="b.label">
          <span>{{ b.label }}</span>
          <p>{{ b.text }}</p>
        </article>
      </div>
    </section>

    <section class="mcp-install">
      <div class="shell">
        <header class="mcp-section-heading">
          <div>
            <p class="eyebrow"><span class="dot" aria-hidden="true"></span> INSTALLATION</p>
            <h2>准备工作一：扩展安装与编译</h2>
          </div>
          <p>把扩展文件夹放入项目、安装依赖并启用即可。服务只绑定 127.0.0.1，不会通过 0.0.0.0 暴露编辑器控制面。</p>
        </header>

        <ol class="mcp-install-steps">
          <li v-for="(s, i) in activeTool.installSteps" :key="i">
            <span>No.{{ i + 1 }}</span>
            <p>{{ s }}</p>
          </li>
        </ol>

        <pre class="code-block"><code>npm install
npm run build</code><span>PowerShell / 扩展目录</span></pre>

        <div class="mcp-install-gallery">
          <figure v-for="(img, i) in activeTool.installImgs" :key="i">
            <img :src="img.src" :alt="img.cap" />
            <figcaption>{{ img.cap }}</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="mcp-config shell">
      <header class="section-head section-head--config">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> CODEX SETUP</p>
        <h2>准备工作二：启动并连接 MCP</h2>
        <p class="section-note">
          控制台默认地址 http://127.0.0.1:3100/mcp。点击「写入项目配置」可一键写入 .codex/config.toml；也可按下图在 Codex 中手动添加。
        </p>
      </header>

      <pre class="code-block mcp-code--toml"><code>{{ activeTool.codexConfigToml }}</code><span>.codex/config.toml · 项目级配置</span></pre>

      <div class="mcp-config-steps">
        <figure v-for="(img, i) in activeTool.configImgs" :key="i">
          <span class="mcp-step-no">{{ i + 1 }}</span>
          <img :src="img.src" :alt="img.cap" />
          <figcaption>{{ img.cap }}</figcaption>
        </figure>
      </div>
    </section>

    <section class="mcp-toolspec">
      <div class="shell">
        <header class="mcp-section-heading">
          <div>
            <p class="eyebrow"><span class="dot" aria-hidden="true"></span> TOOL REFERENCE</p>
            <h2>2.2.1 十个聚合工具 覆盖编辑器主要工作面</h2>
          </div>
          <p>读取类直接返回编辑器真实状态；写入类必须携带 operationId，相同 ID+相同参数复用结果，相同 ID+参数冲突则拒绝，避免重复写入。</p>
        </header>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th style="width:200px">工具</th><th>能力说明</th></tr>
            </thead>
            <tbody>
              <tr v-for="t in activeTool.toolsSpec" :key="t.name">
                <td class="table-name">{{ t.name }}</td>
                <td>{{ t.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="mcp-params shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> COMMON PARAMS</p>
        <h2>2.2.2 通用参数说明</h2>
        <p class="section-note">写入操作必须生成唯一 operationId；target 支持四种语义化定位模式，无需强依赖 UUID。</p>
      </header>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th style="width:200px">参数</th><th>含义</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in activeTool.commonParams" :key="p.name">
              <td class="table-name">{{ p.name }}</td>
              <td>{{ p.meaning }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="mcp-flow-2">
      <div class="shell">
        <header class="mcp-section-heading">
          <div>
            <p class="eyebrow"><span class="dot" aria-hidden="true"></span> TYPICAL FLOW</p>
            <h2>2.2.3 典型调用流程 + target 示例</h2>
          </div>
          <p>先检查场景 → 定位节点 → 写入带 operationId → 回读 verification → 超时查 status → 最后保存。六步闭环保证可恢复。</p>
        </header>

        <div class="mcp-flow2-grid">
          <ol class="mcp-flow2-steps">
            <li v-for="(s, i) in activeTool.typicalFlow" :key="i">
              <span>Step {{ String(i + 1).padStart(2, '0') }}</span>
              <p>{{ s }}</p>
            </li>
          </ol>
          <pre class="code-block mcp-code--right"><code>{{ activeTool.targetExamples }}</code><span>target 四种模式</span></pre>
        </div>
      </div>
    </section>

    <section class="mcp-reliability">
      <div class="shell">
        <header class="mcp-section-heading">
          <div>
            <p class="eyebrow"><span class="dot" aria-hidden="true"></span> RELIABILITY</p>
            <h2>2.2.4 控制台与可靠性设计</h2>
          </div>
          <p>控制台不止是启停服务 — 还承担配置写入、握手展示、自检、工具开关和跨重启操作日志留存，把「AI 调用过什么」变成可见的事实。</p>
        </header>

        <ul class="mcp-reli-list">
          <li v-for="(r, i) in activeTool.consoleReliability" :key="i">
            <span>0{{ i + 1 }}</span>
            <p>{{ r }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section class="mcp-summary shell">
      <header class="section-head">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> SUMMARY</p>
        <h2>核心价值：<em>能操作</em> 不等于 <em>可靠</em><br />我们在每次调用里补上边界 验证和恢复</h2>
      </header>

      <div class="mcp-summary-grid">
        <article>
          <h3>技术经验沉淀</h3>
          <ul>
            <li v-for="t in activeTool.summary.tech" :key="t">{{ t }}</li>
          </ul>
        </article>
        <article>
          <h3>后续可完善</h3>
          <ul>
            <li v-for="n in activeTool.summary.next" :key="n">{{ n }}</li>
          </ul>
        </article>
      </div>
    </section>

      <section class="mcp-contact shell">
        <div>
          <p class="eyebrow"><span class="dot" aria-hidden="true"></span> INDEPENDENT DEVELOPMENT</p>
          <h2>从试玩广告开发里的真实摩擦<br />做出一套 AI 能理解的 Cocos 工作流</h2>
        </div>
        <a class="btn btn-primary" href="mailto:2926044894@qq.com">交流 Cocos MCP ↗</a>
      </section>
    </template>

    <section v-else-if="activeTool.id === 'desktop-assistant'" class="tool-detail-preview tool-detail-preview--assistant">
      <div class="shell">
        <header class="section-head section-head--assistant">
          <p class="eyebrow"><span class="dot" aria-hidden="true"></span> {{ activeTool.index }} / {{ activeTool.eyebrow }}</p>
          <h2>{{ activeTool.detailTitle }}：项目 扩展 MCP 收进一张工作台</h2>
          <p class="section-note">
            {{ activeTool.description }}
          </p>
          <div class="assistant-tags"><span v-for="tag in activeTool.tags" :key="tag">{{ tag }}</span></div>
        </header>

        <figure class="assistant-home-screen">
          <img :src="activeTool.homeOverview.image" :alt="activeTool.homeOverview.caption" />
          <figcaption>{{ activeTool.homeOverview.caption }}</figcaption>
        </figure>

        <section class="assistant-feature assistant-feature--scan">
          <header class="assistant-feature-head">
            <span class="assistant-feature-no">功能一</span>
            <h3>扫描并选择已打开的 Cocos 项目</h3>
          </header>
          <div class="assistant-feature-body">
            <article class="assistant-feature-impl">
              <h4>功能实现方式</h4>
              <p>{{ activeTool.scanProject.impl }}</p>
            </article>
            <article class="assistant-feature-steps">
              <h4>扫描项目操作步骤</h4>
              <ol>
                <li v-for="(s, i) in activeTool.scanProject.steps" :key="i"><span>{{ i + 1 }}</span>{{ s }}</li>
              </ol>
            </article>
          </div>
        </section>

        <section class="assistant-feature assistant-feature--ext">
          <header class="assistant-feature-head">
            <span class="assistant-feature-no">功能二</span>
            <h3>一键安装三个扩展</h3>
          </header>
          <div class="assistant-feature-body">
            <article class="assistant-feature-impl">
              <h4>功能实现方式</h4>
              <p>{{ activeTool.extInstall.impl }}</p>
            </article>
            <article class="assistant-feature-steps">
              <h4>一键安装操作步骤</h4>
              <ol>
                <li v-for="(s, i) in activeTool.extInstall.installSteps" :key="i"><span>{{ i + 1 }}</span>{{ s }}</li>
              </ol>
            </article>
          </div>
          <div class="assistant-gallery assistant-gallery--2col">
            <figure v-for="(g, i) in activeTool.extInstall.gallery" :key="i">
              <img :src="g.src" :alt="g.cap" />
              <figcaption>{{ g.cap }}</figcaption>
            </figure>
          </div>
          <p class="assistant-note">安装完成后，项目内会多出 extensions 文件夹，包含三个插件。</p>
          <div class="assistant-gallery assistant-gallery--2col">
            <figure v-for="(g, i) in activeTool.extInstall.postInstall" :key="i">
              <img :src="g.src" :alt="g.cap" />
              <figcaption>{{ g.cap }}</figcaption>
            </figure>
          </div>
        </section>

        <section class="assistant-feature assistant-feature--folder">
          <header class="assistant-feature-head">
            <span class="assistant-feature-no">功能三</span>
            <h3>创建标准资源文件夹</h3>
          </header>
          <div class="assistant-feature-body">
            <article class="assistant-feature-impl">
              <h4>功能实现方式</h4>
              <p>{{ activeTool.folderCreate.impl }}</p>
            </article>
            <article class="assistant-feature-steps">
              <h4>功能操作步骤</h4>
              <ol>
                <li v-for="(s, i) in activeTool.folderCreate.steps" :key="i"><span>{{ i + 1 }}</span>{{ s }}</li>
              </ol>
            </article>
          </div>
          <div class="assistant-gallery assistant-gallery--3col">
            <figure v-for="(g, i) in activeTool.folderCreate.gallery" :key="i">
              <img :src="g.src" :alt="g.cap" />
              <figcaption>{{ g.cap }}</figcaption>
            </figure>
          </div>
          <p class="assistant-note assistant-note--tip">{{ activeTool.folderCreate.note }}</p>
        </section>

        <section class="assistant-feature assistant-feature--scene">
          <header class="assistant-feature-head">
            <span class="assistant-feature-no">功能四</span>
            <h3>创建标准场景模板</h3>
          </header>
          <div class="assistant-feature-body">
            <article class="assistant-feature-impl">
              <h4>功能实现方式</h4>
              <p>{{ activeTool.sceneTemplate.impl }}</p>
            </article>
            <article class="assistant-feature-steps">
              <h4>功能操作步骤</h4>
              <ol>
                <li v-for="(s, i) in activeTool.sceneTemplate.steps" :key="i"><span>{{ i + 1 }}</span>{{ s }}</li>
              </ol>
            </article>
          </div>
          <div class="assistant-gallery assistant-gallery--2col">
            <figure v-for="(g, i) in activeTool.sceneTemplate.gallery" :key="i">
              <img :src="g.src" :alt="g.cap" />
              <figcaption>{{ g.cap }}</figcaption>
            </figure>
          </div>
        </section>

        <section class="assistant-feature assistant-feature--sandbox">
          <header class="assistant-feature-head">
            <span class="assistant-feature-no">功能五</span>
            <h3>无魔法试玩广告沙盒</h3>
          </header>
          <div class="assistant-feature-body">
            <article class="assistant-feature-impl">
              <h4>功能实现方式</h4>
              <p>{{ activeTool.sandbox.impl }}</p>
            </article>
            <article class="assistant-feature-steps">
              <h4>使用操作步骤</h4>
              <p class="assistant-steps-text">{{ activeTool.sandbox.steps }}</p>
            </article>
          </div>
          <div class="assistant-gallery assistant-gallery--2col">
            <figure v-for="(g, i) in activeTool.sandbox.gallery" :key="i">
              <img :src="g.src" :alt="g.cap" />
              <figcaption>{{ g.cap }}</figcaption>
            </figure>
          </div>
        </section>

        <section class="assistant-feature assistant-feature--img">
          <header class="assistant-feature-head">
            <span class="assistant-feature-no">功能六</span>
            <h3>图片编辑豪华版</h3>
          </header>
          <article class="assistant-feature-impl">
            <h4>功能实现方式</h4>
            <p>{{ activeTool.imageEditor.impl }}</p>
          </article>
          <figure class="assistant-tabs">
            <img :src="activeTool.imageEditor.tabsImage" alt="图片编辑六大功能标签页" />
            <figcaption>功能导航：压缩图片 · 像素压缩 · 调整图片大小 · 编辑图片 · 合并图片 · 智能抠图</figcaption>
          </figure>
          <div class="assistant-img-features">
            <article v-for="(f, idx) in activeTool.imageEditor.features" :key="f.name" class="assistant-img-feature">
              <header>
                <span class="assistant-img-feature-no">0{{ idx + 1 }}</span>
                <h4>{{ f.name }}</h4>
              </header>
              <p class="assistant-img-feature-impl">{{ f.impl }}</p>
              <ul v-if="f.steps" class="assistant-img-feature-steps">
                <li v-for="(s, i) in f.steps" :key="i"><span>{{ i + 1 }}.</span>{{ s }}</li>
              </ul>
              <ul v-else-if="f.settings" class="assistant-img-feature-settings">
                <li v-for="s in f.settings" :key="s">{{ s }}</li>
              </ul>
              <figure v-if="f.image" class="assistant-img-feature-shot">
                <img :src="f.image" :alt="f.name" />
              </figure>
            </article>
          </div>
        </section>

        <section class="assistant-feature assistant-feature--diag">
          <header class="assistant-feature-head">
            <span class="assistant-feature-no">功能七</span>
            <h3>一键诊断与连接测试</h3>
          </header>
          <div class="assistant-feature-body">
            <article class="assistant-feature-impl">
              <h4>功能实现方式</h4>
              <p>{{ activeTool.diagnostics.impl }}</p>
            </article>
            <article class="assistant-feature-steps">
              <h4>功能操作步骤</h4>
              <ol>
                <li v-for="(s, i) in activeTool.diagnostics.steps" :key="i"><span>{{ i + 1 }}</span>{{ s }}</li>
              </ol>
            </article>
          </div>
        </section>

        <section class="assistant-feature assistant-feature--rules">
          <header class="assistant-feature-head">
            <span class="assistant-feature-no">功能八</span>
            <h3>AI 规范</h3>
          </header>
          <div class="assistant-feature-body">
            <article class="assistant-feature-impl">
              <h4>功能实现方式</h4>
              <p>{{ activeTool.aiRules.impl }}</p>
            </article>
            <article class="assistant-feature-steps">
              <h4>功能操作步骤</h4>
              <ol>
                <li v-for="(s, i) in activeTool.aiRules.steps" :key="i"><span>{{ i + 1 }}</span>{{ s }}</li>
              </ol>
            </article>
          </div>
        </section>

        <section class="assistant-feature assistant-feature--feedback">
          <header class="assistant-feature-head">
            <span class="assistant-feature-no">功能九</span>
            <h3>AI 反馈转译</h3>
          </header>
          <div class="assistant-feature-body">
            <article class="assistant-feature-impl">
              <h4>功能实现方式</h4>
              <p>{{ activeTool.aiFeedback.impl }}</p>
            </article>
            <article class="assistant-feature-steps">
              <h4>功能操作步骤</h4>
              <ol>
                <li v-for="(s, i) in activeTool.aiFeedback.steps" :key="i"><span>{{ i + 1 }}</span>{{ s }}</li>
              </ol>
            </article>
          </div>
          <figure class="assistant-feedback-shot">
            <img :src="activeTool.aiFeedback.image" alt="AI 反馈转译：测试反馈助手界面" />
            <figcaption>AI 反馈转译：左侧对话 + 右侧输入区（截图 / 测试反馈复选框 / 发送），支持复制最后回复和新对话。</figcaption>
          </figure>
        </section>

        <section class="assistant-contact shell">
          <div>
            <p class="eyebrow"><span class="dot" aria-hidden="true"></span> COCOS MCP 助手 · 核心功能总览</p>
            <h2>从项目发现 → 扩展安装 → 结构创建 → 试玩沙盒 → 图片编辑 → MCP诊断 → AI规范 → 反馈转译<br />九个功能把 Cocos 开发流程整理成一条连贯的工作台</h2>
          </div>
        </section>
      </div>
    </section>

    <section v-else-if="activeTool.id === 'zhilingqiu'" class="tool-detail-preview tool-detail-preview--zhilingqiu">
      <div class="shell">
        <header class="zlq-head">
          <p class="eyebrow"><span class="dot" aria-hidden="true"></span> {{ activeTool.index }} / {{ activeTool.eyebrow }}</p>
          <h2>{{ activeTool.navTitle }}</h2>
          <p class="zlq-head-desc">{{ activeTool.description }}</p>
          <div class="zlq-tags"><span v-for="tag in activeTool.tags" :key="tag">{{ tag }}</span></div>
        </header>

        <section class="zlq-screens">
          <figure class="zlq-screen zlq-screen--manager">
            <img :src="activeTool.managerImage" alt="指令球小扣 - 提示词管理窗口三栏布局" />
            <figcaption><span>提示词管理窗口</span><b>分组导航 · 提示词列表 · 编辑面板</b></figcaption>
          </figure>
          <figure class="zlq-screen zlq-screen--ball">
            <img :src="activeTool.ballImage" alt="指令球小扣 - 透明悬浮球与快捷提示词面板" />
            <figcaption><span>悬浮球 & 快捷面板</span><b>透明置顶 · 移入展开 · 单击复制</b></figcaption>
          </figure>
        </section>

        <div class="tool-detail-points zlq-points">
          <article v-for="([title, detail], index) in activeTool.details" :key="title">
            <span>0{{ index + 1 }}</span>
            <div>
              <h3>{{ title }}</h3>
              <p>{{ detail }}</p>
            </div>
          </article>
        </div>

        <section class="zlq-section">
          <header class="zlq-section-head">
            <div>
              <p class="eyebrow"><span class="dot" aria-hidden="true"></span> CORE FEATURES</p>
              <h3>四大核心功能 覆盖从浮窗到管理的全流程</h3>
            </div>
          </header>
          <div class="zlq-feature-grid">
            <article v-for="(feat, index) in activeTool.coreFeatures" :key="feat.title" class="zlq-feature">
              <span class="zlq-feature-no">0{{ index + 1 }}</span>
              <h4>{{ feat.title }}</h4>
              <ul>
                <li v-for="(item, i) in feat.items" :key="i">{{ item }}</li>
              </ul>
            </article>
          </div>
        </section>

        <section class="zlq-section zlq-section--alt">
          <header class="zlq-section-head">
            <div>
              <p class="eyebrow"><span class="dot" aria-hidden="true"></span> BUILT-IN PROMPTS</p>
              <h3>内置 4 条 Cocos + Codex 专用提示词 开箱即用</h3>
            </div>
            <p>全部 4 条默认标记为常用，可直接在悬浮球快捷面板中使用，覆盖 MCP 连接、编辑器规范、引用约束与项目整理。</p>
          </header>
          <div class="zlq-table-wrap">
            <table class="zlq-table">
              <thead>
                <tr><th>排序</th><th>标题</th><th>分组</th><th>常用</th></tr>
              </thead>
              <tbody>
                <tr v-for="p in activeTool.builtinPrompts" :key="p.order">
                  <td>{{ p.order }}</td>
                  <td class="zlq-table-title">{{ p.title }}</td>
                  <td>{{ p.group }}</td>
                  <td><span class="zlq-tag-yes">{{ p.favorite ? '是' : '否' }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="zlq-section">
          <header class="zlq-section-head">
            <div>
              <p class="eyebrow"><span class="dot" aria-hidden="true"></span> USAGE GUIDE</p>
              <h3>悬浮球操作与快捷面板使用流程</h3>
            </div>
          </header>
          <div class="zlq-usage-grid">
            <article v-for="block in activeTool.usageSteps" :key="block.title" class="zlq-usage">
              <h4>{{ block.title }}</h4>
              <div class="zlq-usage-list">
                <div v-for="([step, desc], i) in block.items" :key="i" class="zlq-usage-row">
                  <b>{{ step }}</b>
                  <span>{{ desc }}</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="zlq-section zlq-section--alt">
          <header class="zlq-section-head">
            <div>
              <p class="eyebrow"><span class="dot" aria-hidden="true"></span> EFFICIENCY BOOST</p>
              <h3>让 Cocos 开发与 Codex 协作都更高效</h3>
            </div>
          </header>
          <div class="zlq-eff-grid">
            <article class="zlq-eff-card">
              <p class="zlq-eff-kicker">COCOS 开发场景</p>
              <ul>
                <li v-for="item in activeTool.efficiency.cocos" :key="item.title">
                  <b>{{ item.title }}</b><span>{{ item.desc }}</span>
                </li>
              </ul>
            </article>
            <article class="zlq-eff-card">
              <p class="zlq-eff-kicker">CODEX 协作场景</p>
              <ul>
                <li v-for="item in activeTool.efficiency.codex" :key="item.title">
                  <b>{{ item.title }}</b><span>{{ item.desc }}</span>
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section class="zlq-section">
          <header class="zlq-section-head">
            <div>
              <p class="eyebrow"><span class="dot" aria-hidden="true"></span> TECH ARCHITECTURE</p>
              <h3>技术栈与多窗口架构</h3>
            </div>
          </header>
          <div class="zlq-table-wrap">
            <table class="zlq-table zlq-table--stack">
              <thead>
                <tr><th>组件</th><th>技术</th><th>说明</th></tr>
              </thead>
              <tbody>
                <tr v-for="row in activeTool.techStack" :key="row.component">
                  <td>{{ row.component }}</td>
                  <td class="zlq-table-title">{{ row.tech }}</td>
                  <td>{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="zlq-table-wrap" style="margin-top:24px">
            <table class="zlq-table">
              <thead>
                <tr><th>窗口</th><th>职责</th><th>特性</th></tr>
              </thead>
              <tbody>
                <tr v-for="row in activeTool.windowArch" :key="row.window">
                  <td>{{ row.window }}</td>
                  <td class="zlq-table-title">{{ row.duty }}</td>
                  <td>{{ row.feature }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="zlq-callout">
            <strong>⚡ 启动优化：</strong>悬浮球和面板窗口采用延迟预热策略 — 主窗口启动 900ms 后才创建辅助窗口，避免冷启动卡顿。需要时即时显示，无需等待。
          </p>
        </section>

        <section class="zlq-section zlq-section--alt">
          <header class="zlq-section-head">
            <div>
              <p class="eyebrow"><span class="dot" aria-hidden="true"></span> FAQ</p>
              <h3>常见问题</h3>
            </div>
          </header>
          <div class="zlq-faq">
            <article v-for="(f, index) in activeTool.faq" :key="f.question" class="zlq-faq-item">
              <span class="zlq-faq-no">Q{{ index + 1 }}</span>
              <div>
                <h4>{{ f.question }}</h4>
                <ul><li v-for="(a, i) in f.answers" :key="i">{{ a }}</li></ul>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>

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
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  min-height: calc(100svh - 72px);
  overflow: hidden;
  color: #edf6f7;
  background-color: #182129;
  transition: background-color .45s ease, color .45s ease;
}
.mcp-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    linear-gradient(90deg, rgba(93, 214, 190, .1) 1px, transparent 1px),
    linear-gradient(rgba(93, 214, 190, .08) 1px, transparent 1px);
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
.mcp-hero .eyebrow { color: #9cb7c4; transition: color .35s ease; }
.mcp-hero .eyebrow .dot,
.mcp-workflow .eyebrow .dot {
  background: #55d6bb;
  box-shadow: 0 0 0 4px rgba(85, 214, 187, .15);
  transition: background-color .35s ease, box-shadow .35s ease;
}
.mcp-hero h1 {
  margin: 0;
  font-size: clamp(48px, 5.7vw, 78px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0;
}
.mcp-hero h1 > span,
.mcp-hero h1 em { display: block; white-space: nowrap; }
.mcp-hero h1 em { color: #55d6bb; font-style: normal; transition: color .35s ease; }
.mcp-hero-text {
  max-width: 620px;
  margin-top: 26px;
  color: #b7c8d2;
  font-size: 16px;
  line-height: 1.9;
  transition: color .35s ease;
}
.mcp-hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 30px; }
.mcp-hero-actions .btn { border-radius: 6px; transition: background-color .35s ease, border-color .35s ease, color .35s ease, transform .2s ease, box-shadow .25s ease; }
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
  transition: border-color .35s ease;
}
.mcp-hero-facts span {
  padding: 11px 15px;
  border-right: 1px solid #3c4b55;
  color: #a6c4c9;
  font: 500 11px 'DM Mono', monospace;
  letter-spacing: 0;
  transition: border-color .35s ease, color .35s ease;
}
.mcp-hero-facts span:first-child { padding-left: 0; }
.mcp-hero-facts span:last-child { border-right: 0; }
.mcp-hero-console {
  margin: 0;
  overflow: hidden;
  border: 1px solid #41545e;
  border-radius: 6px;
  background-color: #20282e;
  box-shadow: 22px 24px 0 rgba(8, 13, 17, .38);
  transition: background-color .35s ease, border-color .35s ease, box-shadow .35s ease;
}
.mcp-hero-console-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 44px;
  padding: 10px 14px;
  border-bottom: 1px solid #41545e;
  background-color: #171e23;
  transition: background-color .35s ease, border-color .35s ease;
}
.mcp-console-name {
  color: #acc0c9;
  font: 500 10.5px 'DM Mono', monospace;
  letter-spacing: 0;
  transition: color .35s ease;
}
.mcp-connected {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #c4dde0;
  font-size: 12px;
  white-space: nowrap;
  transition: color .35s ease;
}
.mcp-connected i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #55d6bb;
  box-shadow: 0 0 0 4px rgba(85, 214, 187, .12);
  transition: background-color .35s ease, box-shadow .35s ease;
}
.mcp-hero-console img { width: 100%; min-height: 390px; object-fit: cover; object-position: top; }
.mcp-hero-console figcaption {
  padding: 13px 14px;
  color: #9db1bb;
  border-top: 1px solid #41545e;
  background-color: #20282e;
  font-size: 12px;
  line-height: 1.65;
  transition: background-color .35s ease, border-color .35s ease, color .35s ease;
}
.mcp-hero--assistant {
  color: #102a4c;
  background-color: #e8f0fb;
}
.mcp-hero--assistant::before {
  background-image:
    linear-gradient(90deg, rgba(55, 109, 194, .1) 1px, transparent 1px),
    linear-gradient(rgba(55, 109, 194, .08) 1px, transparent 1px);
}
.mcp-hero--sandbox {
  color: #153852;
  background-color: #ddf0fb;
}
.mcp-hero--sandbox::before {
  background-image:
    linear-gradient(90deg, rgba(52, 142, 214, .1) 1px, transparent 1px),
    linear-gradient(rgba(52, 142, 214, .08) 1px, transparent 1px);
}
.mcp-hero--compressor {
  color: #173344;
  background-color: #eff7fb;
}
.mcp-hero--compressor::before {
  background-image:
    linear-gradient(90deg, rgba(39, 147, 209, .1) 1px, transparent 1px),
    linear-gradient(rgba(39, 147, 209, .08) 1px, transparent 1px);
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
  transition: transform .2s, background-color .35s ease, opacity .2s;
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
.tool-subnav { border-bottom: 1px solid #d7e1e4; background: #fff; }
.tool-subnav-inner { display: grid; grid-template-columns: repeat(5, 1fr); }
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
  .zlq-screens { grid-template-columns: 1fr; }
  .zlq-screen--ball { margin-top: 0; }
  .zlq-feature-grid,
  .zlq-usage-grid,
  .zlq-eff-grid { grid-template-columns: 1fr; }
}

/* ---------- 指令球小扣专属样式 ---------- */
.mcp-hero--zhilingqiu {
  color: #2a1646;
  background-color: #f3ecff;
}
.mcp-hero--zhilingqiu::before {
  background-image:
    linear-gradient(90deg, rgba(155, 92, 246, .1) 1px, transparent 1px),
    linear-gradient(rgba(155, 92, 246, .08) 1px, transparent 1px);
}
.mcp-hero--zhilingqiu .mcp-hero-inner {
  width: min(1420px, calc(100% - 80px));
  grid-template-columns: minmax(350px, .78fr) minmax(560px, 1.22fr);
  gap: clamp(44px, 6vw, 100px);
}
.mcp-hero--zhilingqiu .eyebrow { color: #7a5cae; }
.mcp-hero--zhilingqiu .eyebrow .dot { background: #8b5cf6; box-shadow: 0 0 0 4px rgba(139, 92, 246, .16); }
.mcp-hero--zhilingqiu h1 em { color: #7c3aed; }
.mcp-hero--zhilingqiu .mcp-hero-text { color: #5a4877; }
.mcp-hero--zhilingqiu .mcp-hero-actions .btn-primary { background: #7c3aed; color: #fff; }
.mcp-hero--zhilingqiu .mcp-hero-actions .btn-primary:hover { background: #6d28d9; }
.mcp-hero--zhilingqiu .mcp-hero-actions .btn-ghost { border-color: #bfa6e3; color: #3c2560; background: rgba(255, 255, 255, .5); }
.mcp-hero--zhilingqiu .mcp-hero-actions .btn-ghost:hover { border-color: #7c3aed; color: #7c3aed; }
.mcp-hero--zhilingqiu .mcp-hero-facts { border-color: #cfbbec; }
.mcp-hero--zhilingqiu .mcp-hero-facts span { border-color: #cfbbec; color: #5a4877; }
.mcp-hero--zhilingqiu .mcp-hero-console { border-color: #b59bd9; background: #faf6ff; box-shadow: 22px 24px 0 rgba(80, 40, 160, .14); }
.mcp-hero--zhilingqiu .mcp-hero-console-bar { border-color: #c4aadf; background: #fff; }
.mcp-hero--zhilingqiu .mcp-console-name { color: #5a4877; }
.mcp-hero--zhilingqiu .mcp-connected { color: #3c2560; }
.mcp-hero--zhilingqiu .mcp-connected i { background: #7c3aed; box-shadow: 0 0 0 4px rgba(124, 58, 237, .14); }
.mcp-hero--zhilingqiu .mcp-hero-console figcaption { border-color: #c4aadf; color: #5a4877; background: #fff; }
.mcp-hero--zhilingqiu .mcp-hero-pagination button { background: #a98fd2; }
.mcp-hero--zhilingqiu .mcp-hero-pagination button:focus-visible { outline-color: #7c3aed; }
.mcp-hero--zhilingqiu .mcp-hero-pagination button.active { background: #7c3aed; }
.mcp-hero-console--zhilingqiu img {
  height: clamp(420px, 48vh, 540px);
  min-height: 0;
  object-fit: contain;
  object-position: center;
  background: #faf6ff;
  padding: 20px;
}

.tool-detail-preview--zhilingqiu {
  padding: 94px 0;
  background: #f7f2ff;
  color: #2d1a55;
}
.tool-detail-preview--zhilingqiu > .shell { display: grid; gap: 90px; }
.tool-detail-preview--zhilingqiu .eyebrow { color: #7a5cae; letter-spacing: 0; }
.tool-detail-preview--zhilingqiu .eyebrow .dot { background: #8b5cf6; box-shadow: 0 0 0 4px rgba(139, 92, 246, .15); }
.tool-detail-preview--zhilingqiu h2,
.tool-detail-preview--zhilingqiu h3 { color: #2a1646; letter-spacing: 0; }

.zlq-head {
  display: grid;
  gap: 22px;
  padding-top: 8px;
  max-width: 900px;
}
.zlq-head h2 { font-size: clamp(38px, 5vw, 64px); line-height: 1.15; margin: 0; }
.zlq-head-desc { margin: 0; color: #5a4877; font-size: 16px; line-height: 1.9; }
.zlq-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.zlq-tags span {
  padding: 7px 11px;
  border: 1px solid #cfbbec;
  border-radius: 4px;
  color: #5b21b6;
  background: #fff;
  font: 500 10.5px 'DM Mono', monospace;
}

.zlq-screens {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, .7fr);
  gap: 24px;
  align-items: start;
}
.zlq-screen {
  margin: 0;
  overflow: hidden;
  border: 1px solid #c7b2e8;
  border-radius: 8px;
  background: #fff;
  box-shadow: 16px 16px 0 rgba(124, 58, 237, .1);
}
.zlq-screen img { display: block; width: 100%; object-fit: contain; background: #faf6ff; }
.zlq-screen--manager img { min-height: 360px; }
.zlq-screen--ball img { min-height: 340px; padding: 20px; }
.zlq-screen--ball { margin-top: 50px; }
.zlq-screen figcaption {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-top: 1px solid #c7b2e8;
  color: #5a4877;
  background: #fdfaff;
  font-size: 12px;
  line-height: 1.6;
}
.zlq-screen figcaption span { color: #3c2560; font-weight: 700; }
.zlq-screen figcaption b { font-weight: 500; }

.zlq-points {
  grid-template-columns: repeat(4, 1fr);
  border-color: #c7b2e8;
}
.zlq-points article {
  background: rgba(255, 255, 255, .55);
  border-color: #c7b2e8;
}
.zlq-points article > span { color: #7c3aed; }
.zlq-points h3 { color: #2a1646; font-size: 17px; }
.zlq-points p { color: #5a4877; }

.zlq-section { padding: 0; }
.zlq-section--alt {
  padding: 70px 36px;
  margin: 0 -36px;
  border-top: 1px solid #d8c8f2;
  border-bottom: 1px solid #d8c8f2;
  background: #efe6ff;
}
.zlq-section-head {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, .7fr);
  gap: 50px;
  align-items: end;
  margin-bottom: 40px;
}
.zlq-section-head > div .eyebrow { margin-bottom: 14px; }
.zlq-section-head h3 { font-size: clamp(26px, 3.4vw, 42px); line-height: 1.18; margin: 0; }
.zlq-section-head > p { color: #5a4877; font-size: 14.5px; line-height: 1.85; margin: 0; }

.zlq-feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-top: 1px solid #c7b2e8;
  border-left: 1px solid #c7b2e8;
}
.zlq-feature {
  min-height: 240px;
  padding: 30px 28px;
  border-right: 1px solid #c7b2e8;
  border-bottom: 1px solid #c7b2e8;
  background: rgba(255, 255, 255, .5);
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 14px 16px;
  align-content: start;
}
.zlq-feature-no { color: #7c3aed; font: 500 11px 'DM Mono', monospace; }
.zlq-feature h4 { grid-column: 2; margin: 0; font-size: 20px; line-height: 1.3; color: #2a1646; }
.zlq-feature ul { grid-column: 1 / -1; margin: 12px 0 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.zlq-feature ul li {
  position: relative;
  padding-left: 20px;
  color: #5a4877;
  font-size: 13.5px;
  line-height: 1.75;
}
.zlq-feature ul li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 10px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a78bfa;
}

.zlq-table-wrap {
  overflow: hidden;
  border: 1px solid #c7b2e8;
  border-radius: 8px;
  background: #fff;
}
.zlq-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.zlq-table thead th {
  padding: 13px 18px;
  text-align: left;
  color: #3c2560;
  font-weight: 700;
  background: #efe6ff;
  border-bottom: 1px solid #c7b2e8;
  font-size: 13px;
}
.zlq-table tbody td {
  padding: 13px 18px;
  color: #4c3675;
  border-bottom: 1px solid #e7dcfa;
  line-height: 1.65;
}
.zlq-table tbody tr:last-child td { border-bottom: 0; }
.zlq-table-title { color: #2a1646; font-weight: 600; }
.zlq-tag-yes {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  color: #fff;
  background: #7c3aed;
  font: 500 11px 'DM Mono', monospace;
}

.zlq-usage-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
.zlq-usage {
  padding: 30px;
  border: 1px solid #c7b2e8;
  border-radius: 8px;
  background: rgba(255, 255, 255, .5);
}
.zlq-usage h4 { margin: 0 0 18px; font-size: 20px; color: #2a1646; }
.zlq-usage-list { display: grid; gap: 0; border-top: 1px solid #d8c8f2; border-left: 1px solid #d8c8f2; }
.zlq-usage-row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 14px;
  padding: 14px 16px;
  border-right: 1px solid #d8c8f2;
  border-bottom: 1px solid #d8c8f2;
}
.zlq-usage-row b {
  color: #7c3aed;
  font: 500 11.5px 'DM Mono', monospace;
  align-self: start;
  padding-top: 2px;
}
.zlq-usage-row span { color: #5a4877; font-size: 13.5px; line-height: 1.75; }

.zlq-eff-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
.zlq-eff-card {
  padding: 30px;
  border: 1px solid #c7b2e8;
  border-radius: 8px;
  background: #fff;
}
.zlq-eff-kicker {
  margin: 0 0 18px;
  color: #7c3aed;
  font: 500 11px 'DM Mono', monospace;
}
.zlq-eff-card ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 14px; }
.zlq-eff-card ul li {
  padding: 14px 16px;
  border-left: 3px solid #a78bfa;
  background: #faf6ff;
  display: grid;
  gap: 6px;
}
.zlq-eff-card ul li b { color: #2a1646; font-size: 15px; }
.zlq-eff-card ul li span { color: #5a4877; font-size: 13px; line-height: 1.75; }

.zlq-callout {
  margin: 28px 0 0;
  padding: 18px 22px;
  border-left: 4px solid #8b5cf6;
  border-radius: 4px;
  color: #3c2560;
  background: #f0e7ff;
  font-size: 14px;
  line-height: 1.8;
}
.zlq-callout strong { color: #7c3aed; }

.zlq-faq {
  display: grid;
  gap: 0;
  border-top: 1px solid #c7b2e8;
}
.zlq-faq-item {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr);
  gap: 18px;
  padding: 26px 0;
  border-bottom: 1px solid #c7b2e8;
}
.zlq-faq-no {
  color: #7c3aed;
  font: 700 14px 'DM Mono', monospace;
  padding-top: 2px;
}
.zlq-faq-item h4 { margin: 0 0 10px; font-size: 18px; color: #2a1646; }
.zlq-faq-item ul { margin: 0; padding: 0 0 0 18px; color: #5a4877; }
.zlq-faq-item ul li { font-size: 14px; line-height: 1.85; margin-top: 4px; }

@media (max-width: 960px) {
  .mcp-hero--zhilingqiu .mcp-hero-inner {
    width: min(1180px, calc(100% - 48px));
    grid-template-columns: 1fr;
  }
  .mcp-hero-console--zhilingqiu img { height: auto; }
  .zlq-head h2 { font-size: clamp(32px, 6vw, 44px); }
  .zlq-section--alt { padding: 50px 20px; margin: 0 -20px; }
  .zlq-screens { grid-template-columns: 1fr; }
  .zlq-screen--ball { margin-top: 0; }
  .zlq-points { grid-template-columns: repeat(3, 1fr); }
  .zlq-section-head { grid-template-columns: 1fr; gap: 18px; }
  .zlq-feature-grid,
  .zlq-usage-grid,
  .zlq-eff-grid { grid-template-columns: 1fr; }
  .zlq-usage-row { grid-template-columns: 90px minmax(0, 1fr); }
}

@media (max-width: 640px) {
  .mcp-hero--zhilingqiu .mcp-hero-inner { width: min(100% - 28px, 620px); }
  .zlq-points { grid-template-columns: 1fr; }
  .zlq-points article { padding: 22px 0; border-right: 0; border-left: 0; min-height: 0; }
  .zlq-feature {
    grid-template-columns: 32px minmax(0, 1fr);
    padding: 24px 20px;
    min-height: 0;
  }
  .zlq-section--alt { padding: 40px 14px; margin: 0 -14px; }
  .zlq-table thead th,
  .zlq-table tbody td { padding: 10px 12px; font-size: 13px; }
  .zlq-usage { padding: 22px 18px; }
  .zlq-usage-row { grid-template-columns: 1fr; gap: 4px; }
  .zlq-eff-card { padding: 22px 18px; }
  .zlq-faq-item { grid-template-columns: 44px minmax(0, 1fr); gap: 10px; }
}

/* ============ Cocos MCP 助手详情页 ============ */
.tool-detail-preview--assistant { padding: 94px 0; background: #f5f8ff; }
.section-head--assistant .dot { background: #2f64d8; box-shadow: 0 0 0 4px rgba(47, 100, 216, .15); }
.section-head--assistant h2 { font-size: clamp(24px, 3vw, 44px); }
.assistant-tags { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
.assistant-tags span {
  display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 999px;
  background: rgba(47, 100, 216, .08); color: #1d4aa3; font-size: 13px; font-weight: 500;
  border: 1px solid rgba(47, 100, 216, .15);
}

.assistant-home-screen {
  background: #fff; border: 1px solid #d9e3f5; border-radius: 16px; overflow: hidden; margin: 40px 0 64px;
  box-shadow: 0 28px 70px -28px rgba(47, 100, 216, .25);
}
.assistant-home-screen img { display: block; width: 100%; height: auto; }
.assistant-home-screen figcaption {
  padding: 14px 20px; font-size: 13px; color: #556785; border-top: 1px solid #e3ecfa; background: #f8fbff;
}

.assistant-feature {
  background: #fff; border: 1px solid #dde6f5; border-radius: 18px;
  padding: 36px 32px 32px; margin-bottom: 32px; box-shadow: 0 12px 36px -18px rgba(47, 100, 216, .18);
}
.assistant-feature-head {
  display: flex; align-items: baseline; gap: 16px; margin-bottom: 22px;
  padding-bottom: 18px; border-bottom: 1px dashed #cfdbf2;
}
.assistant-feature-no {
  display: inline-block; font-size: 13px; font-weight: 600; color: #fff; background: linear-gradient(135deg, #2f64d8, #4f86ff);
  padding: 6px 14px; border-radius: 999px; letter-spacing: 0.5px;
}
.assistant-feature-head h3 { font-size: 24px; color: #132644; margin: 0; }
.assistant-feature-body {
  display: grid; grid-template-columns: 1.1fr 1fr; gap: 28px; margin-bottom: 26px;
}
.assistant-feature-impl h4,
.assistant-feature-steps h4 {
  font-size: 14px; font-weight: 600; color: #2f64d8; text-transform: uppercase; letter-spacing: 1px;
  margin: 0 0 10px;
}
.assistant-feature-impl p { font-size: 15px; line-height: 1.8; color: #3a4a68; margin: 0; }
.assistant-feature-steps ol { list-style: none; padding: 0; margin: 0; }
.assistant-feature-steps ol li {
  display: grid; grid-template-columns: 26px minmax(0, 1fr); gap: 10px; align-items: start;
  padding: 8px 0; font-size: 14.5px; line-height: 1.7; color: #3a4a68;
  border-bottom: 1px dashed #eef2fa;
}
.assistant-feature-steps ol li:last-child { border-bottom: 0; }
.assistant-feature-steps ol li span {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%; background: #e6efff; color: #1d4aa3;
  font-size: 12px; font-weight: 700; margin-top: 3px;
}
.assistant-steps-text { font-size: 14.5px; line-height: 1.8; color: #3a4a68; margin: 0; }

.assistant-gallery { display: grid; gap: 18px; margin: 18px 0 10px; }
.assistant-gallery--2col { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.assistant-gallery--3col { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.assistant-gallery figure {
  background: #f8fbff; border: 1px solid #e1eaf8; border-radius: 12px; overflow: hidden;
  display: flex; flex-direction: column;
}
.assistant-gallery figure img { width: 100%; height: auto; display: block; background: #fff; }
.assistant-gallery figure figcaption {
  padding: 10px 14px; font-size: 12.5px; line-height: 1.6; color: #556785;
  background: #f8fbff; border-top: 1px solid #e8f0ff;
}
.assistant-note {
  margin: 16px 0 20px; padding: 12px 16px; border-left: 3px solid #89a7e0;
  background: #f3f7ff; color: #3a4a68; font-size: 14px; border-radius: 0 8px 8px 0;
}
.assistant-note--tip { border-left-color: #e6a23c; background: #fff8ed; color: #7c5d1c; }


.assistant-tabs {
  background: #fff; border: 1px solid #dde6f5; border-radius: 12px; overflow: hidden;
  margin: 20px 0 26px; text-align: center;
}
.assistant-tabs img { width: 100%; max-width: 760px; height: auto; margin: 0 auto; display: block; }
.assistant-tabs figcaption {
  padding: 10px 16px; font-size: 13px; color: #556785; border-top: 1px solid #edf2fc; background: #f8fbff;
}

.assistant-img-features { display: grid; grid-template-columns: 1fr; gap: 22px; }
.assistant-img-feature {
  background: linear-gradient(180deg, #f8fbff, #fff); border: 1px solid #dde6f5; border-radius: 14px;
  padding: 24px 24px 22px;
}
.assistant-img-feature header {
  display: flex; align-items: center; gap: 14px; margin-bottom: 12px;
  padding-bottom: 12px; border-bottom: 1px dashed #cfdbf2;
}
.assistant-img-feature-no {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 28px; border-radius: 8px;
  background: linear-gradient(135deg, #2f64d8, #4f86ff); color: #fff;
  font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
}
.assistant-img-feature h4 { margin: 0; font-size: 17px; color: #132644; }
.assistant-img-feature-impl { font-size: 14.5px; line-height: 1.8; color: #3a4a68; margin: 0 0 12px; }
.assistant-img-feature-steps,
.assistant-img-feature-settings { list-style: none; padding: 0; margin: 0 0 14px; }
.assistant-img-feature-steps li {
  display: grid; grid-template-columns: 30px minmax(0, 1fr); gap: 10px; padding: 6px 0;
  font-size: 14px; line-height: 1.7; color: #3a4a68;
}
.assistant-img-feature-steps li span { color: #2f64d8; font-weight: 600; }
.assistant-img-feature-settings li {
  padding: 7px 0 7px 18px; font-size: 14px; line-height: 1.7; color: #3a4a68;
  position: relative; border-bottom: 1px dashed #eef2fa;
}
.assistant-img-feature-settings li::before {
  content: '▸'; position: absolute; left: 0; color: #2f64d8; font-weight: 700;
}
.assistant-img-feature-settings li:last-child { border-bottom: 0; }
.assistant-img-feature-shot {
  margin: 12px 0 0; border: 1px solid #e1eaf8; border-radius: 12px; overflow: hidden; background: #fff;
}
.assistant-img-feature-shot img { width: 100%; height: auto; display: block; }

.assistant-feedback-shot {
  margin: 20px 0 0; background: #fff; border: 1px solid #dde6f5; border-radius: 14px; overflow: hidden;
}
.assistant-feedback-shot img { width: 100%; height: auto; display: block; }
.assistant-feedback-shot figcaption {
  padding: 12px 20px; font-size: 13px; color: #556785; border-top: 1px solid #edf2fc; background: #f8fbff;
}

.assistant-contact {
  margin-top: 48px; padding: 46px 40px; background: linear-gradient(135deg, #2f64d8, #4f86ff);
  border-radius: 18px; color: #fff; box-shadow: 0 22px 60px -26px rgba(47, 100, 216, .55);
}
.assistant-contact .eyebrow { color: #bfd4ff; }
.assistant-contact .eyebrow .dot { background: #cde3ff; box-shadow: 0 0 0 4px rgba(205, 227, 255, .2); }
.assistant-contact h2 { font-size: 26px; line-height: 1.6; color: #fff; margin: 8px 0 0; }

@media (max-width: 960px) {
  .tool-detail-preview--assistant { padding: 60px 0; }
  .assistant-feature { padding: 24px 18px; }
  .assistant-feature-head { flex-direction: column; gap: 6px; }
  .assistant-feature-head h3 { font-size: 20px; }
  .assistant-feature-body { grid-template-columns: 1fr; gap: 18px; }
  .assistant-gallery--2col,
  .assistant-gallery--3col { grid-template-columns: 1fr; }
  .assistant-contact { padding: 28px 22px; }
  .assistant-contact h2 { font-size: 20px; }
}

/* ============================================================
   文档章节区块（统一设计系统）
   mcp-bg / mcp-install / mcp-config / mcp-toolspec /
   mcp-params / mcp-flow-2 / mcp-reliability / mcp-summary
   ============================================================ */
.mcp-bg,
.mcp-toolspec,
.mcp-params,
.mcp-summary { padding: var(--section) 0; }
.mcp-install,
.mcp-config,
.mcp-flow-2,
.mcp-reliability { padding: var(--section) 0; }
.mcp-install,
.mcp-flow-2 { background: var(--soft); border-top: 1px solid var(--line-2); border-bottom: 1px solid var(--line-2); }

.mcp-bg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}
.mcp-bg-grid article {
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bg);
  box-shadow: var(--shadow-card);
  transition: transform .25s, box-shadow .25s, border-color .25s;
}
.mcp-bg-grid article:hover { transform: translateY(-3px); border-color: var(--primary); box-shadow: var(--shadow-hover); }
.mcp-bg-grid article > span {
  color: var(--primary);
  font: 600 11px 'DM Mono', monospace;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.mcp-bg-grid article p { margin: 10px 0 0; color: var(--ink-2); font-size: 14px; line-height: 1.8; }

.mcp-install-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin: 0 0 26px;
  padding: 0;
  list-style: none;
  counter-reset: install;
}
.mcp-install-steps li {
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bg);
}
.mcp-install-steps li > span { color: var(--primary); font: 600 11px 'DM Mono', monospace; letter-spacing: .06em; }
.mcp-install-steps li p { margin: 8px 0 0; color: var(--ink-2); font-size: 14px; line-height: 1.75; }

.mcp-install .code-block { margin-bottom: 26px; }

.mcp-install-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}
.mcp-install-gallery figure {
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bg);
  box-shadow: var(--shadow-card);
}
.mcp-install-gallery img { display: block; width: 100%; height: auto; }
.mcp-install-gallery figcaption {
  padding: 11px 14px;
  border-top: 1px solid var(--line-2);
  color: var(--muted);
  font-size: 12.5px;
  line-height: 1.6;
}

.mcp-config .code-block { margin-bottom: 30px; }
.mcp-config-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}
.mcp-config-steps figure {
  position: relative;
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bg);
  box-shadow: var(--shadow-card);
}
.mcp-config-steps img { display: block; width: 100%; height: auto; }
.mcp-config-steps figcaption {
  padding: 11px 14px 11px 48px;
  border-top: 1px solid var(--line-2);
  color: var(--ink-2);
  font-size: 12.5px;
  line-height: 1.6;
}
.mcp-step-no {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font: 700 12px 'DM Mono', monospace;
  box-shadow: 0 4px 12px rgba(22, 119, 255, .35);
}

.mcp-flow2-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr);
  gap: 28px;
  align-items: start;
}
.mcp-flow2-steps {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.mcp-flow2-steps li {
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bg);
}
.mcp-flow2-steps li > span { color: var(--primary); font: 600 11px 'DM Mono', monospace; letter-spacing: .06em; }
.mcp-flow2-steps li p { margin: 0; color: var(--ink-2); font-size: 14px; line-height: 1.75; }
.mcp-code--right { position: sticky; top: 90px; }

.mcp-reli-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.mcp-reli-list li {
  padding: 20px 22px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bg);
  box-shadow: var(--shadow-card);
}
.mcp-reli-list li > span { color: var(--primary); font: 600 11px 'DM Mono', monospace; }
.mcp-reli-list li p { margin: 8px 0 0; color: var(--ink-2); font-size: 14px; line-height: 1.75; }

.mcp-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
.mcp-summary-grid article {
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--soft-2);
}
.mcp-summary-grid h3 { margin: 0 0 16px; font-size: 20px; letter-spacing: -.01em; }
.mcp-summary-grid ul { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.mcp-summary-grid li {
  position: relative;
  padding-left: 20px;
  color: var(--ink-2);
  font-size: 14px;
  line-height: 1.75;
}
.mcp-summary-grid li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 9px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--primary);
}

@media (max-width: 960px) {
  .mcp-flow2-grid { grid-template-columns: 1fr; }
  .mcp-code--right { position: static; }
  .mcp-summary-grid { grid-template-columns: 1fr; }
}
</style>
