import { useDeferredValue, useState } from 'react'
import { TAROT_DECK } from '../data/cards'
import { TOPIC_BY_ID } from '../data/topics'
import type { TarotCard, TopicId } from '../domain/tarot'
import { RevealText } from './RevealText'

interface CardEncyclopediaProps {
  featuredCardIds: string[]
}

type EncyclopediaScope = 'drawn' | 'all'

const TOPIC_TAG_MAP: Record<TopicId, string[]> = {
  general: ['clarity', 'balance', 'ground', 'complete', 'adapt'],
  love: ['communicate', 'receive', 'trust', 'heal', 'self-honesty'],
  career: ['discipline', 'focus', 'strategy', 'lead', 'act', 'collaborate'],
  relationships: ['communicate', 'boundaries', 'receive', 'collaborate', 'self-honesty'],
  growth: ['heal', 'observe', 'release', 'rest', 'patience', 'trust'],
}

const scoreCardTopics = (card: TarotCard) => {
  const scores: Record<TopicId, number> = {
    general: card.arcana === 'major' ? 1 : 0,
    love: 0,
    career: 0,
    relationships: 0,
    growth: card.arcana === 'major' ? 1 : 0,
  }

  for (const [topicId, tags] of Object.entries(TOPIC_TAG_MAP) as Array<[TopicId, string[]]>) {
    scores[topicId] += card.adviceTags.filter((tag) => tags.includes(tag)).length
  }

  if (card.suit === 'cups') {
    scores.love += 2
    scores.relationships += 2
  }

  if (card.suit === 'wands') {
    scores.career += 2
    scores.growth += 1
  }

  if (card.suit === 'swords') {
    scores.relationships += 1
    scores.career += 1
    scores.growth += 1
  }

  if (card.suit === 'pentacles') {
    scores.general += 1
    scores.career += 2
  }

  return (Object.entries(scores) as Array<[TopicId, number]>)
    .sort((left, right) => right[1] - left[1])
    .filter((entry, index) => entry[1] > 0 || index === 0)
    .slice(0, 3)
    .map(([topicId]) => topicId)
}

const matchesQuery = (card: TarotCard, rawQuery: string) => {
  const query = rawQuery.trim().toLowerCase()

  if (query.length === 0) {
    return true
  }

  return [card.nameZh, card.nameEn, card.id].some((value) =>
    value.toLowerCase().includes(query),
  )
}

export function CardEncyclopedia({ featuredCardIds }: CardEncyclopediaProps) {
  const [scope, setScope] = useState<EncyclopediaScope>('drawn')
  const [query, setQuery] = useState('')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    featuredCardIds[0] ?? TAROT_DECK[0]?.id ?? null,
  )
  const deferredQuery = useDeferredValue(query)

  const featuredCards = TAROT_DECK.filter((card) => featuredCardIds.includes(card.id))
  const sourceCards =
    scope === 'drawn'
      ? featuredCards
      : TAROT_DECK
  const visibleCards = sourceCards.filter((card) => matchesQuery(card, deferredQuery))
  const resolvedSelectedCardId =
    selectedCardId !== null && sourceCards.some((card) => card.id === selectedCardId)
      ? selectedCardId
      : sourceCards[0]?.id ?? null

  const selectedCard =
    visibleCards.find((card) => card.id === resolvedSelectedCardId) ??
    sourceCards.find((card) => card.id === resolvedSelectedCardId) ??
    null

  return (
    <section className="panel section encyclopedia-panel">
      <div className="section__heading">
        <div>
          <p className="eyebrow">Step 09</p>
          <RevealText as="h2" text="78 张牌卡百科" />
        </div>
        <span className="section__count">{scope === 'drawn' ? '本次抽到的牌' : '完整牌库'}</span>
      </div>

      <p className="selection-note encyclopedia-note">
        抽完牌后可以继续点进单张牌，查看正位/逆位、关键词、牌义和更适合延伸阅读的主题。
      </p>

      <div className="utility-row">
        <div className="utility-toggle">
          <button
            className={`pill ${scope === 'drawn' ? 'is-active' : ''}`}
            type="button"
            onClick={() => setScope('drawn')}
          >
            <span>本次抽到的牌</span>
            <small>{featuredCards.length || 0} 张</small>
          </button>
          <button
            className={`pill ${scope === 'all' ? 'is-active' : ''}`}
            type="button"
            onClick={() => setScope('all')}
          >
            <span>查看全部 78 张</span>
            <small>完整牌卡百科</small>
          </button>
        </div>

        <label className="inline-input">
          <span>搜索牌名</span>
          <input
            placeholder="例如：恋人 / The Lovers"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="encyclopedia-layout">
        <div className="encyclopedia-list" role="list" aria-label="牌卡列表">
          {visibleCards.length > 0 ? (
            visibleCards.map((card) => (
              <button
                key={card.id}
                className={`encyclopedia-chip ${
                  card.id === resolvedSelectedCardId ? 'is-active' : ''
                }`}
                type="button"
                onClick={() => setSelectedCardId(card.id)}
              >
                <strong>{card.nameZh}</strong>
                <small>{card.nameEn}</small>
              </button>
            ))
          ) : (
            <p className="selection-note">
              {scope === 'drawn'
                ? '当前还没有可聚焦的抽牌结果，先完成一次抽牌，或切换到完整牌库。'
                : '没有找到匹配的牌，试试换一个关键词。'}
            </p>
          )}
        </div>

        {selectedCard !== null ? (
          <article className="encyclopedia-detail">
            <div className="encyclopedia-detail__header">
              <div>
                <p className="eyebrow">
                  {selectedCard.arcana === 'major'
                    ? 'Major Arcana'
                    : `${selectedCard.nameEn.split(' of ')[1] ?? 'Minor Arcana'}`}
                </p>
                <RevealText as="h3" text={selectedCard.nameZh} />
                <p>{selectedCard.nameEn}</p>
              </div>

              <span className="section__count">
                {selectedCard.arcana === 'major' ? '大阿尔卡那' : '小阿尔卡那'}
              </span>
            </div>

            <div className="signal-strip">
              {scoreCardTopics(selectedCard).map((topicId) => (
                <span key={topicId}>{TOPIC_BY_ID[topicId].label}</span>
              ))}
            </div>

            <div className="encyclopedia-columns">
              <section className="result-panel">
                <p className="eyebrow">Upright</p>
                <h4>正位</h4>
                <div className="signal-strip">
                  {selectedCard.keywords.up.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
                <p>{selectedCard.meaning.up}</p>
              </section>

              <section className="result-panel">
                <p className="eyebrow">Reversed</p>
                <h4>逆位</h4>
                <div className="signal-strip">
                  {selectedCard.keywords.down.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
                <p>{selectedCard.meaning.down}</p>
              </section>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  )
}
