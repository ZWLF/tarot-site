import type { TopicId } from '../domain/tarot'

export interface TopicDefinition {
  id: TopicId
  label: string
  motto: string
  description: string
  framing: string
}

export const TOPICS: TopicDefinition[] = [
  {
    id: 'general',
    label: '综合',
    motto: '看整体节奏',
    description: '适合还在厘清问题轮廓时，从整体趋势入手。',
    framing: '这组牌会优先提醒你全局节奏、能量流向和最重要的下一步。',
  },
  {
    id: 'love',
    label: '爱情',
    motto: '看心动与关系',
    description: '适合恋爱状态、暧昧推进、关系选择与情感复盘。',
    framing: '这组牌会把重点放在情感回应、关系默契、投入与真实需求上。',
  },
  {
    id: 'career',
    label: '事业',
    motto: '看机会与推进',
    description: '适合工作变化、项目推进、职业抉择和职场人际。',
    framing: '这组牌会关注执行、资源调配、机会窗口与职业判断。',
  },
  {
    id: 'relationships',
    label: '人际',
    motto: '看边界与互动',
    description: '适合朋友、合作、家庭与社交中的关系张力。',
    framing: '这组牌会重点回应互动模式、边界感、误解与支持系统。',
  },
  {
    id: 'growth',
    label: '自我成长',
    motto: '看内在课题',
    description: '适合整理内心、理解卡点、看见习惯与成长方向。',
    framing: '这组牌会把问题带回你的内在课题、信念与成长节奏。',
  },
]

export const TOPIC_BY_ID: Record<TopicId, TopicDefinition> = Object.fromEntries(
  TOPICS.map((topic) => [topic.id, topic]),
) as Record<TopicId, TopicDefinition>
