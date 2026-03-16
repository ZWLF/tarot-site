import type { TarotCard } from '../domain/tarot'

type MinorSuit = Exclude<TarotCard['suit'], null>

interface MajorSeed {
  encyclopedia?: TarotCard['encyclopedia']
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
  encyclopediaAdviceFrame?: string
  encyclopediaDescriptionFrame?: string
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
  encyclopediaAdviceTone?: string
  encyclopediaContext?: string
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

const MAJOR_ENCYCLOPEDIA_BY_ID: Record<string, TarotCard['encyclopedia']> = {
  'the-fool': {
    descriptionZh:
      '愚者象征尚未被定义的新起点。它不是盲目冒险，而是带着轻盈与信任踏入未知，允许自己在没有完整地图的情况下先迈出第一步。',
    adviceZh:
      '保留好奇心，同时给冲动加上一层现实护栏。先用一个小动作开启旅程，而不是等到万事俱备才行动。',
  },
  'the-magician': {
    descriptionZh:
      '魔术师代表把资源、意志和表达整合为可执行方案的能力。它出现时，往往说明你并不缺工具，真正的关键在于是否愿意主动调度并承担结果。',
    adviceZh:
      '盘点手里的能力、时间和盟友，把它们组合成一个具体动作。少一点空想，多一点清晰输出和有意识的推动。',
  },
  'the-high-priestess': {
    descriptionZh:
      '女祭司对应静默、直觉和潜意识中的答案。它提醒你，在外界喧闹之前，内在其实已经有了微弱但准确的感知，只是还没被听见。',
    adviceZh:
      '先暂停解释和证明，给感受一些空间。记录下反复出现的梦、情绪和直觉，再决定下一步，而不是急着表态。',
  },
  'the-empress': {
    descriptionZh:
      '皇后象征滋养、丰盛与稳定生长的生命力。它不只是获得，更是持续照料与耐心投入之后，事物自然成熟的过程。',
    adviceZh:
      '把注意力放到能被培育的关系、项目和身体节奏上。允许缓慢生长，不要因为想立刻见效而过度消耗自己。',
  },
  'the-emperor': {
    descriptionZh:
      '皇帝代表结构、秩序与边界。它提示你回到规则、责任和可控框架中，用更稳定的方式为局面建立承托，而不是任由情绪主导。',
    adviceZh:
      '明确优先级、职责和底线，把含糊地带说清楚。稳定不是僵化，而是让真正重要的部分有一个可靠骨架。',
  },
  'the-hierophant': {
    descriptionZh:
      '教皇关乎传统、传承和成熟经验的指引。它出现时，往往意味着你可以借助已有系统、前人经验或值得信任的导师，来降低试错成本。',
    adviceZh:
      '先理解规则背后的价值，再决定要遵循还是更新它。向可靠的人请教，但不要把外部答案当成替代自我判断的借口。',
  },
  'the-lovers': {
    descriptionZh:
      '恋人不只谈爱情，更指向价值观与关系中的真实选择。它强调的是对齐，意味着你需要诚实面对自己真正愿意投入什么、放弃什么。',
    adviceZh:
      '用真诚代替讨好，用清晰代替拖延。把核心选择说出来，再决定如何承担它带来的亲密与代价。',
  },
  'the-chariot': {
    descriptionZh:
      '战车象征聚拢分散力量、重新掌舵并向前推进。它往往出现在局面进入加速阶段，但也提醒你，速度必须建立在方向明确之上。',
    adviceZh:
      '先收束注意力，再谈冲刺。把内在冲突降到最低，让行动、决心和节奏站在同一阵线。',
  },
  strength: {
    descriptionZh:
      '力量代表温柔而稳定的强韧。它不是压制，而是能够在高张力时仍旧保持自持，既看见自己的情绪，也不被情绪牵着走。',
    adviceZh:
      '用耐心和持续练习代替急躁证明。真正的掌控感来自稳定地陪自己走过不舒服，而不是逼自己立刻变强。',
  },
  'the-hermit': {
    descriptionZh:
      '隐士象征向内收束、暂时离开噪音并寻找更本真的答案。它提示你，独处不是退场，而是为了看见什么是真正值得继续走的路。',
    adviceZh:
      '减少无效输入，给思考和复盘留白。把注意力从别人怎么看，拉回到自己此刻最真实的判断。',
  },
  'wheel-of-fortune': {
    descriptionZh:
      '命运之轮对应循环、转机与外部时机的转动。它常常意味着局势已开始变化，而你需要识别自己正站在上升、停滞还是转向的节点。',
    adviceZh:
      '接受时机本身也是变量，别用旧策略应对新周期。及时调整节奏，抓住已经开始松动的窗口。',
  },
  justice: {
    descriptionZh:
      '正义强调事实、责任与清晰判断。它要求你把选择放到真实后果里衡量，而不是只依赖一时的情绪、偏好或想象。',
    adviceZh:
      '把证据、边界和代价摆到台面上，再做决定。真正的公平从来不是讨好所有人，而是承担自己选择的后果。',
  },
  'the-hanged-man': {
    descriptionZh:
      '倒吊人意味着主动暂停、换位思考与重新理解。它提醒你，停下来并不是失去推进，而是在为下一轮更准确的行动腾出认知空间。',
    adviceZh:
      '别急着把暂停当成失败。先换个角度看问题，允许某些旧解释失效，再决定接下来要放下什么。',
  },
  death: {
    descriptionZh:
      '死神代表结束、蜕变与不可逆的阶段转换。它不是灾厄，而是提醒你旧的结构已经完成任务，新的生命力只有在腾出空间后才会进入。',
    adviceZh:
      '停止给过期关系、模式或身份继续供能。先做收尾与断舍离，再去谈重建和下一段生长。',
  },
  temperance: {
    descriptionZh:
      '节制象征调和、配比和节奏感。它强调的不是激烈突破，而是通过一点点校准，把冲突的部分重新调成可以共存的状态。',
    adviceZh:
      '把“更多”换成“刚刚好”。维持可持续的节奏，让修复、合作和恢复都发生在不过量的范围内。',
  },
  'the-devil': {
    descriptionZh:
      '恶魔揭示执着、诱惑与被无意识模式绑定的状态。它出现时往往不是说你没有选择，而是你仍在把能量喂给那个熟悉却消耗的循环。',
    adviceZh:
      '先承认自己被什么吸住了，再去谈挣脱。把隐形依赖具体化，才有机会切断它的控制力。',
  },
  'the-tower': {
    descriptionZh:
      '高塔象征骤然崩塌、真相显形与被迫重组。它带来的不适，往往源于旧秩序已经无法继续承载现实，所以必须被拆开重建。',
    adviceZh:
      '别把破裂只理解为失去，它同时也是纠偏。先处理最真实的裂缝，再考虑如何搭起新的基础。',
  },
  'the-star': {
    descriptionZh:
      '星星代表希望、复原和重新接上未来感。经历震荡之后，它把你带回一种更轻、更真诚的状态，让修复重新变得可能。',
    adviceZh:
      '给自己留一点恢复和相信的空间。别急着证明已经痊愈，先稳稳接住那一点正在回来的光。',
  },
  'the-moon': {
    descriptionZh:
      '月亮对应模糊、敏感、梦境与潜意识投射。它说明你正走在看不清全貌的阶段，情绪和想象会被放大，需要特别分辨什么是真感受，什么是旧恐惧。',
    adviceZh:
      '别急着下结论，先观察。把反复出现的担忧、画面和情绪写下来，等雾散一些再做关键决定。',
  },
  'the-sun': {
    descriptionZh:
      '太阳象征清晰、生命力与公开可见的确认。它往往说明局势会越来越明朗，重要信息不再藏着掖着，你也更有条件正面表达自己。',
    adviceZh:
      '允许自己站到光里，把好消息、真实需求和创造力都说出来。清楚不是张扬，而是不再缩在阴影里猜测。',
  },
  judgement: {
    descriptionZh:
      '审判意味着复盘、召唤与更高层次的回应。它要求你从旧故事里醒来，看清哪些经历已经构成了今天的自己，并决定是否要回应真正的召唤。',
    adviceZh:
      '别再停在自责或迟疑里。回看过去是为了完成整合，然后带着清醒作出一次更成熟的选择。',
  },
  'the-world': {
    descriptionZh:
      '世界代表完成、整合与一个阶段的圆满闭环。它说明你已经靠近成果与出口，接下来需要做的是收尾、承认成长，并准备进入新的周期。',
    adviceZh:
      '认真完成最后一步，不要因为临门一脚而松散。把成果整理好、安放好，再带着完整感走向下一段旅程。',
  },
}

const RANK_ENCYCLOPEDIA_COPY: Record<
  string,
  { adviceFrame: string; descriptionFrame: string }
> = {
  ace: {
    descriptionFrame: '新局刚刚展开、灵感冒头',
    adviceFrame: '从一个小而确定的动作开始，',
  },
  two: {
    descriptionFrame: '多股力量并行、需要取舍与平衡',
    adviceFrame: '先把彼此拉扯的两端摊开来看，',
  },
  three: {
    descriptionFrame: '局面开始向外扩张、需要协作与回应',
    adviceFrame: '把资源、人脉和回馈接进来，',
  },
  four: {
    descriptionFrame: '需要暂停加速、回到结构与承托',
    adviceFrame: '优先稳住基础和边界，',
  },
  five: {
    descriptionFrame: '不适、摩擦或失衡正在推动重整',
    adviceFrame: '把冲突当成校准信号，',
  },
  six: {
    descriptionFrame: '资源回到手里、局面开始过渡与修复',
    adviceFrame: '允许支持和反馈重新回流，',
  },
  seven: {
    descriptionFrame: '局面进入判断、等待和策略分辨的阶段',
    adviceFrame: '先评估再出手，',
  },
  eight: {
    descriptionFrame: '节奏明显加快、执行与训练正在塑形',
    adviceFrame: '把注意力放回持续训练，',
  },
  nine: {
    descriptionFrame: '事情接近收成，但代价和疲劳也变明显',
    adviceFrame: '承认自己已经走了很远，',
  },
  ten: {
    descriptionFrame: '一个周期走向完成，结果与负担并行出现',
    adviceFrame: '认真处理收尾与交接，',
  },
  page: {
    descriptionFrame: '新的消息、线索或试探动作刚刚出现',
    adviceFrame: '保持学习者姿态，',
  },
  knight: {
    descriptionFrame: '能量向外冲刺、需要推进或主动出击',
    adviceFrame: '先校准方向再加速，',
  },
  queen: {
    descriptionFrame: '你已具备承接局面的成熟度，需要稳稳拿住',
    adviceFrame: '把照料和判断放在同一条线上，',
  },
  king: {
    descriptionFrame: '局面需要定盘、统筹和成熟输出',
    adviceFrame: '用清晰的结构来承担领导位置，',
  },
}

const SUIT_ENCYCLOPEDIA_COPY: Record<
  MinorSuit,
  { adviceTone: string; context: string }
> = {
  wands: {
    adviceTone: '把冲劲导向真正重要的目标',
    context: '行动、创造冲动与个人野心的场域',
  },
  cups: {
    adviceTone: '先承认真实感受，再决定如何表达和回应',
    context: '情绪、关系连结与内在需求的场域',
  },
  swords: {
    adviceTone: '把模糊问题说清楚、写清楚、切清楚',
    context: '思考、沟通与边界整理的场域',
  },
  pentacles: {
    adviceTone: '回到现实条件，稳住节奏和资源配置',
    context: '资源、身体节奏与长期建设的场域',
  },
}

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
  const rankCopy = RANK_ENCYCLOPEDIA_COPY[rank.slug]
  const suitCopy = SUIT_ENCYCLOPEDIA_COPY[suit]
  const encyclopedia = {
    descriptionZh: `${suitConfig.labelZh}${rank.labelZh}常常出现在${rankCopy.descriptionFrame}，并且事情正被拉进${suitCopy.context}的阶段。它提醒你不仅要看单次事件，还要看这组花色背后的长期模式正在怎样塑造眼前局面。`,
    adviceZh: `${rankCopy.adviceFrame}${suitCopy.adviceTone}。先落实成一个看得见的小动作，再根据现实反馈微调节奏。`,
  }

  return {
    id: `${rank.slug}-of-${suit}`,
    nameZh: `${suitConfig.labelZh}${rank.labelZh}`,
    nameEn: `${rank.labelEn} of ${suitConfig.labelEn}`,
    arcana: 'minor',
    suit,
    number: rank.number,
    encyclopedia,
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
  encyclopedia: seed.encyclopedia ?? MAJOR_ENCYCLOPEDIA_BY_ID[seed.id],
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
