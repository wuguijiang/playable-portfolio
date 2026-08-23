// 共享数据：试玩广告作品（含 1 个真实可玩的 rabbit + 6 个设计稿）
// Home.vue / Works.vue / Play.vue 都会用到
// dimension: 2D 或 3D（替代之前的 duration / 时长）

import sushiSortCover from '../assets/covers/sushi-sort.png'
import tidyTownCover from '../assets/covers/tidy-town.png'
import gemGardenCover from '../assets/covers/gem-garden.png'
import stackRushCover from '../assets/covers/stack-rush.png'
import candyPourCover from '../assets/covers/candy-pour.png'
import puppyPathCover from '../assets/covers/puppy-path.png'
import rabbitCover from '../assets/covers/rabbit.svg'

export const works = [
  {
    id: 'rabbit',
    title: 'RABBIT',
    subtitle: '小兔子试玩',
    type: '闯关',
    label: '跑酷 / 跳跃',
    dimension: '2D',
    colors: ['#ffa95b', '#ffe29c'],
    cover: rabbitCover,
    description: '用 Cocos Creator 真实打包的试玩广告。控制小兔子跳跃过障碍、收集萝卜，看你能拿多少分。',
    longDescription: '这是一款基于 Cocos Creator 制作的轻量级跑酷试玩广告。玩家只需要点击屏幕就能让小兔子跳跃，长按可以二段跳。游戏采用关卡递进式设计，从简单的草丛障碍逐渐过渡到河流、围栏、滚动木头等复杂场景。',
    engine: 'Cocos Creator 3.x',
    platform: 'Web / H5',
    tags: ['跑酷', '点击', '二段跳', '节奏'],
    hasPlayable: true,
    playableSrc: '/playable/rabbit.html',
  },
  {
    id: '1',
    title: 'SUSHI SORT',
    subtitle: '寿司分拣站',
    type: '解压',
    label: '拖拽 / 分类',
    dimension: '2D',
    colors: ['#ff8566', '#ffcf6c'],
    cover: sushiSortCover,
    description: '把滚动台上的寿司按颜色和形状放进正确餐盒。三秒上手，越玩越想清空整条传送带。',
    engine: 'Cocos Creator 3.8',
    platform: 'Web / H5',
    tags: ['拖拽', '分类', '即时反馈'],
  },
  {
    id: '2',
    title: 'TIDY TOWN',
    subtitle: '整理小镇',
    type: '经营',
    label: '摆放 / 升级',
    dimension: '3D',
    colors: ['#7d9eff', '#b8e7ff'],
    cover: tidyTownCover,
    description: '从一间凌乱小屋开始，把物品摆到对的位置，逐步点亮整个微缩街区。',
    engine: 'Cocos Creator 3.8',
    platform: 'Web / H5',
    tags: ['摆放', '成长线', '场景变换'],
  },
  {
    id: '3',
    title: 'GEM GARDEN',
    subtitle: '宝石花园',
    type: '三消',
    label: '点击 / 合成',
    dimension: '2D',
    colors: ['#b988ff', '#f5bbff'],
    cover: gemGardenCover,
    description: '点击采集露珠，合成会发光的奇异植物，把一块荒地养成宝石花园。',
    engine: 'Cocos Creator 3.8',
    platform: 'Web / H5',
    tags: ['点击', '合成', '稀有解锁'],
  },
  {
    id: '4',
    title: 'STACK RUSH',
    subtitle: '堆叠冲刺',
    type: '闯关',
    label: '长按 / 释放',
    dimension: '3D',
    colors: ['#72daa7', '#e5ff9d'],
    cover: stackRushCover,
    description: '长按蓄力叠高方块，松手跨过障碍。高度刚好够用时的惊险感是核心。',
    engine: 'Cocos Creator 3.8',
    platform: 'Web / H5',
    tags: ['长按', '节奏', '失败钩子'],
  },
  {
    id: '5',
    title: 'CANDY POUR',
    subtitle: '糖果倾倒',
    type: '解压',
    label: '旋转 / 倒入',
    dimension: '2D',
    colors: ['#ff94c9', '#ffd2e7'],
    cover: candyPourCover,
    description: '旋转糖果罐，让每一颗糖精准落进同色容器。简单、清脆、停不下来。',
    engine: 'Cocos Creator 3.8',
    platform: 'Web / H5',
    tags: ['旋转', '物理', '音效'],
  },
  {
    id: '6',
    title: 'PUPPY PATH',
    subtitle: '小狗回家路',
    type: '闯关',
    label: '画线 / 引导',
    dimension: '2D',
    colors: ['#ffa95b', '#ffe29c'],
    cover: puppyPathCover,
    description: '一笔画出安全路线，带迷路的小狗绕开水坑和围栏，回到温暖的门口。',
    engine: 'Cocos Creator 3.8',
    platform: 'Web / H5',
    tags: ['画线', '情绪驱动', '安全区'],
  },
]

export const workTypes = ['全部', '解压', '收集', '闯关', '经营']
