import { CARD_ART_MANIFEST } from '../data/artManifest'
import { CARD_BY_ID, TAROT_DECK } from '../data/cards'
import { SPREADS } from '../data/spreads'
import { TOPIC_BY_ID } from '../data/topics'
import type {
  ActionPlanStep,
  DrawPool,
  DrawnCard,
  ElementalDynamics,
  InterpretationMeta,
  InterpretationRuleTag,
  OrientationMode,
  ReadingCardView,
  ReadingDepthLevel,
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
  orientationMode?: OrientationMode
}

type MinorSuit = Exclude<Suit, null>

interface QueryGuardResult {
  flags: string[]
  softenedForSafety: boolean
}

interface InterpretationBuildResult {
  meta: InterpretationMeta
  positionRuleTags: Record<string, InterpretationRuleTag[]>
}

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

const TOPIC_ACTION_FOCUS: Record<TopicId, string> = {
  general: '把最重要的一条主线行动写下来，并在 72 小时内执行一次小实验。',
  love: '优先处理沟通质量与边界表达，再决定关系下一步。',
  career: '先明确目标与标准，再按节奏推进关键执行动作。',
  relationships: '先厘清互动边界与误解来源，再决定投入强度。',
  growth: '把内在洞察转化成可重复的日常动作，避免只停留在感受层。',
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

const SENSITIVE_QUERY_PATTERNS: Array<{ flag: string; pattern: RegExp }> = [
  { flag: 'medical', pattern: /(确诊|病|癌|手术|药|治疗|怀孕|流产|抑郁|自杀)/i },
  { flag: 'legal', pattern: /(起诉|离婚判决|合同纠纷|刑事|法律责任|坐牢)/i },
  { flag: 'death', pattern: /(死亡|会不会死|寿命|什么时候死)/i },
  { flag: 'forced-decision', pattern: /(该不该|必须选|A还是B|帮我决定|替我决定)/i },
]

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
  orientationMode: OrientationMode = 'random',
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
      orientation: orientationMode === 'up-only' ? 'up' : random() >= 0.5 ? 'up' : 'down',
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
  const cards = drawCards(spread, random, options.orientationMode).map((drawn) =>
    createCardView(spread, drawn),
  )
  const interpretationBuild = buildInterpretation(cards, input)
  const tone = buildTone(cards)
  const dominantSignals = buildDominantSignals(cards, input.topic, interpretationBuild.meta)

  return {
    input,
    spread,
    cards,
    positionReadings: cards.map((entry) =>
      buildPositionReading(
        entry,
        input.topic,
        interpretationBuild.positionRuleTags[entry.drawn.positionKey] ?? [],
      ),
    ),
    summary: buildSummary(cards, input, spread, tone, interpretationBuild.meta),
    advice: buildAdvice(cards, input.topic, interpretationBuild.meta),
    actionPlan: buildActionPlan(cards, interpretationBuild.meta),
    tone,
    dominantSignals,
    depthLevel: resolveDepthLevel(cards, interpretationBuild.meta),
    interpretation: interpretationBuild.meta,
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

const analyzeQuery = (question: string): QueryGuardResult => {
  const flags = SENSITIVE_QUERY_PATTERNS.filter((entry) => entry.pattern.test(question)).map(
    (entry) => entry.flag,
  )

  return {
    flags,
    softenedForSafety: flags.length > 0,
  }
}

const buildInterpretation = (
  cards: ReadingCardView[],
  input: ReadingInput,
): InterpretationBuildResult => {
  const queryGuard = analyzeQuery(input.question)
  const positionTagSets: Record<string, Set<InterpretationRuleTag>> = Object.fromEntries(
    cards.map((card) => [card.drawn.positionKey, new Set<InterpretationRuleTag>()]),
  )
  const conflicts: string[] = []
  const harmonies: string[] = []
  const ruleHits = new Set<string>()

  cards.forEach((entry) => {
    const tags = positionTagSets[entry.drawn.positionKey]

    if (entry.drawn.orientation === 'down') {
      tags.add('Internalized')
      ruleHits.add('R_REV_01')
    }

    if (entry.card.arcana === 'major') {
      tags.add('Major_Archetype')
      ruleHits.add('R_ARC_01')
    }
  })

  for (let index = 0; index < cards.length - 1; index += 1) {
    const left = cards[index]
    const right = cards[index + 1]
    const interaction = getElementInteraction(left.card.suit, right.card.suit)

    if (interaction === 'conflict') {
      positionTagSets[left.drawn.positionKey].add('Conflict')
      positionTagSets[right.drawn.positionKey].add('Conflict')
      conflicts.push(`${left.positionLabel}与${right.positionLabel}存在元素冲突`)
      ruleHits.add('R_ELM_01')
    }

    if (interaction === 'harmony') {
      positionTagSets[left.drawn.positionKey].add('Harmony')
      positionTagSets[right.drawn.positionKey].add('Harmony')
      harmonies.push(`${left.positionLabel}与${right.positionLabel}形成协同`)
      ruleHits.add('R_ELM_03')
    }
  }

  const elementalDynamics = getElementalDynamics(cards)

  if (elementalDynamics.missing.length > 0) {
    ruleHits.add('R_ELM_02')
    cards.forEach((entry) => {
      positionTagSets[entry.drawn.positionKey].add('Element_Weak')
    })
  }

  if (elementalDynamics.dominant !== null) {
    ruleHits.add('R_ELM_04')
    cards.forEach((entry) => {
      if (entry.card.suit === elementalDynamics.dominant) {
        positionTagSets[entry.drawn.positionKey].add('Element_Strength')
      }
    })
  }

  if (queryGuard.softenedForSafety) {
    ruleHits.add('R_VAL_SOFTEN')
  }

  const depthSignals = buildDepthSignals(
    cards,
    elementalDynamics,
    conflicts,
    harmonies,
    queryGuard,
  )

  return {
    meta: {
      depthSignals,
      ruleHits: Array.from(ruleHits),
      queryFlags: queryGuard.flags,
      softenedForSafety: queryGuard.softenedForSafety,
      elementalDynamics: {
        ...elementalDynamics,
        conflicts,
        harmonies,
      },
    },
    positionRuleTags: Object.fromEntries(
      Object.entries(positionTagSets).map(([key, value]) => [key, Array.from(value)]),
    ),
  }
}

const buildDepthSignals = (
  cards: ReadingCardView[],
  elementalDynamics: ElementalDynamics,
  conflicts: string[],
  harmonies: string[],
  queryGuard: QueryGuardResult,
) => {
  const signals: string[] = []
  const majorCount = cards.filter((entry) => entry.card.arcana === 'major').length

  if (majorCount > 0) {
    signals.push(
      majorCount >= Math.ceil(cards.length / 2) ? '原型力量主导' : '出现关键原型牌',
    )
  }

  if (elementalDynamics.dominant) {
    signals.push(`主导元素：${formatSuitLabel(elementalDynamics.dominant)}`)
  }

  if (elementalDynamics.missing.length > 0) {
    signals.push(
      `缺失元素：${elementalDynamics.missing.map((item) => formatSuitLabel(item)).join('、')}`,
    )
  }

  if (conflicts.length > 0) {
    signals.push('牌阵存在元素冲突')
  } else if (harmonies.length > 0) {
    signals.push('牌阵存在元素协同')
  }

  if (queryGuard.softenedForSafety) {
    signals.push('高风险问题已触发安全降权')
  }

  return signals
}

const getElementInteraction = (left: Suit, right: Suit): 'conflict' | 'harmony' | 'neutral' => {
  if (!left || !right) {
    return 'neutral'
  }

  if (left === right) {
    return 'harmony'
  }

  const pair = [left, right].sort().join('-')

  if (pair === 'cups-wands' || pair === 'pentacles-swords') {
    return 'conflict'
  }

  if (pair === 'swords-wands' || pair === 'cups-pentacles') {
    return 'harmony'
  }

  return 'neutral'
}

const getElementalDynamics = (cards: ReadingCardView[]): ElementalDynamics => {
  const suitCounts = cards.reduce<Record<MinorSuit, number>>(
    (accumulator, entry) => {
      if (entry.card.suit !== null) {
        accumulator[entry.card.suit] += 1
      }

      return accumulator
    },
    { wands: 0, cups: 0, swords: 0, pentacles: 0 },
  )

  const dominantEntry = Object.entries(suitCounts).sort((left, right) => right[1] - left[1])[0]
  const dominant = dominantEntry[1] > 0 ? (dominantEntry[0] as MinorSuit) : null
  const missing = (Object.entries(suitCounts) as Array<[MinorSuit, number]>)
    .filter(([, count]) => count === 0)
    .map(([suit]) => suit)

  return {
    dominant,
    missing,
    conflicts: [],
    harmonies: [],
  }
}

const buildPositionReading = (
  entry: ReadingCardView,
  topic: TopicId,
  ruleTags: InterpretationRuleTag[],
) => {
  const suitLine =
    entry.card.arcana === 'major'
      ? '这张大阿尔卡那说明此处牵动的是阶段性课题，而不是短暂波动。'
      : SUIT_LENSES[entry.card.suit][topic]
  const orientationLine =
    entry.drawn.orientation === 'up'
      ? '正位让这股力量更直接地显形。'
      : '逆位在这里更像能量内化或暂时受阻，需要先整理再推进。'
  const dynamicLine = getDynamicLine(ruleTags)

  return {
    positionKey: entry.drawn.positionKey,
    label: entry.positionLabel,
    prompt: entry.prompt,
    cardId: entry.card.id,
    cardName: `${entry.card.nameZh} · ${entry.drawn.orientation === 'up' ? '正位' : '逆位'}`,
    orientation: entry.drawn.orientation,
    message: `${entry.positionLabel}位关注${entry.prompt}。${entry.card.meaning[entry.drawn.orientation]}${suitLine}${orientationLine}${dynamicLine}${TOPIC_BY_ID[topic].framing}`,
    keywords:
      entry.drawn.orientation === 'up'
        ? entry.card.keywords.up.slice(0, 3)
        : entry.card.keywords.down.slice(0, 3),
    ruleTags,
  }
}

const getDynamicLine = (ruleTags: InterpretationRuleTag[]) => {
  if (ruleTags.includes('Conflict')) {
    return '这张牌与相邻牌之间存在元素冲突，提示你需要先处理内部拉扯。'
  }

  if (ruleTags.includes('Harmony')) {
    return '这张牌与相邻牌之间形成协同，说明当前有可借力的顺势窗口。'
  }

  if (ruleTags.includes('Element_Weak')) {
    return '牌阵里有关键元素缺位，提示你需要主动补齐某个被忽略的维度。'
  }

  return ''
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

const buildDominantSignals = (
  cards: ReadingCardView[],
  topic: TopicId,
  interpretation: InterpretationMeta,
) => {
  const signals = [`主题：${TOPIC_BY_ID[topic].label}`, `气质：${buildTone(cards)}`]
  const majorCount = cards.filter((entry) => entry.card.arcana === 'major').length
  const reversedCount = cards.filter((entry) => entry.drawn.orientation === 'down').length
  const dominantSuit = getDominantSuit(cards)

  if (majorCount > 0) {
    signals.push(
      majorCount >= Math.ceil(cards.length / 2) ? '大阿尔卡那主导' : '出现关键转折牌',
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

  return Array.from(new Set([...signals, ...interpretation.depthSignals])).slice(0, 8)
}

const buildSummary = (
  cards: ReadingCardView[],
  input: ReadingInput,
  spread: ResolvedSpreadDefinition,
  tone: string,
  interpretation: InterpretationMeta,
) => {
  const reversedCount = cards.filter((entry) => entry.drawn.orientation === 'down').length
  const majorCount = cards.filter((entry) => entry.card.arcana === 'major').length
  const dominantSuit = getDominantSuit(cards)
  const parts = [
    `围绕「${input.question}」，在${TOPIC_BY_ID[input.topic].label}议题下，这组${spread.title}${spread.activeVariantTitle ? ` · ${spread.activeVariantTitle}` : ''}呈现出${tone}的基调。`,
  ]

  if (majorCount >= Math.ceil(cards.length / 2)) {
    parts.push('大阿尔卡那占比较高，说明这次不只是表层事件，而是阶段性的原型课题在推动你。')
  } else if (majorCount > 0) {
    parts.push('牌阵中的大阿尔卡那提示你已经站在关键节点，选择会影响后续轨迹。')
  }

  if (dominantSuit) {
    parts.push(SUIT_SUMMARIES[dominantSuit][input.topic])
  }

  if (interpretation.elementalDynamics.conflicts.length > 0) {
    parts.push('牌阵显示出元素冲突，当前真正的难点不是“没有路”，而是内在动力与现实节奏还未对齐。')
  } else if (interpretation.elementalDynamics.harmonies.length > 0) {
    parts.push('牌阵存在元素协同，说明你手上已经有可被调动的顺势资源。')
  }

  if (interpretation.elementalDynamics.missing.length > 0) {
    parts.push(
      `你目前最容易忽略的维度是${interpretation.elementalDynamics.missing
        .map((entry) => formatSuitLabel(entry))
        .join('、')}，补齐这部分通常比强行加速更有效。`,
    )
  }

  if (reversedCount === 0) {
    parts.push('顺位流动较完整，重点是保持方向一致，不要被短期噪音带偏。')
  } else if (reversedCount >= Math.ceil(cards.length / 2)) {
    parts.push('逆位偏多，当前更适合先整理内部卡点，再推进外部动作。')
  } else {
    parts.push('顺逆位交错，外部机会可推进，但内部仍需要更细致的校准。')
  }

  parts.push(TOPIC_ACTION_FOCUS[input.topic])

  if (interpretation.softenedForSafety) {
    parts.push('这个问题触及高风险决策语境，塔罗更适合帮助你看清状态与行动选项，而不是替你做结论性决定。')
  }

  return parts.join('')
}

const buildAdvice = (
  cards: ReadingCardView[],
  topic: TopicId,
  interpretation: InterpretationMeta,
) => {
  const uniqueTags = Array.from(new Set(cards.flatMap((entry) => entry.card.adviceTags)))
  const advice = uniqueTags
    .map((tag) => ADVICE_LIBRARY[tag])
    .filter(Boolean)
    .slice(0, 2)

  if (interpretation.elementalDynamics.conflicts.length > 0) {
    advice.push('先处理拉扯最大的冲突点，再做下一步决定，能显著减少反复。')
  } else if (interpretation.elementalDynamics.missing.length > 0) {
    advice.push(
      `有意识补齐${interpretation.elementalDynamics.missing
        .map((entry) => formatSuitLabel(entry))
        .join('、')}相关行动，会提升整体推进质量。`,
    )
  }

  if (advice.length < 3) {
    advice.push(TOPIC_ACTION_FOCUS[topic])
  }

  if (interpretation.softenedForSafety) {
    advice[2] = '涉及高风险议题时，请把塔罗作为自我校准工具，并结合现实中的专业支持与事实判断。'
  }

  return advice.slice(0, 3)
}

const buildActionPlan = (cards: ReadingCardView[], interpretation: InterpretationMeta) => {
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
    .slice(0, 2)

  if (interpretation.elementalDynamics.conflicts.length > 0) {
    plan.push({
      id: 'step-conflict-reconcile',
      title: '先解冲突再推进',
      detail: '先处理最明显的内外部冲突，再启动下一步行动，避免重复消耗。',
    })
  } else if (interpretation.elementalDynamics.missing.length > 0) {
    plan.push({
      id: 'step-element-balance',
      title: '补齐缺失维度',
      detail: `针对${interpretation.elementalDynamics.missing
        .map((entry) => formatSuitLabel(entry))
        .join('、')}设计一个可执行动作，平衡整体节奏。`,
    })
  }

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

  return [...plan, ...fallbackPlan].slice(0, 3)
}

const resolveDepthLevel = (
  cards: ReadingCardView[],
  interpretation: InterpretationMeta,
): ReadingDepthLevel => {
  if (cards.length >= 3 && interpretation.ruleHits.length >= 3) {
    return 'deep'
  }

  if (interpretation.ruleHits.length >= 1) {
    return 'standard'
  }

  return 'shallow'
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

const formatSuitLabel = (suit: MinorSuit) => {
  if (suit === 'wands') {
    return '火（权杖）'
  }

  if (suit === 'cups') {
    return '水（圣杯）'
  }

  if (suit === 'swords') {
    return '风（宝剑）'
  }

  return '土（星币）'
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
