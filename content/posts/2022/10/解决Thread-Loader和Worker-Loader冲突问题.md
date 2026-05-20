+++
date = '2022-10-15T10:00:00+08:00'
draft = false
title = '解决 Thread Loader 和 Worker Loader 冲突问题'
categories = ['编程']
tags = ['Vue CLI', 'Webpack', 'Thread Loader', 'Worker Loader']
toc = true
+++

很多旧的项目升级到最新的 vue-cli 5 或者 webpack 5 的时候，如果本身含有 worker，并且使用 worker loader 进行编译就很容易引起以下错误：

```
Syntax Error: Thread Loader (Worker 0) Cannot read properties of undefined (reading 'options')
```

网络上能搜索到的方法一般就是修改 `vue.config.js` 里的 `parallel` 为 `false` 则可。

**这等于是把 Thread Loader 的多线程给关闭了，webpack 的效率会很低。**

凭着不愿放弃的精神，笔者终于找到这个问题真正的解决方案和原因。

## 真正的原因

原来 **Worker Loader 在 Webpack 5 已经被弃用**，具体阅读官网：

> https://webpack.docschina.org/guides/web-workers/

在 Webpack 5 中需要更换一种写法，Webpack 5 已经能不依赖 Worker Loader 就能处理了。

**这样 Thread Loader 的多线程就不必关闭了。**

## Webpack 5 的正确写法

官网示例如下：

```js
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true,
    workers: true,
  },
};
```

在代码中直接使用标准 Worker 语法：

```js
// 以前用 worker-loader 的写法（Webpack 4 / Vue CLI 4）
import Worker from 'worker-loader!./worker.js'

// Webpack 5 正确写法
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

## Vue CLI 5 项目处理

Vue CLI 5 底层是 Webpack 5，需要卸载 `worker-loader`：

```bash
npm uninstall worker-loader
```

然后把代码中的 import 方式改为标准 Worker 写法即可。

同时 `vue.config.js` 里保持 `parallel: true`（默认值），Thread Loader 多线程继续生效，构建速度不受影响。

## 结语

可能很多人觉得这是 Worker Loader 版本太旧引起的问题，其实这是因为 Webpack 官网修改了处理模式。因为 Vite 盛行导致 Webpack 的文章渐少，导致很多人无法正确地找到解决办法。而且根据错误信息也很难正确找到匹配的信息。

因此，特意把正确的解决方案记录下来，帮助有缘人。
