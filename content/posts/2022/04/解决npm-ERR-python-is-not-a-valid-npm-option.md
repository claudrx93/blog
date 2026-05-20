+++
date = '2022-04-15T10:00:00+08:00'
draft = false
title = '解决 npm ERR! `python` is not a valid npm option 问题'
categories = ['编程']
tags = ['npm', 'Node.js', 'Python']
toc = true
+++

## 问题

执行 `node-gyp` 时如果提示 python 不存在，则建议安装 Python 2.7，然后执行下面的命令：

```bash
npm config set python c:\Python27
```

有可能得到错误：

```
npm ERR! `python` is not a valid npm option
```

## 原因

npm 的版本过高。`python` 配置项在 npm v8+ 中已被移除或改名。

可以用以下命令查看 npm 的版本：

```bash
npm -v
```

## 解决办法

把 npm 的版本降级到 v8 版本，执行命令如下：

```bash
npm install -g npm@^8
```

降级后再执行 `npm config set python` 即可正常设置。

## 总结

npm 升级后部分配置项被废弃，遇到 `is not a valid npm option` 错误时，先检查 npm 版本，再决定是降级 npm 还是使用新的配置方式（如 `npm config set node-gyp` 或环境变量 `PYTHON`）。
