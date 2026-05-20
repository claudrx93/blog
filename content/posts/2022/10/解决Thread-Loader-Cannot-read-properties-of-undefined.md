+++
date = '2022-10-01T10:00:00+08:00'
draft = false
title = '解决 Syntax Error: Thread Loader (Worker 0) Cannot read properties of undefined'
categories = ['编程']
tags = ['Vue CLI', 'Webpack', 'Thread Loader']
toc = true
+++

## 问题

构建时出现错误：

```
Syntax Error: Thread Loader (Worker 0)
Cannot read properties of undefined (reading 'options')
```

## 原因

`Thread Loader (Worker 0)` —— 多线程运行引起。Vue-CLI 默认在 `production` 构建时开启多线程编译（`parallel: true`），在某些环境下会导致 Worker 读取不到 `options` 而报错。

## 解决办法

修改 `vue.config.js`，把 `parallel` 改为 `false`：

```js
// vue.config.js
module.exports = {
  parallel: false
}
```

## 参考

- 官方文档：https://cli.vuejs.org/zh/config/#parallel

## 说明

`parallel: true` 在多核 CPU 上可以加速构建，但在某些 Windows 环境或特定依赖版本下会出现兼容性问题。如果遇到类似 Thread Loader 的错误，第一时间想到关闭 `parallel`。
