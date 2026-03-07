import { CARD_ART_MANIFEST } from '../data/artManifest'
import { CARD_BY_ID, TAROT_DECK } from '../data/cards'
import { SPREADS } from '../data/spreads'
import { TOPIC_BY_ID } from '../data/topics'
import type {
  DrawnCard,
  ReadingCardView,
  ReadingInput,
  ReadingResult,
  SpreadDefinition,
  Suit,
  TopicId,
} from '../domain/tarot'
import { createSeededRandom } from './random'

interface ReadingOptions {
  seed?: string | number
  random?: () => number
}

type MinorSuit = Exclude<Suit, null>

const SUIT_LENSES: Record<MinorSuit, Record<TopicId, string>> = {
  wands: {
    general: '权杖把焦点拉回主动推进，说明答案藏在行动与意志的方向上。',
    love: '权杖提醒关系需要热度、主动回应和更直接的表达。',
    career: '权杖说明事业层面要靠执行力、发起性和节奏感来破局。',
    relationships: '权杖点出互动中的主导权、脾气和界线需要被重新整理。',
    growth: '权杖告诉你成长的关键在于点燃生命力，而不是继续观望。',
  },
  cups: {
    general: '圣杯将主题带回感受与连结，提醒你先安顿真实情绪。',
    love: '圣杯把关系中的情绪流动、亲密需求与回应方式放到台前。',
    career: '圣杯表示工作判断不能只看结果，也要看投入感与认同感。',
    relationships: '圣杯强调共情、误解与情感边界，是当前关系的核心。',
    growth: '圣杯提示成长从感受自己开始，允许情绪成为线索。',
  },
  swords: {
    general: '宝剑让问题回到判断、真相和边界，说明需要更清晰的思路。',
    love: '宝剑指出关系里最需要处理的是沟通方式和认知落差。',
    career: '宝剑表示职场课题集中在决策、压力管理与信息辨别。',
    relationships: '宝剑让你看见话语、误会和防御机制如何塑造互动。',
    growth: '宝剑提醒成长并不总是柔软，它也需要清醒切开旧模式。',
  },
  pentacles: {
    general: '星币把议题落回现实基础，提示你关注资源、时间和可持续性。',
    love: '星币说明关系要稳定发展，需要落实承诺、时间分配与现实安排。',
    career: '星币强调事业上的资源累积、实际成果和长期布局。',
    relationships: '星币指出人际关系的关键在于可靠度、投入度与现实支持。',
    growth: '星币让你把成长落到身体、习惯和日常结构之中。',
  },
}

const SUIT_SUMMARIES: Record<MinorSuit, Record<TopicId, string>> = {
  wands: {
    general: '权杖能量最突出，说明局势需要更果断的行动与推进。',
    love: '权杖能量最突出，爱情议题里最重要的是热度、主动与回应速度。',
    career: '权杖能量最突出，事业推进的关键在于拿回主动权与执行力度。',
    relationships: '权杖能量最突出，说明关系里有明显的张力、主导与火气。',
    growth: '权杖能量最突出，成长入口在于唤回动力而非继续迟疑。',
  },
  cups: {
    general: '圣杯能量最浓，说明这次提问真正牵动的是情绪与关系感受。',
    love: '圣杯能量最浓，爱情议题里情绪流动与亲密需求是核心答案。',
    career: '圣杯能量最浓，说明工作抉择与价值认同、归属感密切相关。',
    relationships: '圣杯能量最浓，人际层面的支持、共鸣与失落感都被放大了。',
    growth: '圣杯能量最浓，成长关键在于允许感受浮现并被理解。',
  },
  swords: {
    general: '宝剑能量最强，代表你需要靠清晰判断而非情绪惯性前进。',
    love: '宝剑能量最强，说明爱情议题里真正的卡点在于认知与沟通。',
    career: '宝剑能量最强，事业判断要建立在事实、策略和优先级之上。',
    relationships: '宝剑能量最强，互动中的界线、误解与说话方式必须被处理。',
    growth: '宝剑能量最强，这次成长更像一次认知校准与内心切割。',
  },
  pentacles: {
    general: '星币能量最强，说明实际条件与资源结构会决定答案的落点。',
    love: '星币能量最强，关系能否走远取决于现实承接与长期稳定性。',
    career: '星币能量最强，事业上要以稳定积累、资源配置和执行落地为先。',
    relationships: '星币能量最强，人际问题需要回到可靠度和真实支持层面。',
    growth: '星币能量最强，成长需要被写进日常习惯和身体节奏里。',
  },
}

