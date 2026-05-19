+++
date = '2026-05-14T10:35:00+08:00'
draft = true
title = 'Cocos Creator 3.x 与 2.x 的核心差异对比'
categories = ['编程']
tags = ['Cocos']
toc = true
+++

Cocos Creator 从 2.x 升级到 3.x 是一次架构级的重构，API 变化巨大。本文梳理两者的核心差异，帮你快速适应 3.x 开发。

## 渲染引擎

| 特性 | 2.x | 3.x |
|------|-----|-----|
| 渲染器 | Cocos2d-x | 全新渲染引擎 |
| 3D 支持 | 有限 | 原生支持 |
| 材质系统 | 简单 | 基于物理的材质（PBR） |
| 渲染管线 | 固定 | 可定制渲染管线 |
<!--more-->
## 脚本系统

### 组件声明

**2.x：**
```ts
const { ccclass, property } = cc._decorator

@ccclass
export class Player extends cc.Component {
  @property(cc.Sprite)
  sprite: cc.Sprite = null

  @property({ type: cc.Integer })
  speed: number = 100
}
```

**3.x：**
```ts
import { _decorator, Component, Sprite, SpriteFrame, Vec3 } from 'cc'
const { ccclass, property } = _decorator

@ccclass('Player')
export class Player extends Component {
  @property(Sprite)
  sprite: Sprite = null!

  @property
  speed: number = 100
}
```

### 节点操作

**2.x：**
```ts
// 位置
node.x = 100
node.y = 200
node.position = cc.v2(100, 200)

// 旋转
node.rotation = 45

// 缩放
node.scaleX = 2
node.scaleY = 2
```

**3.x：**
```ts
// 位置（3D 向量）
node.setPosition(new Vec3(100, 200, 0))
// 或
node.position = new Vec3(100, 200, 0)

// 旋转（欧拉角）
node.setRotationFromEuler(0, 0, 45)

// 缩放
node.setScale(2, 2, 1)
```

### 动画系统

**2.x cc.tween：**
```ts
cc.tween(node)
  .to(1, { x: 100, y: 200 })
  .call(() => console.log('done'))
  .start()
```

**3.x tween：**
```ts
import { tween, Vec3 } from 'cc'

tween(node)
  .to(1, { position: new Vec3(100, 200, 0) })
  .call(() => console.log('done'))
  .start()
```

## UI 系统

2.x 的 UI 系统和 3.x 差异最大：

- **2.x**：`cc.Node` 自带 `width/height/anchorX/anchorY`
- **3.x**：需要 `UITransform` 组件管理尺寸和锚点

```ts
// 3.x
const uiTransform = node.getComponent(UITransform)
uiTransform.setContentSize(width, height)
uiTransform.setAnchorPoint(0.5, 0.5)
```

### 常用 UI 组件对照

| 2.x | 3.x |
|-----|-----|
| cc.Label | Label |
| cc.Sprite | Sprite |
| cc.Button | Button |
| cc.EditBox | EditBox |
| cc.ScrollView | ScrollView |
| cc.Layout | Layout |
| cc.Widget | Widget |

## 事件系统

**2.x：**
```ts
node.on(cc.Node.EventType.TOUCH_START, this.onTouch, this)
node.emit('custom-event', data)
```

**3.x：**
```ts
import { Node, EventTouch } from 'cc'

node.on(Node.EventType.TOUCH_START, this.onTouch, this)
node.emit('custom-event', data) // 用法基本一致
```

主要区别：3.x 的事件系统更严格，支持了 3D 射线检测事件。

## 资源管理

**2.x：**
```ts
cc.resources.load('prefabs/hero', cc.Prefab, (err, prefab) => {
  const node = cc.instantiate(prefab)
})
```

**3.x：**
```ts
import { resources, Prefab, instantiate } from 'cc'

resources.load('prefabs/hero', Prefab, (err, prefab) => {
  const node = instantiate(prefab)
})
```

## 3.x 新特性

1. **物理引擎** — 内置 Ammo.js 和 Cannon.js，支持 3D 物理模拟
2. **渲染管线** — 可自定义后处理效果
3. **地形系统** — 3D 地形编辑器
4. **动画图** — 可视化状态机动画系统
5. **UI 编辑器增强** — 支持九宫格、自动布局等

## 迁移建议

1. **不要从 2.x 直接升级项目** — 坑太多，建议新建 3.x 项目迁移逻辑
2. **先迁移数据层** — 模型、数据逻辑与引擎无关，可复用
3. **逐步替换 API** — 按模块替换，一次迁移一个功能
4. **利用 TypeScript** — 类型检查能帮你发现大部分 API 变更

## 总结

Cocos Creator 3.x 是面向未来的架构，3D 能力、渲染管线、动画图都是质的提升。迁移代价大但值得，新项目直接上 3.x。
