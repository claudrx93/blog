+++
date = '2023-10-09T17:49:00+08:00'
draft = false
title = '解决 peer eslint-plugin-vue@^7.0.0 from @vue/eslint-config-standard@6.1.0 错误'
categories = ['编程']
tags = ['ESLint', 'Vue3', 'npm']
toc = true
+++

## 问题

执行 `npm install` 时出现错误：

```
peer eslint-plugin-vue@"^7.0.0" from @vue/eslint-config-standard@6.1.0
```

## 原因

npm 7+ 版本默认使用 `legacy-peer-deps=false`，会严格检查 peer dependency 冲突，而 `@vue/eslint-config-standard@6.1.0` 要求的 `eslint-plugin-vue` 版本与当前项目依赖产生冲突。

## 解决办法

增加 `--legacy-peer-deps` 参数，并且在 `package.json` 的 script 上添加脚本，防止以后忘记。

```json
{
  "scripts": {
    "postinstall": "echo 'run npm install --legacy-peer-deps'"
  }
}
```

安装时执行：

```bash
npm install --legacy-peer-deps
```

## 总结

这是 npm 7+ 引入的严格 peer dependency 检查导致的常见问题，加上 `--legacy-peer-deps` 即可跳过检查，恢复到 npm 6 的行为。
