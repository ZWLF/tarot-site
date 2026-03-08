import { CARD_ART_MANIFEST } from '../data/artManifest'
import { CARD_BY_ID, TAROT_DECK } from '../data/cards'
import { SPREADS } from '../data/spreads'
import { TOPIC_BY_ID } from '../data/topics'
import type {
  ActionPlanStep,
  DrawPool,
  DrawnCard,
  ReadingCardView,
  ReadingInput,
  ReadingResult,
  ResolvedSpreadDefinition,
  SpreadPosition,
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
    general: '权杖让答案回到行动、热度与主动推进。',
    love: '权杖说明关系中的回应速度、主动性与表达力度很关键。',
    career: '权杖强调事业推进靠执行力、发起性和节奏感破局。',
    relationships: '权杖指出互动中的火气、主导权与界线需要整理。',
    growth: '权杖提醒你，成长的关键在于重新点燃生命力。',
  },
  cups: {
    general: '圣杯把议题带回感受、连接与情绪安顿。',
    love: '圣杯把亲密需求、关系流动与真实感受放到台前。',
    career: '圣杯表示工作判断不能只看结果，也要看认同感。',
    relationships: '圣杯强调共情、误解与情感边界是当前核心。',
    growth: '圣杯提示成长从感受自己开始。',
  },
  swords: {
    general: '宝剑让问题回到判断、真相与边界。',
    love: '宝剑指出关系里需要优先处理沟通方式与认知落差。',
    career: '宝剑说明职场课题集中在决策、信息辨别与压力管理。',
    relationships: '宝剑让你看见误会、防御与话语方式如何塑造互动。',
    growth: '宝剑提醒成长也需要清醒切开旧模式。',
  },
  pentacles: {
    general: '星币把议题落回现实基础、资源与可持续性。',
    love: '星币说明关系的稳定发展离不开时间、承诺与现实安排。',
    career: '星币强调事业上的资源积累、结果兑现与长期布局。',
    relationships: '星币指出人际关系的关键在于可靠度与现实支持。',
    growth: '星币让你把成长写进日常习惯与身体节奏里。',
  },
}

const SUIT_SUMMARIES: Record<MinorSuit, Record<TopicId, string>> = {
  wands: {
    general: '权杖能量突出，局势需要更果断的行动推进。',
    love: '权杖能量突出，爱情议题里最重要的是热度与主动。',
    career: '权杖能量突出，事业推进的关键是拿回主动权。',
    relationships: '权杖能量突出，说明关系里有明显张力与火气。',
    growth: '权杖能量突出，成长入口在于唤回动力。',
  },
  cups: {
    general: '圣杯能量最浓，这次提问真正牵动的是情绪与关系感受。',
    love: '圣杯能量最浓，情绪流动与亲密需求是核心答案。',
    career: '圣杯能量最浓，说明工作抉择与认同感密切相关。',
    relationships: '圣杯能量最浓，人际层面的共鸣与失落都被放大了。',
    growth: '圣杯能量最浓，成长关键在于允许感受浮现。',
  },
  swords: {
    general: '宝剑能量最强，代表你需要靠清晰判断前进。',
    love: '宝剑能量最强，真正的卡点在于认知与沟通。',
    career: '宝剑能量最强，事业判断要建立在事实与策略上。',
    relationships: '宝剑能量最强，互动中的界线与误解必须被处理。',
    growth: '宝剑能量最强，这次成长更像一次认知校准。',
  },
  pentacles: {
    general: '星币能量最强，实际条件与资源结构会决定答案落点。',
    love: '星币能量最强，关系能否走远取决于现实承接度。',
    career: '星币能量最强，事业上要以稳定积累与落地为先。',
    relationships: '星币能量最强，人际问题需要回到可靠度与支持层面。',
    growth: '星币能量最强，成长需要被写进日常结构里。',
  },
}

