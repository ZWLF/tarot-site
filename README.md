# 浮世塔罗

浮世塔罗是一个中文塔罗 Web App，定位是“可完成、可保存、可复盘”的本地化占卜体验，而不是只抽一张牌就结束。

它把以下几段体验接成一条完整链路：

- 首页与首次引导
- 每日一张
- 占卜工作台
- 结果解读与行动计划
- 记录中心与双记录对比
- 牌卡百科
- 分享文案与 PNG 海报导出

本项目是纯前端实现，不接后端，不需要账号，不依赖云同步。所有数据都保存在浏览器本地。

## 功能概览

- 每日一张：按本地日期生成固定日签，支持揭晓、分享、海报导出
- 占卜工作台：输入问题，选择主题、牌阵与模式后开始抽牌
- 牌阵系统：支持 11 套牌阵与变体，包含单张指引、圣三角、抉择罗盘、关系映照、月度五张、凯尔特十字、生命之树等
- 结果解读：支持逐张揭牌、全部揭晓、五段式解读、行动计划、追问与收藏
- 记录中心：支持自动归档、收藏、筛选、搜索、导入、导出与双记录对比
- 牌卡百科：支持按当前抽牌聚焦查看，也支持浏览完整 78 张牌
- 分享与导出：支持 Web Share / 剪贴板分享，以及 SVG 转 PNG 海报导出

## 当前 UI / 内容层状态

当前版本已经完成一轮内容层与体验结构升级，核心变化包括：

- 首次引导改成 3 步结构
- 工作台新增牌阵选择说明
- 结果页改成固定五段式报告：
  - 核心结论
  - 当前状态
  - 风险提醒
  - 先做什么
  - 回看问题
- 记录中心新增只读“回看摘要”
- 逆位解读采用统一解释镜头，不再只是正位的负面翻版
- 牌位说明新增 `meaningHint`，优先用于用户可见解释

同时保留了原有塔罗牌牌面与翻牌交互风格，没有把牌卡视觉替换成静态设计稿。

## 技术栈

- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS 3
- Vitest + Testing Library
- Playwright
- IndexedDB + localStorage

## 快速开始

### 1. 安装依赖

```bash
npm ci
```

### 2. 启动开发环境

```bash
npm run dev
```

Windows PowerShell 如果遇到 `npm.ps1` 执行策略限制，可改用：

```bash
npm.cmd run dev
```

### 3. 生产构建

```bash
npm run build
npm run preview
```

## 常用命令

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm test
npm run test:e2e
npm run assets:optimize
```

Windows 辅助脚本：

- `start-dev-server.cmd`
- `stop-dev-server.cmd`
- `open-tarot.cmd`

## 数据与存储

- 项目不接后端，所有业务数据保存在浏览器本地
- 记录主存储 key 为 `ukiyo-tarot.records-v4`
- 浏览器支持时会同步到 IndexedDB，作为更稳定的持久化层
- 启动时会尝试迁移旧版本：
  - `ukiyo-tarot.saved-readings`
  - `ukiyo-tarot:reading-history`
  - `ukiyo-tarot.records-v3`
- 记录支持 JSON 导出与导入

当前记录模型统一为 `ReadingRecordV4`。

## 验证链路

本项目当前基础校验链路：

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

最近一次本地完整验证结果：

- `lint` 通过
- `test` 通过，59 tests passed
- `build` 通过
- `test:e2e` 通过，2 tests passed

## 目录结构

- `src/App.tsx`：应用装配层
- `src/sections`：每日指引、工作台、结果解读等主区块
- `src/components`：UI 组件、记录中心、牌卡百科、牌阵展示等
- `src/data`：牌库、牌阵、主题、牌面视觉元数据
- `src/domain`：核心类型定义
- `src/engine`：抽牌、解读、存储、记录数据库等业务引擎
- `src/hooks`：会话状态、每日状态、持久化状态等 hooks
- `src/lib`：日期、分享、布局等辅助逻辑
- `src/test`：Vitest 单元与组件测试
- `tests/e2e`：Playwright 浏览器流测试
- `public/cards/rws`：牌面资源与衍生图
- `scripts/generate-optimized-assets.mjs`：资源衍生图生成脚本

## 架构说明

- 单页长滚动应用，不使用前端路由
- `RecordCenter` 与 `CardEncyclopedia` 通过 `React.lazy` 延迟加载
- 抽牌和解读由纯前端引擎生成
- 普通占卜与每日一张共用核心解读链路
- 页面壳层采用 Stitch 融合后的导航与布局体系，但保留原塔罗牌展示与翻牌风格

## 已知约束

- 不提供账号、支付、订阅、云同步
- 当前偏向浏览器端单人使用场景
- 每日揭晓状态属于当前会话状态，刷新页面后会重置
- 资源衍生图生成不是 `build` 的默认步骤，需要按需手动执行 `npm run assets:optimize`

## 文档

- [SPECS.md](./SPECS.md)：产品目标、模块边界、数据模型与交互规格

## License

本仓库使用 [MIT License](./LICENSE)。
