import { mkdir, readdir } from 'node:fs/promises'
import { join, basename } from 'node:path'
import sharp from 'sharp'

const rootDir = process.cwd()
const cardsDir = join(rootDir, 'public', 'cards', 'rws')
const thumbJpgDir = join(cardsDir, 'thumb-jpg')
const thumbWebpDir = join(cardsDir, 'thumb-webp')
const detailWebpDir = join(cardsDir, 'detail-webp')
const ogCoverPath = join(rootDir, 'public', 'og-cover.png')

const ensureDirectories = async () => {
  await Promise.all([
    mkdir(thumbJpgDir, { recursive: true }),
    mkdir(thumbWebpDir, { recursive: true }),
    mkdir(detailWebpDir, { recursive: true }),
  ])
}

const optimizeCards = async () => {
  const entries = await readdir(cardsDir, { withFileTypes: true })
  const sourceFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.jpg'))
    .map((entry) => entry.name)

  await Promise.all(
    sourceFiles.map(async (fileName) => {
      const sourcePath = join(cardsDir, fileName)
      const fileStem = basename(fileName, '.jpg')

      await sharp(sourcePath)
        .resize({ width: 240, withoutEnlargement: true })
        .jpeg({ mozjpeg: true, quality: 68 })
        .toFile(join(thumbJpgDir, `${fileStem}.jpg`))

      await sharp(sourcePath)
        .resize({ width: 240, withoutEnlargement: true })
        .webp({ quality: 72 })
        .toFile(join(thumbWebpDir, `${fileStem}.webp`))

      await sharp(sourcePath)
        .resize({ width: 720, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(join(detailWebpDir, `${fileStem}.webp`))
    }),
  )
}

const generateOgCover = async () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
      <defs>
        <linearGradient id="bg" x1="84" y1="48" x2="1124" y2="610" gradientUnits="userSpaceOnUse">
          <stop stop-color="#19324A"/>
          <stop offset="0.48" stop-color="#0F1C29"/>
          <stop offset="1" stop-color="#231018"/>
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(920 120) rotate(146) scale(380 280)">
          <stop stop-color="#D7A34F" stop-opacity="0.36"/>
          <stop offset="1" stop-color="#D7A34F" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="630" rx="36" fill="url(#bg)"/>
      <rect width="1200" height="630" rx="36" fill="url(#glow)"/>
      <rect x="36" y="36" width="1128" height="558" rx="28" stroke="rgba(255,238,205,0.18)"/>
      <text x="84" y="128" fill="#E4C98A" font-size="32" font-family="'Times New Roman', serif" letter-spacing="6">UKIYO TAROT SALON</text>
      <text x="84" y="242" fill="#F7F0DE" font-size="84" font-family="'Times New Roman', serif">浮世塔罗</text>
      <text x="84" y="322" fill="#DFE8F8" font-size="34" font-family="'Times New Roman', serif">把抽到的 78 张牌，真正铺上桌面。</text>
      <text x="84" y="402" fill="#CAD5E5" font-size="28" font-family="'Times New Roman', serif">每日一张 · 深度牌阵 · 记录归档 · PNG 海报</text>
      <text x="84" y="534" fill="#BFC9D9" font-size="24" font-family="'Times New Roman', serif">以牌为镜，以行动落地。</text>
    </svg>
  `

  await sharp(Buffer.from(svg)).png().toFile(ogCoverPath)
}

await ensureDirectories()
await optimizeCards()
await generateOgCover()