const ADVICE_LIBRARY: Record<string, string> = {
  act: '把想法拆成一个今天就能开始的动作。',
  adapt: '顺着新变化调整姿态，比执着旧剧本更容易迎来转机。',
  balance: '先让投入、情绪与现实安排回到平衡。',
  boundaries: '看清哪些责任属于你，哪些不属于你。',
  clarity: '把问题写得更具体、把标准说得更清楚。',
  collaborate: '主动寻求一个可信的外部反馈。',
  communicate: '用更直接、更温柔的方式说出真实需求。',
  complete: '把拖着未收尾的部分认真结案。',
  courage: '保留谨慎，但不要让犹豫接管方向感。',
  decide: '把取舍写清楚，帮助自己真正做出选择。',
  discipline: '规律与节奏比一时冲劲更有力量。',
  focus: '只保留最重要的一条推进线。',
  ground: '让身体、时间与资源先站稳。',
  heal: '先照顾受伤与疲惫的部分。',
  learn: '借用成熟经验，不必凡事独自摸索。',
  observe: '先看、先听、先辨认信号。',
  patience: '把节奏放慢半拍，适合你的不会因耐心而错过。',
  lead: '先定方向、边界与节奏，再去推进事情。',
  receive: '允许帮助、爱意与支持进入。',
  release: '主动放下已经过期的执念或安排。',
  rest: '短暂停顿不是后退，而是在避免耗尽自己。',
  'self-honesty': '把你真正害怕的和真正想要的说给自己听。',
  'start-small': '先从最小可行动作开始。',
  strategy: '先定策略，再定速度。',
  trust: '相信直觉给出的第一反应，再用现实去验证。',
}

const ACTION_PLAN_LIBRARY: Record<
  string,
  Pick<ActionPlanStep, 'title' | 'detail'>
> = {
  act: {
    title: '先迈出一个最小动作',
    detail: '把抽象判断落成一个当天就能执行的小动作。',
  },
  adapt: {
    title: '为变化预留调整空间',
    detail: '记录正在变化的条件，允许自己依据新信息修正计划。',
  },
  balance: {
    title: '先校准投入与节奏',
    detail: '检查情绪、时间和资源分配，避免在失衡状态下继续加码。',
  },
  boundaries: {
    title: '明确你的边界',
    detail: '分清哪些责任属于你，再决定下一步回应方式。',
  },
  clarity: {
    title: '把问题说得更具体',
    detail: '把目标、标准和顾虑写清楚，让行动更稳。',
  },
  communicate: {
    title: '说出真实需求',
    detail: '试着用直接而温和的方式表达你的期待与顾虑。',
  },
  focus: {
    title: '只保留一条主推进线',
    detail: '收拢分散的注意力，把最值得推进的一件事放到最前面。',
  },
  ground: {
    title: '先稳住现实基础',
    detail: '优先处理身体、睡眠、时间和资源。',
  },
  heal: {
    title: '照顾受伤与疲惫',
    detail: '给修复留出窗口，再处理更复杂的关系或选择。',
  },
  observe: {
    title: '先观察再下判断',
    detail: '暂停立刻给结论的冲动，先收集更多信号与事实。',
  },
  strategy: {
    title: '先布好策略再加速',
    detail: '先想清楚路线和优先级，再决定速度。',
  },
  trust: {
    title: '让直觉和现实对齐',
    detail: '记录第一反应，再用一个现实动作去验证它。',
  },
}

const getSpread = (spreadId: string) => {
  const spread = SPREADS.find((item) => item.id === spreadId)

  if (!spread) {
    throw new Error(`Unknown spread: ${spreadId}`)
  }

  return spread
}

const resolveSpread = (
  spreadId: string,
  variantId?: string,
): ResolvedSpreadDefinition => {
  const spread = getSpread(spreadId)
  const variant =
    variantId !== undefined
      ? spread.variants?.find((entry) => entry.id === variantId)
      : spread.variants?.[0]

  if (variantId !== undefined && !variant) {
    throw new Error(`Unknown spread variant: ${spreadId}/${variantId}`)
  }

  return {
    id: spread.id,
    title: spread.title,
    description: spread.description,
    cardCount: spread.cardCount,
    layoutId: spread.layoutId,
    summaryFrame: spread.summaryFrame,
    positions: variant?.positions ?? spread.positions,
    activeVariantId: variant?.id,
    activeVariantTitle: variant?.title,
  }
}

const filterPool = (pool: DrawPool | undefined, cards = TAROT_DECK) => {
  if (!pool || pool === 'any') {
    return cards
  }

  if (pool === 'major') {
    return cards.filter((card) => card.arcana === 'major')
  }

  return cards.filter((card) => card.suit === pool)
}