const ADVICE_LIBRARY: Record<string, string> = {
  act: '别只停留在设想里，把想法拆成一个今天就能开始的动作。',
  adapt: '顺着新变化调整姿态，比执着于旧剧本更容易迎来转机。',
  balance: '先让投入、情绪和现实安排回到平衡，再推进下一步。',
  boundaries: '看清哪些责任属于你，哪些不属于你，边界会让答案更干净。',
  clarity: '把问题写得更具体、把标准说得更清楚，局势会立刻明朗一些。',
  collaborate: '主动寻求协作或反馈，外部视角会帮你补齐盲点。',
  communicate: '不要猜，用更直接、更温柔的方式说出真实需求。',
  complete: '把拖着没收尾的部分认真结案，新的篇章才会真正开启。',
  courage: '保留谨慎，但不要让犹豫接管方向感。',
  decide: '把取舍说清楚，你才会知道自己真正愿意承担什么。',
  discipline: '规律、节奏与持续投入，比一时冲劲更有力量。',
  focus: '收束分散的能量，只保留最重要的一条推进线。',
  ground: '让身体、时间和资源先站稳，情绪才不会把你卷走。',
  heal: '先照顾受伤与疲惫的部分，再谈更长远的行动。',
  learn: '参考成熟经验或可信的建议，不必什么都独自摸索。',
  observe: '先看、先听、先辨认讯号，不急着马上下结论。',
  patience: '把节奏放慢半拍，真正适合你的东西不会因耐心而错过。',
  receive: '允许帮助、爱意和支持进入，不要只习惯一个人扛着。',
  release: '主动放下已经过期的执念、角色或期待，空间才会出现。',
  rest: '短暂停顿不是后退，而是在避免耗尽自己。',
  'self-honesty': '把你真正害怕的、真正想要的说给自己听，答案会更接近。',
  'start-small': '先从最小可行动作开始，别等所有条件完美才迈步。',
  strategy: '先定策略，再定速度，聪明布局比硬冲更有效。',
  trust: '相信直觉给出的第一反应，同时用现实去验证它。',
}

const getSpread = (spreadId: string) => {
  const spread = SPREADS.find((item) => item.id === spreadId)

  if (!spread) {
    throw new Error(`Unknown spread: ${spreadId}`)
  }

  return spread
}

export const drawCards = (
  spread: SpreadDefinition,
  random: () => number = Math.random,
): DrawnCard[] => {
  const pool = [...TAROT_DECK]

  return spread.positions.map((position) => {
    const cardIndex = Math.floor(random() * pool.length)
    const [card] = pool.splice(cardIndex, 1)

    return {
      cardId: card.id,
      orientation: random() >= 0.5 ? 'up' : 'down',
      positionKey: position.key,
    }
  })
}

export const createReading = (
  input: ReadingInput,
  options: ReadingOptions = {},
): ReadingResult => {
  const spread = getSpread(input.spreadId)
  const random =
    options.random ??
    (options.seed !== undefined ? createSeededRandom(options.seed) : Math.random)

  const cards = drawCards(spread, random).map((drawn) =>
    createCardView(spread, drawn),
  )

  return {
    input,
    spread,
    cards,
    positionReadings: cards.map((entry) => buildPositionReading(entry, input.topic)),
    summary: buildSummary(cards, input),
    advice: buildAdvice(cards),
    tone: buildTone(cards),
    dominantSignals: buildDominantSignals(cards, input.topic),
  }
}

const createCardView = (
  spread: SpreadDefinition,
  drawn: DrawnCard,
): ReadingCardView => {
  const position = spread.positions.find((entry) => entry.key === drawn.positionKey)

  if (!position) {
    throw new Error(`Unknown spread position: ${drawn.positionKey}`)
  }

  return {
    drawn,
    card: CARD_BY_ID[drawn.cardId],
    art: CARD_ART_MANIFEST[drawn.cardId],
    positionLabel: position.label,
    prompt: position.prompt,
  }
}

const buildPositionReading = (entry: ReadingCardView, topic: TopicId) => {
  const suitLine =
    entry.card.arcana === 'major'
      ? '这张大阿尔卡那说明此处牵动的是阶段性课题，而不是短暂波动。'
      : SUIT_LENSES[entry.card.suit][topic]
  const orientationLine =
    entry.drawn.orientation === 'up'
      ? '正位让这股力量能更直接地显形。'
      : '逆位表示这股力量需要先回收、修整或换一种方式表达。'

  return {
    positionKey: entry.drawn.positionKey,
    label: entry.positionLabel,
    prompt: entry.prompt,
    cardId: entry.card.id,
    cardName: `${entry.card.nameZh} · ${
      entry.drawn.orientation === 'up' ? '正位' : '逆位'
    }`,
    orientation: entry.drawn.orientation,
    message: `${entry.positionLabel}位关注${entry.prompt}。${
      entry.card.meaning[entry.drawn.orientation]
    }${suitLine}${orientationLine}${TOPIC_BY_ID[topic].framing}`,
    keywords:
      entry.drawn.orientation === 'up'
        ? entry.card.keywords.up.slice(0, 3)
        : entry.card.keywords.down.slice(0, 3),
  }
}

