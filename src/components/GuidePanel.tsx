interface GuidePanelProps {
  dismissed: boolean
  onDismiss: () => void
  onRestore: () => void
}

const TERMS = [
  {
    title: '牌阵',
    description: '牌阵决定你从什么角度读牌。单张适合快问快答，三张更适合看变化和结构。',
  },
  {
    title: '正位',
    description: '正位通常表示能量更直接、更顺畅，事情更容易自然展开。',
  },
  {
    title: '逆位',
    description: '逆位不等于坏，它更像提醒：这里有卡点、延迟、回收或需要调整的地方。',
  },
  {
    title: '主题',
    description: '主题会改变解读的焦点。同一张牌放在感情、事业、自我成长里，关注点会不同。',
  },
]

export function GuidePanel({
  dismissed,
  onDismiss,
  onRestore,
}: GuidePanelProps) {
  return (
    <section className="panel section guide-panel">
      <div className="section__heading">
        <div>
          <p className="eyebrow">First Time</p>
          <h2>新手引导与术语解释</h2>
        </div>
        {dismissed ? (
          <button className="ghost-button" type="button" onClick={onRestore}>
            重新查看
          </button>
        ) : (
          <button className="ghost-button" type="button" onClick={onDismiss}>
            我知道了
          </button>
        )}
      </div>

      {!dismissed ? (
        <>
          <div className="guide-steps">
            <article className="result-panel">
              <p className="eyebrow">01</p>
              <h3>先写一个具体问题</h3>
              <p>比起“我接下来会怎样”，更推荐写成“我该如何处理这段关系/这个机会/这次转变”。</p>
            </article>

            <article className="result-panel">
              <p className="eyebrow">02</p>
              <h3>再选主题和牌阵</h3>
              <p>主题负责聚焦语境，牌阵负责组织信息。问题越清楚，结果越能给你行动方向。</p>
            </article>

            <article className="result-panel">
              <p className="eyebrow">03</p>
              <h3>翻完牌后继续延伸</h3>
              <p>你可以继续查看单张牌百科、生成行动计划、追问下一步，并把结果存进历史记录。</p>
            </article>
          </div>

          <div className="glossary-grid">
            {TERMS.map((term) => (
              <article key={term.title} className="result-panel">
                <p className="eyebrow">术语</p>
                <h3>{term.title}</h3>
                <p>{term.description}</p>
              </article>
            ))}
          </div>
        </>
      ) : (
        <p className="selection-note">
          已收起新手引导。需要时可以随时展开，再看牌阵、正逆位和主题的区别。
        </p>
      )}
    </section>
  )
}
