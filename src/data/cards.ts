import type { TarotCard } from '../domain/tarot'

type MinorSuit = Exclude<TarotCard['suit'], null>

interface MajorSeed {
  id: string
  number: number
  nameZh: string
  nameEn: string
  keywords: TarotCard['keywords']
  meaning: TarotCard['meaning']
  adviceTags: string[]
  elementTags: string[]
}

interface RankConfig {
  slug: string
  labelZh: string
  labelEn: string
  number: number
  upKeywords: string[]
  downKeywords: string[]
  upMeaning: string
  downMeaning: string
  adviceTags: string[]
}

interface SuitConfig {
  labelZh: string
  labelEn: string
  upKeywords: string[]
  downKeywords: string[]
  uprightFrame: string
  reversedFrame: string
  adviceTags: string[]
  elementTags: string[]
}

const majorSeeds: MajorSeed[] = [
  {
    id: 'the-fool',
    number: 0,
    nameZh: '愚者',
    nameEn: 'The Fool',
    keywords: { up: ['起程', '信任', '轻装'], down: ['莽撞', '分心', '失衡'] },
    meaning: {
      up: '新的门已经打开，适合带着好奇和勇气跨出第一步。',
      down: '你并非没有路，而是还缺少边界、准备或专注。',
    },
    adviceTags: ['trust', 'courage', 'clarity'],
    elementTags: ['air', 'spirit'],
  },
  {
    id: 'the-magician',
    number: 1,
    nameZh: '魔术师',
    nameEn: 'The Magician',
    keywords: { up: ['意志', '调动', '实现'], down: ['操控', '虚张', '错配'] },
    meaning: {
      up: '你拥有足够的资源去把想法变成现实，关键在于主动整合。',
      down: '工具虽在手中，但动机、表达或执行方式仍然失焦。',
    },
    adviceTags: ['clarity', 'communicate', 'discipline'],
    elementTags: ['mercury', 'air'],
  },
  {
    id: 'the-high-priestess',
    number: 2,
    nameZh: '女祭司',
    nameEn: 'The High Priestess',
    keywords: { up: ['直觉', '沉潜', '洞察'], down: ['封闭', '迟滞', '压抑'] },
    meaning: {
      up: '答案正在静默处成形，你需要先听见自己的内在感受。',
      down: '你可能把关键感受压得太深，以致无法看清真正的需求。',
    },
    adviceTags: ['observe', 'trust', 'patience'],
    elementTags: ['moon', 'water'],
  },
  {
    id: 'the-empress',
    number: 3,
    nameZh: '皇后',
    nameEn: 'The Empress',
    keywords: { up: ['丰饶', '滋养', '生长'], down: ['过度付出', '停滞', '失衡'] },
    meaning: {
      up: '你正在进入可见的丰盛期，关怀与创造力会带来回报。',
      down: '当滋养只流向外界而忘了自己，结果会变得空耗。',
    },
    adviceTags: ['heal', 'ground', 'receive'],
    elementTags: ['venus', 'earth'],
  },
  {
    id: 'the-emperor',
    number: 4,
    nameZh: '皇帝',
    nameEn: 'The Emperor',
    keywords: { up: ['秩序', '权威', '结构'], down: ['僵化', '控制', '压迫'] },
    meaning: {
      up: '眼下适合建立清晰边界，让局面回到可掌控的结构里。',
      down: '过强的控制欲会让机会失去弹性，也让关系变得紧绷。',
    },
    adviceTags: ['boundaries', 'lead', 'discipline'],
    elementTags: ['aries', 'fire'],
  },
  {
    id: 'the-hierophant',
    number: 5,
    nameZh: '教皇',
    nameEn: 'The Hierophant',
    keywords: { up: ['传统', '承诺', '指引'], down: ['僵化', '盲从', '反叛'] },
    meaning: {
      up: '成熟的经验、制度或师长建议，能帮助你稳住方向。',
      down: '旧有框架若与当下不再契合，就需要重新定义规则。',
    },
    adviceTags: ['learn', 'boundaries', 'self-honesty'],
    elementTags: ['taurus', 'earth'],
  },
  {
    id: 'the-lovers',
    number: 6,
    nameZh: '恋人',
    nameEn: 'The Lovers',
    keywords: { up: ['选择', '共鸣', '连接'], down: ['摇摆', '失配', '分离'] },
    meaning: {
      up: '重要的关系或价值选择正在逼近，你需要真诚地对齐内心。',
      down: '真正的问题不是没有选项，而是不愿面对取舍。',
    },
    adviceTags: ['self-honesty', 'communicate', 'decide'],
    elementTags: ['gemini', 'air'],
  },
  {
    id: 'the-chariot',
    number: 7,
    nameZh: '战车',
    nameEn: 'The Chariot',
    keywords: { up: ['推进', '掌舵', '胜心'], down: ['失控', '拉扯', '躁进'] },
    meaning: {
      up: '局面能够前进，但必须把分散的力量收束到同一方向。',
      down: '你可能一边想冲刺，一边又被内部矛盾拖住了轮轴。',
    },
    adviceTags: ['courage', 'focus', 'discipline'],
    elementTags: ['cancer', 'water'],
  },
  {
    id: 'strength',
    number: 8,
    nameZh: '力量',
    nameEn: 'Strength',
    keywords: { up: ['温柔强韧', '耐性', '驯服'], down: ['自我怀疑', '压抑', '脆弱'] },
    meaning: {
      up: '真正有效的力量来自稳定、自持和温柔地掌控情绪。',
      down: '当你不断否定自己时，再多机会也难以转化为行动。',
    },
    adviceTags: ['courage', 'heal', 'patience'],
    elementTags: ['leo', 'fire'],
  },
  {
    id: 'the-hermit',
    number: 9,
    nameZh: '隐士',
    nameEn: 'The Hermit',
    keywords: { up: ['退一步', '沉思', '寻灯'], down: ['孤立', '停滞', '封闭'] },
    meaning: {
      up: '短暂抽离不是逃避，而是为了找到更真实的答案。',
      down: '过度封闭会让你把可用的帮助挡在门外。',
    },
    adviceTags: ['observe', 'rest', 'self-honesty'],
    elementTags: ['virgo', 'earth'],
  },
  {
    id: 'wheel-of-fortune',
    number: 10,
    nameZh: '命运之轮',
    nameEn: 'Wheel of Fortune',
    keywords: { up: ['转机', '循环', '契机'], down: ['反复', '拖延', '失速'] },
    meaning: {
      up: '局势开始转动，外在时机正把你推向新的章节。',
      down: '如果总用旧习惯回应新局面，就会感觉命运原地打转。',
    },
    adviceTags: ['adapt', 'trust', 'clarity'],
    elementTags: ['jupiter', 'fire'],
  },
  {
    id: 'justice',
    number: 11,
    nameZh: '正义',
    nameEn: 'Justice',
    keywords: { up: ['公平', '衡量', '负责'], down: ['偏差', '逃避', '失衡'] },
    meaning: {
      up: '你需要面对事实、后果和责任，让选择建立在清晰判断上。',
      down: '如果不愿正视现实，结果就会被情绪或偏见拉偏。',
    },
    adviceTags: ['clarity', 'boundaries', 'decide'],
    elementTags: ['libra', 'air'],
  },
  {
    id: 'the-hanged-man',
    number: 12,
    nameZh: '倒吊人',
    nameEn: 'The Hanged Man',
    keywords: { up: ['暂停', '换位', '放下'], down: ['拖着不决', '僵着', '徒耗'] },
    meaning: {
      up: '暂停不是失去，而是给自己一个重看局面的角度。',
      down: '若只是被动拖延而非主动停顿，压力会越积越深。',
    },
    adviceTags: ['rest', 'release', 'observe'],
    elementTags: ['water', 'neptune'],
  },
  {
    id: 'death',
    number: 13,
    nameZh: '死神',
    nameEn: 'Death',
    keywords: { up: ['结束', '蜕变', '更新'], down: ['抗拒改变', '残留', '迟迟不放'] },
    meaning: {
      up: '旧阶段已经走到尽头，腾出空间才会让新生命进入。',
      down: '不是转机没有来，而是你还抓着过期的部分不放。',
    },
    adviceTags: ['release', 'trust', 'self-honesty'],
    elementTags: ['scorpio', 'water'],
  },
  {
    id: 'temperance',
    number: 14,
    nameZh: '节制',
    nameEn: 'Temperance',
    keywords: { up: ['调和', '缓冲', '耐心'], down: ['过量', '失衡', '急于求成'] },
    meaning: {
      up: '最好的答案来自循序调和，而不是立刻走向极端。',
      down: '当节奏失衡或投入过量，局势就会开始失去温度与秩序。',
    },
    adviceTags: ['patience', 'balance', 'heal'],
    elementTags: ['sagittarius', 'fire'],
  },
  {
    id: 'the-devil',
    number: 15,
    nameZh: '恶魔',
    nameEn: 'The Devil',
    keywords: { up: ['执着', '诱惑', '捆绑'], down: ['觉察', '松脱', '戒断'] },
    meaning: {
      up: '眼前的困局往往与欲望、依赖或害怕失去有关。',
      down: '你已经看见束缚的来源，下一步是停止继续喂养它。',
    },
    adviceTags: ['boundaries', 'self-honesty', 'release'],
    elementTags: ['capricorn', 'earth'],
  },
  {
    id: 'the-tower',
    number: 16,
    nameZh: '高塔',
    nameEn: 'The Tower',
    keywords: { up: ['震荡', '真相', '拆解'], down: ['迟来的崩解', '抗拒', '余震'] },
    meaning: {
      up: '看似稳固的部分正在被真相击中，重建从拆除开始。',
      down: '若继续抗拒改变，震荡就会以更突兀的方式降临。',
    },
    adviceTags: ['release', 'clarity', 'ground'],
    elementTags: ['mars', 'fire'],
  },
  {
    id: 'the-star',
    number: 17,
    nameZh: '星星',
    nameEn: 'The Star',
    keywords: { up: ['希望', '疗愈', '信念'], down: ['失望', '空耗', '低潮'] },
    meaning: {
      up: '在经历波动后，新的信心与修复之水已经回到你身边。',
      down: '你需要重新接上希望的源头，而不是只盯着消耗。',
    },
    adviceTags: ['heal', 'trust', 'receive'],
    elementTags: ['aquarius', 'air'],
  },
  {
    id: 'the-moon',
    number: 18,
    nameZh: '月亮',
    nameEn: 'The Moon',
    keywords: { up: ['朦胧', '潜意识', '敏感'], down: ['误解', '幻象消退', '过度投射'] },
    meaning: {
      up: '情绪与想象正在放大，答案尚未完全显露在明面上。',
      down: '迷雾开始散去，但你需要区分直觉与恐惧。',
    },
    adviceTags: ['observe', 'trust', 'clarity'],
    elementTags: ['pisces', 'water'],
  },
  {
    id: 'the-sun',
    number: 19,
    nameZh: '太阳',
    nameEn: 'The Sun',
    keywords: { up: ['明朗', '喜悦', '确认'], down: ['延迟', '过热', '忽略阴影'] },
    meaning: {
      up: '这张牌带来清楚、温暖与公开化的答案，局势倾向正面展开。',
      down: '好消息并未消失，只是还需要处理盲点与过度乐观。',
    },
    adviceTags: ['courage', 'communicate', 'receive'],
    elementTags: ['sun', 'fire'],
  },
  {
    id: 'judgement',
    number: 20,
    nameZh: '审判',
    nameEn: 'Judgement',
    keywords: { up: ['召唤', '复盘', '醒来'], down: ['迟疑', '自责', '回避'] },
    meaning: {
      up: '一个更高层次的决定正在呼唤你，需要你诚实回看来路。',
      down: '你明知该回应，却仍被旧评判和恐惧拖住。',
    },
    adviceTags: ['self-honesty', 'release', 'decide'],
    elementTags: ['pluto', 'fire'],
  },
  {
    id: 'the-world',
    number: 21,
    nameZh: '世界',
    nameEn: 'The World',
    keywords: { up: ['完成', '圆满', '整合'], down: ['未竟', '收尾不足', '卡在门口'] },
    meaning: {
      up: '你正站在阶段完成与向外展开的门槛上，成果即将显现。',
      down: '不是能力不足，而是还有最后一段收尾需要认真完成。',
    },
    adviceTags: ['complete', 'ground', 'receive'],
    elementTags: ['saturn', 'earth'],
  },
]