const buildTone = (cards: ReadingCardView[]) => {
  const reversedCount = cards.filter((entry) => entry.drawn.orientation === 'down').length
  const majorCount = cards.filter((entry) => entry.card.arcana === 'major').length
  const dominantSuit = getDominantSuit(cards)

  if (reversedCount >= Math.ceil(cards.length / 2)) {
    return '内省整顿'
  }

  if (majorCount >= Math.ceil(cards.length / 2)) {
    return '命运转折'
  }

  if (dominantSuit === 'cups') {
    return '情绪流动'
  }

  if (dominantSuit === 'wands') {
    return '主动推进'
  }

  if (dominantSuit === 'swords') {
    return '锋利辨析'
  }

  if (dominantSuit === 'pentacles') {
    return '稳步成形'
  }

  return '静中有进'
}

const buildDominantSignals = (cards: ReadingCardView[], topic: TopicId) => {
  const signals = [`主题：${TOPIC_BY_ID[topic].label}`, `气质：${buildTone(cards)}`]
  const majorCount = cards.filter((entry) => entry.card.arcana === 'major').length
  const reversedCount = cards.filter((entry) => entry.drawn.orientation === 'down').length
  const dominantSuit = getDominantSuit(cards)

  if (majorCount > 0) {
    signals.push(
      majorCount >= Math.ceil(cards.length / 2)
        ? '大阿尔卡那主导'
        : '出现关键转折牌',
    )
  }

  if (dominantSuit) {
    signals.push(
      dominantSuit === 'cups'
        ? '圣杯能量偏强'
        : dominantSuit === 'wands'
          ? '权杖能量偏强'
          : dominantSuit === 'swords'
            ? '宝剑能量偏强'
            : '星币能量偏强',
    )
  }

  if (reversedCount >= Math.ceil(cards.length / 2)) {
    signals.push('逆位较多')
  }

  return signals
}

const buildSummary = (cards: ReadingCardView[], input: ReadingInput) => {
  const tone = buildTone(cards)
  const reversedCount = cards.filter((entry) => entry.drawn.orientation === 'down').length
  const majorCount = cards.filter((entry) => entry.card.arcana === 'major').length
  const dominantSuit = getDominantSuit(cards)
  const parts = [
    `围绕「${input.question}」，在${TOPIC_BY_ID[input.topic].label}议题下，这组牌整体呈现出${tone}的底色。`,
  ]

  if (majorCount >= Math.ceil(cards.length / 2)) {
    parts.push('大阿尔卡那占比较高，说明这次提问触及长期课题与阶段性转折。')
  } else if (majorCount > 0) {
    parts.push('牌阵中出现的大阿尔卡那提示你已经站在关键节点。')
  }

  if (dominantSuit) {
    parts.push(SUIT_SUMMARIES[dominantSuit][input.topic])
  }

  if (reversedCount === 0) {
    parts.push('顺位流动很完整，只要方向明确，局势就会较顺畅地推进。')
  } else if (reversedCount >= Math.ceil(cards.length / 2)) {
    parts.push('逆位偏多，表示答案并不在更快行动，而在先整理内在节奏与卡点。')
  } else {
    parts.push('顺逆位交错，说明外部条件可推进，但内部仍需细致校准。')
  }

  return parts.join('')
}

const buildAdvice = (cards: ReadingCardView[]) => {
  const uniqueTags = Array.from(new Set(cards.flatMap((entry) => entry.card.adviceTags)))
  const advice = uniqueTags
    .map((tag) => ADVICE_LIBRARY[tag])
    .filter(Boolean)
    .slice(0, 3)

  if (advice.length < 3) {
    advice.push('把牌面当成提醒，而不是命令，答案仍需要你亲自去验证。')
  }

  return advice
}

const getDominantSuit = (cards: ReadingCardView[]): MinorSuit | null => {
  const suitCounts = cards.reduce<Record<MinorSuit, number>>(
    (accumulator, entry) => {
      if (entry.card.suit !== null) {
        accumulator[entry.card.suit] += 1
      }

      return accumulator
    },
    { wands: 0, cups: 0, swords: 0, pentacles: 0 },
  )

  const [dominantSuit, count] = Object.entries(suitCounts).sort(
    (left, right) => right[1] - left[1],
  )[0]

  return count > 0 ? (dominantSuit as MinorSuit) : null
}
