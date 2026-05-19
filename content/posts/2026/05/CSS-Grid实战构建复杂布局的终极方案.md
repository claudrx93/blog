+++
date = '2026-05-10T10:35:00+08:00'
draft = true
title = 'CSS Grid 实战：构建复杂布局的终极方案'
categories = ['编程']
tags = ['CSS', '布局']
toc = true
+++

CSS Grid 是目前最强大的布局方案，能轻松实现以前需要各种 hack 的复杂布局。本文通过实战案例，展示 Grid 的核心用法。

## Grid 基础概念

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;  /* 3列 */
  grid-template-rows: auto 1fr auto;       /* 3行 */
  gap: 16px;
}
```

- `grid-template-columns` — 定义列
- `grid-template-rows` — 定义行
- `gap` — 间距
- `fr` — 剩余空间份数

<!--more-->

## 实战一：经典后台布局

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 56px 1fr 48px;
  grid-template-areas:
    "header header"
    "sidebar main"
    "sidebar footer";
  height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

HTML：

```html
<div class="layout">
  <header class="header">头部</header>
  <aside class="sidebar">侧边栏</aside>
  <main class="main">主内容</main>
  <footer class="footer">底部</footer>
</div>
```

侧边栏可折叠时：

```css
.layout {
  grid-template-columns: var(--sidebar-width, 240px) 1fr;
  transition: grid-template-columns 0.3s ease;
}

.layout.collapsed {
  --sidebar-width: 64px;
}
```

## 实战二：响应式卡片网格

不用媒体查询，用 `auto-fill` + `minmax` 自适应：

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.card {
  /* 自动填满单元格 */
  min-height: 200px;
}
```

- `auto-fill` — 自动填充列数
- `minmax(280px, 1fr)` — 最小 280px，最大等分剩余空间

## 实战三：圣杯布局

```css
.holy-grail {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.holy-grail > header { grid-column: 1 / -1; }
.holy-grail > footer { grid-column: 1 / -1; }
```

移动端折叠：

```css
@media (max-width: 768px) {
  .holy-grail {
    grid-template-columns: 1fr;
  }
  .holy-grail > header,
  .holy-grail > footer {
    grid-column: auto;
  }
}
```

## 实战四：瀑布流布局

CSS Grid 本身不直接支持瀑布流，但可以巧妙实现：

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 10px;  /* 小行高 */
  gap: 16px;
}

.masonry-item {
  /* 根据内容计算跨越行数 */
  grid-row: span var(--row-span, 20);
}
```

JavaScript 计算行数：

```ts
function updateRowSpan() {
  const items = document.querySelectorAll('.masonry-item')
  items.forEach(item => {
    const height = item.getBoundingClientRect().height
    const rowSpan = Math.ceil((height + 16) / 10)  // 10 = grid-auto-rows
    item.style.setProperty('--row-span', rowSpan)
  })
}
```

## 实战五：粘性页脚

```css
.page {
  display: grid;
  grid-template-rows: 1fr auto;
  min-height: 100vh;
}

footer {
  /* 自动在底部 */
}
```

## 常用技巧

### 1. 对齐

```css
.container {
  place-items: center;       /* 水平+垂直居中 */
  justify-items: start;      /* 水平起始对齐 */
  align-items: end;          /* 垂直底部对齐 */
}
```

### 2. 隐式网格

```css
.container {
  grid-auto-flow: dense;     /* 填充空白 */
  grid-auto-columns: 1fr;    /* 隐式列宽 */
  grid-auto-rows: minmax(100px, auto);  /* 隐式行高 */
}
```

### 3. 子网格（Subgrid）

CSS Grid Level 2 支持 subgrid：

```css
.parent {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
}

.child {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;  /* 继承父级列定义 */
}
```

## Grid vs Flexbox 选择

| 场景 | 选择 |
|------|------|
| 一维排列（行或列） | Flexbox |
| 二维布局（行+列） | Grid |
| 内容驱动 | Flexbox |
| 布局驱动 | Grid |
| 组件内部排列 | Flexbox |
| 页面级布局 | Grid |

## 总结

CSS Grid 适合页面级和区域级布局，配合 Flexbox 处理组件内部排列，两者互补。掌握 `grid-template-areas`、`minmax`、`auto-fill` 这三个特性，基本能覆盖 90% 的布局需求。
