+++
date = '2024-01-11T19:44:00+08:00'
draft = false
title = '关于 sqlite3 在 Electron 26 的 Python 安装问题'
categories = ['编程']
tags = ['Electron', 'sqlite3', 'Python']
toc = true
+++

高版本的 Electron 26 安装 `sqlite3` 的时候依赖 Python 3，但是此版本**不得高于 3.9**。

高于 3.9 会导致无法安装，请注意。

## 问题现象

执行 `npm install sqlite3` 时报错，提示找不到 Python 或 Python 版本不兼容。

## 原因

`node-gyp` 在 Electron 26 环境下编译 `sqlite3` 原生模块时，对 Python 版本有严格要求，只支持 Python 3.6 ~ 3.9。

## 解决办法

### 方案一：安装 Python 3.9

前往 [Python 官网](https://www.python.org/downloads/release/python-3913/) 下载安装 Python 3.9.x，安装时勾选 **Add Python to PATH**。

安装完成后验证：

```bash
python --version
# Python 3.9.x
```

### 方案二：指定 Python 路径

如果系统里有多个 Python 版本，可以显式指定：

```bash
npm config set python "C:\Python39\python.exe"
npm rebuild sqlite3
```

### 方案三：使用 npm 镜像（推荐）

```bash
npm install sqlite3 --build-from-source
# 或设置镜像
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
```

## 总结

Electron 26 + sqlite3 的组合对 Python 版本敏感，请务必使用 **Python 3.9 及以下**版本，避免踩坑。
