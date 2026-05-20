+++
date = '2022-06-01T10:00:00+08:00'
draft = false
title = '解决 pnpm : 无法加载文件 pnpm.ps1，因为在此系统上禁止运行脚本'
categories = ['编程']
tags = ['pnpm', 'PowerShell', 'Windows']
toc = true
+++

## 问题

全局安装 pnpm 后出现：

```
pnpm : 无法加载文件 C:\Users\XXX\AppData\Roaming\npm\pnpm.ps1，
因为在此系统上禁止运行脚本。
有关详细信息，请参阅 https://go.microsoft.com/fwlink/?LinkID=135170 中的 about_Execution_Policies。
所在位置 行:1 字符: 1
```

## 原因

Windows PowerShell 默认执行策略为 `Restricted`，不允许运行任何脚本（`.ps1` 文件）。

## 解决办法

以**超级管理员**打开 PowerShell，运行以下命令：

```powershell
Set-ExecutionPolicy RemoteSigned
```

显示确认提示时，输入 `Y` 回车即可。

## 验证

重新打开控制台，输入 `pnpm -v`，可以正常显示版本号即成功。

## 执行策略说明

| 策略 | 说明 |
|------|------|
| `Restricted` | 不允许运行任何脚本（默认） |
| `RemoteSigned` | 本地脚本可运行，远程脚本需签名 |
| `Unrestricted` | 所有脚本都可运行（不安全） |
