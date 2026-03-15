import { expect, test } from '@playwright/test'

test('user can complete a reading flow in the browser', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '把抽到的 78 张牌，真正铺上桌面。' })).toBeVisible()

  await page.getByLabel('占卜问题').fill('我接下来该怎样处理这段关系？')
  await page.getByRole('button', { name: '爱情' }).click()
  await page.getByRole('button', { name: '圣三角' }).click()
  await page.getByRole('button', { name: '现状 / 阻碍 / 建议' }).click()
  await page.getByRole('button', { name: '洗牌并抽牌' }).click()
  await page.getByRole('button', { name: '全部揭晓' }).click()

  await expect(page.getByRole('heading', { name: '保存到记录中心' })).toBeVisible()
  await expect(page.getByLabel('记录标题')).toBeVisible()
})
