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
]
