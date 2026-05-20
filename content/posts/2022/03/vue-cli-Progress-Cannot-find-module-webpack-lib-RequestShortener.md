+++
date = '2022-03-01T10:00:00+08:00'
draft = false
title = 'vue-cli Progress Cannot find module webpack/lib/RequestShortener'
categories = ['编程']
tags = ['Vue CLI', 'Webpack']
toc = true
+++

## 问题

Vue-CLI 运行时出现错误：

```
Progress Cannot find module 'webpack/lib/RequestShortener'
```

## 原因

这是因为 `package-lock.json` 文件里有组件冲突导致 webpack 无法安装成功。一般在 vue-cli4 升级到 vue-cli5，或者 webpack4 升级到 webpack5 中出现。

此时可以发现 `node_modules` 里的 `webpack` 文件夹是不存在的。

## 解决办法

1. **删除 `package-lock.json` 文件**

2. **调整 webpack 相关插件的版本控制**，把 `^` 改成 `>=`，只要不是断层的插件都能正常升级

3. **重新执行 `npm install`**

4. **检查 `node_modules` 里的 webpack 文件夹是否存在**

> 注意：如果 webpack 安装在全局，请升级全局的 webpack 版本到最新。
>
> ```bash
> npm i -g webpack@latest
> ```
