+++
date = '2026-05-17T10:35:00+08:00'
draft = true
title = 'Cocos Creator 性能优化：从 30fps 到 60fps 的实战记录'
categories = ['编程']
tags = ['Cocos', '性能优化']
toc = true
+++

最近在开发一款 Cocos Creator 游戏时，遇到了严重的性能问题——场景复杂时帧率掉到 30fps 以下。经过一轮排查和优化，最终稳定在 60fps。本文记录整个优化过程。

## 问题分析

使用 Cocos Creator 内置的 Profiler 工具分析，发现主要瓶颈：

- **渲染批次过多**：Draw Call 数量达到 500+
- **内存占用高**：频繁 GC 导致卡顿
- **节点数量过多**：动态创建的节点未及时回收

<!--more-->

## 优化一：合批渲染（Draw Call 优化）

### 问题

每个独立 Sprite 都会产生一个 Draw Call，100 个不同图片的 Sprite 就是 100 次 Draw Call。

### 解决方案

**1. 使用图集（Atlas）**

将多个小图打包成图集，同一图集的 Sprite 可以自动合批：

```ts
// 确保使用同一图集的资源
resources.load('ui/atlas', SpriteAtlas, (err, atlas) => {
  sprite.spriteFrame = atlas.getSpriteFrame('icon_01')
})
```

**2. 合理设置 Z 轴和渲染顺序**

不同 Z 轴的节点无法合批。将同一层级的 UI 元素保持在相同 Z 值：

```ts
// ❌ 每个节点不同 Z 值
nodes.forEach((n, i) => n.z = i)

// ✅ 同一层级相同 Z 值，通过 siblingIndex 控制顺序
nodes.forEach(n => n.z = 0)
```

**3. 静态合批**

对不移动的背景元素启用静态合批：

```ts
// 在属性检查器中勾选 Static，或代码设置
node.getComponent(UITransform).setStatic(true)
```

优化后 Draw Call 从 500+ 降到 80 左右。

## 优化二：对象池（内存优化）

### 问题

频繁 instantiate 和 destroy 节点导致内存抖动和 GC 卡顿。

### 解决方案

实现通用对象池：

```ts
export class NodePool {
  private pool: Map<string, Node[]> = new Map()

  get(prefab: Prefab, parent: Node): Node {
    const key = prefab.name
    const nodes = this.pool.get(key)
    
    if (nodes && nodes.length > 0) {
      const node = nodes.pop()!
      node.setParent(parent)
      node.active = true
      return node
    }

    const node = instantiate(prefab)
    node.setParent(parent)
    return node
  }

  put(node: Node) {
    const key = node.name.replace(/_clone_\d+$/, '')
    node.removeFromParent()
    node.active = false
    
    if (!this.pool.has(key)) {
      this.pool.set(key, [])
    }
    this.pool.get(key)!.push(node)
  }

  clear() {
    this.pool.forEach(nodes => nodes.forEach(n => n.destroy()))
    this.pool.clear()
  }
}
```

使用示例：

```ts
// 获取节点
const bullet = pool.get(bulletPrefab, bulletParent)

// 回收节点（而非 destroy）
pool.put(bullet)
```

## 优化三：减少节点数量

### 问题

列表和网格使用了大量节点，即使不可见也占资源。

### 解决方案：虚拟列表

只渲染可见区域的节点，滚动时复用：

```ts
// 核心思路
const visibleCount = Math.ceil(viewHeight / itemHeight) + 2 // 缓冲区
// 根据滚动偏移计算可见范围
// 复用离开视野的节点
```

Cocos Creator 2.x 可以参考官方的 `cc.ScrollView` 虚拟化方案，3.x 建议使用 `ListView` 组件。

## 优化四：资源管理

### 按场景加载资源

```ts
// 进入场景时加载
resources.loadDir('scene1', (err, assets) => {
  // 使用资源
})

// 离开场景时释放
resources.release('scene1')
```

### 纹理压缩

在构建面板中启用纹理压缩，选择 ASTC + ETC2 格式，可减少 50-70% 纹理内存。

## 优化效果

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| Draw Call | 500+ | 80 |
| FPS | 25-35 | 58-60 |
| GC 频率 | 每2秒 | 每15秒+ |
| 内存占用 | 380MB | 210MB |

## 总结

Cocos Creator 性能优化的核心思路：

1. **减少 Draw Call** — 图集、合批、静态标记
2. **减少内存分配** — 对象池、资源释放
3. **减少活跃节点** — 虚拟列表、按需加载
4. **持续 Profiling** — 用数据驱动优化，不要靠猜
