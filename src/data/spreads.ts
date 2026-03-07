import type { SpreadDefinition } from '../domain/tarot'

export const SPREADS: SpreadDefinition[] = [
  {
    id: 'single-guidance',
    title: '单张指引',
    description: '适合快速聚焦当下核心讯息，给出一个明确方向。',
    cardCount: 1,
    positions: [
      {
        key: 'guidance',
        label: '指引',
        prompt: '此刻最该看见的核心提醒',
      },
    ],
  },
  {
    id: 'daily-energy',
    title: '今日能量',
    description: '快速查看今天最值得留意的情绪基调、行动重点与提醒。',
    cardCount: 1,
    positions: [
      {
        key: 'energy',
        label: '今日能量',
        prompt: '今天最值得留意的核心能量',
      },
    ],
  },
  {
    id: 'past-present-future',
    title: '过去 / 现在 / 未来',
    description: '查看一个议题如何形成、如何发展，以及下一步趋势。',
    cardCount: 3,
    positions: [
      {
        key: 'past',
        label: '过去',
        prompt: '过去如何塑造现在的局面',
      },
      {
        key: 'present',
        label: '现在',
        prompt: '此刻最真实的状态与焦点',
      },
      {
        key: 'future',
        label: '未来',
        prompt: '若维持当前节奏，接下来会走向哪里',
      },
    ],
  },
  {
    id: 'situation-obstacle-advice',
    title: '现状 / 阻碍 / 建议',
    description: '适合处理明确问题，帮助你看见卡点和可执行建议。',
    cardCount: 3,
    positions: [
      {
        key: 'situation',
        label: '现状',
        prompt: '问题当前最主要的真实样貌',
      },
      {
        key: 'obstacle',
        label: '阻碍',
        prompt: '此刻最需要辨认的阻力或盲点',
      },
      {
        key: 'advice',
        label: '建议',
        prompt: '眼下最值得采取的下一步',
      },
    ],
  },
  {
    id: 'decision-compass',
    title: '抉择罗盘',
    description: '适合比较两个方向的代价与潜力，帮你看见更适合自己的路径。',
    cardCount: 4,
    positions: [
      {
        key: 'core',
        label: '核心',
        prompt: '这次抉择真正牵动的核心课题',
      },
      {
        key: 'path-a',
        label: '方向 A',
        prompt: '若走向第一个选项，会带来什么趋势',
      },
      {
        key: 'path-b',
        label: '方向 B',
        prompt: '若走向第二个选项，会带来什么趋势',
      },
      {
        key: 'compass',
        label: '罗盘',
        prompt: '最值得依循的判断原则与建议',
      },
    ],
  },
  {
    id: 'relationship-mirror',
    title: '关系映照',
    description: '用四张牌看清双方状态、互动课题，以及关系接下来如何推进。',
    cardCount: 4,
    positions: [
      {
        key: 'self',
        label: '我方状态',
        prompt: '你在这段关系中的真实状态',
      },
      {
        key: 'other',
        label: '对方状态',
        prompt: '对方当前的感受、立场或处境',
      },
      {
        key: 'dynamic',
        label: '互动课题',
        prompt: '你们之间最核心的互动模式与卡点',
      },
      {
        key: 'next-step',
        label: '下一步',
        prompt: '这段关系最适合采取的下一步',
      },
    ],
  },
  {
    id: 'weekly-flow',
    title: '七日流向',
    description: '用五张牌查看接下来一周的主轴、助力、风险与行动焦点。',
    cardCount: 5,
    positions: [
      {
        key: 'theme',
        label: '主轴',
        prompt: '未来七天最重要的主线主题',
      },
      {
        key: 'support',
        label: '助力',
        prompt: '这周可被调动的资源与支持',
      },
      {
        key: 'challenge',
        label: '挑战',
        prompt: '本周最需要留意的阻力与波动',
      },
      {
        key: 'action',
        label: '行动',
        prompt: '最值得落实的关键动作',
      },
      {
        key: 'outlook',
        label: '展望',
        prompt: '若按当前节奏推进，一周后的整体趋势',
      },
    ],
  },
]