export const drawCards = (
  spread: ResolvedSpreadDefinition,
  random: () => number = Math.random,
): DrawnCard[] => {
  const availableCards = [...TAROT_DECK]

  return spread.positions.map((position) => {
    const pool = filterPool(position.drawPool, availableCards)
    const source = pool.length > 0 ? pool : availableCards
    const cardIndex = Math.floor(random() * source.length)
    const card = source[cardIndex]
    const availableIndex = availableCards.findIndex((entry) => entry.id === card.id)

    availableCards.splice(availableIndex, 1)

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
  const spread = resolveSpread(input.spreadId, input.variantId)
  const random =
    options.random ??
    (options.seed !== undefined ? createSeededRandom(options.seed) : Math.random)
  const cards = drawCards(spread, random).map((drawn) => createCardView(spread, drawn))

  return {
    input,
    spread,
    cards,
    positionReadings: cards.map((entry) => buildPositionReading(entry, input.topic)),
    summary: buildSummary(cards, input, spread),
    advice: buildAdvice(cards),
    actionPlan: buildActionPlan(cards),
    tone: buildTone(cards),
    dominantSignals: buildDominantSignals(cards, input.topic),
  }
}

const createCardView = (
  spread: ResolvedSpreadDefinition,
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
      ? '正位让这股力量更直接地显形。'
      : '逆位表示这股力量需要先回收、修整或换一种方式表达。'

  return {
    positionKey: entry.drawn.positionKey,
    label: entry.positionLabel,
    prompt: entry.prompt,
    cardId: entry.card.id,
    cardName: `${entry.card.nameZh} · ${entry.drawn.orientation === 'up' ? '正位' : '逆位'}`,
    orientation: entry.drawn.orientation,
    message: `${entry.positionLabel}位关注${entry.prompt}。${entry.card.meaning[entry.drawn.orientation]}${suitLine}${orientationLine}${TOPIC_BY_ID[topic].framing}`,
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

const buildSummary = (
  cards: ReadingCardView[],
  input: ReadingInput,
  spread: ResolvedSpreadDefinition,
) => {
  const tone = buildTone(cards)
  const reversedCount = cards.filter((entry) => entry.drawn.orientation === 'down').length
  const majorCount = cards.filter((entry) => entry.card.arcana === 'major').length
  const dominantSuit = getDominantSuit(cards)
  const parts = [
    `围绕「${input.question}」，在${TOPIC_BY_ID[input.topic].label}议题下，这组${spread.title}${spread.activeVariantTitle ? ` · ${spread.activeVariantTitle}` : ''}整体呈现出${tone}的底色。`,
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
    parts.push('逆位偏多，答案不在更快行动，而在先整理内在节奏与卡点。')
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

const buildActionPlan = (cards: ReadingCardView[]) => {
  const uniqueTags = Array.from(new Set(cards.flatMap((entry) => entry.card.adviceTags)))
  const plan = uniqueTags
    .map((tag) => {
      const template = ACTION_PLAN_LIBRARY[tag]

      if (!template) {
        return null
      }

      return {
        id: `step-${tag}`,
        title: template.title,
        detail: template.detail,
      }
    })
    .filter((entry): entry is ActionPlanStep => entry !== null)
    .slice(0, 3)

  const fallbackPlan: ActionPlanStep[] = [
    {
      id: 'step-observe',
      title: '先观察当前局势',
      detail: '记录最重要的感受、阻力和外部条件，避免被情绪直接带走。',
    },
    {
      id: 'step-act',
      title: '做一个最小行动实验',
      detail: '选择一个低风险动作，快速验证现在最在意的判断。',
    },
    {
      id: 'step-review',
      title: '在一周内复盘一次',
      detail: '回看新的反馈与变化，再决定继续推进、调整或暂停。',
    },
  ]

  return plan.length === 3 ? plan : [...plan, ...fallbackPlan].slice(0, 3)
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

export const getSpreadPreviewPositions = (
  layoutId: ResolvedSpreadDefinition['layoutId'],
  positions: SpreadPosition[],
) => {
  if (layoutId === 'line-3') {
    return positions.map((position, index) => ({
      key: position.key,
      x: 20 + index * 30,
      y: 50,
    }))
  }

  if (layoutId === 'cross-5') {
    const coords = [
      { x: 50, y: 50 },
      { x: 50, y: 18 },
      { x: 18, y: 50 },
      { x: 82, y: 50 },
      { x: 50, y: 82 },
    ]

    return positions.map((position, index) => ({
      key: position.key,
      ...coords[index],
    }))
  }

  return positions.map((position, index) => ({
    key: position.key,
    x: 16 + (index % 4) * 22,
    y: 18 + Math.floor(index / 4) * 22,
  }))
}
