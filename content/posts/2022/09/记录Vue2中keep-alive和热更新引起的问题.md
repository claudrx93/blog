+++
date = '2022-09-01T10:00:00+08:00'
draft = false
title = '记录 Vue2 中 keep-alive 和热更新引起的问题'
categories = ['编程']
tags = ['Vue2', 'keep-alive', '热更新']
toc = true
+++

## 问题

在项目开发中遇到一个问题：某个 `router-view` 的页面，热更新配置文件（json 文件）后，总是显示空白，必须手动刷新从路由重新进入才能正常显示。这样大大影响了开发效率，并且使热更新形同虚设，这还能忍？

## 排查过程

经过深刻的排查，发现原来这个 `router-view` 指向的组件里，被一个 `keep-alive` 包裹着。代码如下：

```vue
<template>
  <div>
    <keep-alive :exclude="/NoCache$/">
      <types :key="routerKey" v-if="routerKey"></types>
    </keep-alive>
  </div>
</template>
```

经过测试发现，去掉 `keep-alive` 组件后，组件就能正常热更新。

## 原因分析

经过反复测试后确认问题是：

Webpack 的热更新会移除组件的 DOM，强制 Vue 对该组件进行重新渲染。但是因为 `keep-alive` 会使该组件**读取缓存**，而这个实体 DOM 又被移除了，就只能显示空白。

## 解决方法

让组件在热更新后重新渲染。最简单的方法就是在**开发环境下不要使用 `keep-alive`**：

```vue
<template>
  <div>
    <div v-if="isDev">
      <types :key="routerKey" v-if="routerKey"></types>
    </div>
    <keep-alive v-else :exclude="/NoCache$/">
      <types :key="routerKey" v-if="routerKey"></types>
    </keep-alive>
  </div>
</template>

<script>
export default {
  computed: {
    isDev() {
      return process.env.NODE_ENV === 'development'
    }
  }
}
</script>
```

其他方法比较复杂，但总体思路就是要让 `keep-alive` 里面的组件重新渲染，这时可以配置 `keep-alive` 的钩子函数 `activated`，热更新时会触发。

## 总结

`keep-alive` 缓存组件在开发环境下会干扰热更新，导致 DOM 被移除后无法重新渲染。开发环境下禁用 `keep-alive` 是最简单的解决方案。