const rankConfigs: RankConfig[] = [
  { slug: 'ace', labelZh: '王牌', labelEn: 'Ace', number: 1, upKeywords: ['开端', '火种', '机会'], downKeywords: ['迟疑', '未定', '空转'], upMeaning: '新的起点已经出现，适合尽快确认你真正想启动的方向。', downMeaning: '机会仍在，但你还需要把意图和现实条件对齐。', adviceTags: ['start-small', 'clarity'] },
  { slug: 'two', labelZh: '二', labelEn: 'Two', number: 2, upKeywords: ['平衡', '选择', '对照'], downKeywords: ['摇摆', '拉扯', '犹疑'], upMeaning: '两种力量正在对照，你有机会做出更精准的选择。', downMeaning: '如果继续摇摆不定，窗口期会被反复消耗。', adviceTags: ['balance', 'decide'] },
  { slug: 'three', labelZh: '三', labelEn: 'Three', number: 3, upKeywords: ['扩张', '协作', '生长'], downKeywords: ['散乱', '摩擦', '步调不齐'], upMeaning: '事情开始外显，借助合作或交流会放大成果。', downMeaning: '推进受阻往往不是没机会，而是节奏与协作需要重整。', adviceTags: ['collaborate', 'communicate'] },
  { slug: 'four', labelZh: '四', labelEn: 'Four', number: 4, upKeywords: ['安定', '巩固', '停驻'], downKeywords: ['停滞', '保守', '封住'], upMeaning: '此处更适合先稳住结构，让成果有足够的承托。', downMeaning: '若只是守而不动，稳定会逐渐变成停滞。', adviceTags: ['ground', 'rest'] },
  { slug: 'five', labelZh: '五', labelEn: 'Five', number: 5, upKeywords: ['冲突', '变化', '试炼'], downKeywords: ['紧绷', '内耗', '失衡'], upMeaning: '变化已经发生，与其抗拒，不如看清冲突真正逼你学什么。', downMeaning: '若把力气都花在对抗里，问题只会持续发酵。', adviceTags: ['self-honesty', 'boundaries'] },
  { slug: 'six', labelZh: '六', labelEn: 'Six', number: 6, upKeywords: ['支持', '过渡', '回流'], downKeywords: ['失衡', '旧账', '迟迟不走'], upMeaning: '资源、情感或帮助开始回流，你可以借力向前。', downMeaning: '过去未清的部分仍在牵引当下，需要先理顺。', adviceTags: ['receive', 'heal'] },
  { slug: 'seven', labelZh: '七', labelEn: 'Seven', number: 7, upKeywords: ['评估', '策略', '辨别'], downKeywords: ['猜疑', '拖延', '偷逃'], upMeaning: '现在更需要聪明布局，而不是只靠蛮力推进。', downMeaning: '若缺少诚实检视，局势会被怀疑和拖延侵蚀。', adviceTags: ['observe', 'strategy'] },
  { slug: 'eight', labelZh: '八', labelEn: 'Eight', number: 8, upKeywords: ['推进', '专注', '训练'], downKeywords: ['困住', '僵住', '压迫'], upMeaning: '重复练习与专注执行，会让你很快看见变化。', downMeaning: '你以为被外界困住，其实关键往往在内部限制。', adviceTags: ['discipline', 'focus'] },
  { slug: 'nine', labelZh: '九', labelEn: 'Nine', number: 9, upKeywords: ['成熟', '韧性', '临门'], downKeywords: ['疲惫', '焦虑', '戒备'], upMeaning: '你已经走到关键门槛，再撑稳一点就会出现成果。', downMeaning: '长期紧绷会让判断变形，现在需要先照顾自己的容量。', adviceTags: ['rest', 'patience'] },
  { slug: 'ten', labelZh: '十', labelEn: 'Ten', number: 10, upKeywords: ['完成', '负荷', '结果'], downKeywords: ['过重', '崩掉', '收尾困难'], upMeaning: '某个阶段接近收束，成果与压力会同时变得明显。', downMeaning: '负担已经超过合理范围，说明你需要重新分配责任。', adviceTags: ['complete', 'release'] },
  { slug: 'page', labelZh: '侍从', labelEn: 'Page', number: 11, upKeywords: ['消息', '好奇', '试探'], downKeywords: ['幼稚', '飘忽', '失焦'], upMeaning: '新的讯号或学习机会出现，适合用开放心态去试一小步。', downMeaning: '若只停留在想象和试探，事情会缺少真正落地的力度。', adviceTags: ['observe', 'start-small'] },
  { slug: 'knight', labelZh: '骑士', labelEn: 'Knight', number: 12, upKeywords: ['追击', '执行', '奔赴'], downKeywords: ['躁进', '偏执', '失控'], upMeaning: '这股能量很适合推进，但前提是知道自己为何出发。', downMeaning: '速度若脱离方向，只会把你带向更大的偏差。', adviceTags: ['courage', 'focus'] },
  { slug: 'queen', labelZh: '皇后', labelEn: 'Queen', number: 13, upKeywords: ['成熟', '承接', '掌握'], downKeywords: ['过度介入', '敏感', '内耗'], upMeaning: '你已经能稳定承接这一主题，只要继续以成熟方式回应。', downMeaning: '过度吸收情绪或责任，反而会削弱你的判断。', adviceTags: ['boundaries', 'heal'] },
  { slug: 'king', labelZh: '国王', labelEn: 'King', number: 14, upKeywords: ['统筹', '领导', '定盘'], downKeywords: ['专断', '僵硬', '失衡'], upMeaning: '事情需要一位能定盘的人，此刻你应更果断地掌舵。', downMeaning: '若只剩强压而无倾听，结构就会变成负担。', adviceTags: ['lead', 'clarity'] },
]

const suitConfigs: Record<MinorSuit, SuitConfig> = {
  wands: { labelZh: '权杖', labelEn: 'Wands', upKeywords: ['行动', '热情', '意志'], downKeywords: ['冲动', '耗竭', '躁急'], uprightFrame: '它把焦点拉回行动力、热情和个人意志的释放。', reversedFrame: '它提醒你警惕冲动、透支和方向感失焦。', adviceTags: ['courage', 'focus', 'act'], elementTags: ['fire'] },
  cups: { labelZh: '圣杯', labelEn: 'Cups', upKeywords: ['情感', '连接', '感受'], downKeywords: ['压抑', '泛滥', '逃避'], uprightFrame: '它把重心带回情绪流动、共鸣和内在感受。', reversedFrame: '它说明情感能量被堵住，或正在以失衡方式外溢。', adviceTags: ['heal', 'communicate', 'trust'], elementTags: ['water'] },
  swords: { labelZh: '宝剑', labelEn: 'Swords', upKeywords: ['思辨', '判断', '切割'], downKeywords: ['焦虑', '撕裂', '过度思考'], uprightFrame: '它将主题推向判断、界线和真相的辨明。', reversedFrame: '它提醒你留意内耗、误判和思绪过度锋利。', adviceTags: ['clarity', 'boundaries', 'decide'], elementTags: ['air'] },
  pentacles: { labelZh: '星币', labelEn: 'Pentacles', upKeywords: ['现实', '资源', '稳固'], downKeywords: ['匮乏', '迟缓', '散失'], uprightFrame: '它让问题落回现实基础、节奏和可持续资源。', reversedFrame: '它指出现实层面的松动、延宕或资源分配失衡。', adviceTags: ['ground', 'discipline', 'receive'], elementTags: ['earth'] },
}

const createMinorCard = (suit: MinorSuit, rank: RankConfig): TarotCard => {
  const suitConfig = suitConfigs[suit]

  return {
    id: `${rank.slug}-of-${suit}`,
    nameZh: `${suitConfig.labelZh}${rank.labelZh}`,
    nameEn: `${rank.labelEn} of ${suitConfig.labelEn}`,
    arcana: 'minor',
    suit,
    number: rank.number,
    keywords: {
      up: [...rank.upKeywords, ...suitConfig.upKeywords],
      down: [...rank.downKeywords, ...suitConfig.downKeywords],
    },
    meaning: {
      up: `${rank.upMeaning}${suitConfig.uprightFrame}`,
      down: `${rank.downMeaning}${suitConfig.reversedFrame}`,
    },
    adviceTags: [...rank.adviceTags, ...suitConfig.adviceTags],
    elementTags: suitConfig.elementTags,
  }
}

const majorArcana: TarotCard[] = majorSeeds.map((seed) => ({
  id: seed.id,
  nameZh: seed.nameZh,
  nameEn: seed.nameEn,
  arcana: 'major',
  suit: null,
  number: seed.number,
  keywords: seed.keywords,
  meaning: seed.meaning,
  adviceTags: seed.adviceTags,
  elementTags: seed.elementTags,
}))

const minorArcana: TarotCard[] = (
  Object.keys(suitConfigs) as MinorSuit[]
).flatMap((suit) => rankConfigs.map((rank) => createMinorCard(suit, rank)))

export const TAROT_DECK: TarotCard[] = [...majorArcana, ...minorArcana]

export const CARD_BY_ID: Record<string, TarotCard> = Object.fromEntries(
  TAROT_DECK.map((card) => [card.id, card]),
)
