+++
date = '2022-01-15T18:00:00+08:00'
draft = false
title = 'Windows 10 家庭版安装 Hyper-V 虚拟机'
categories = ['运维']
tags = ['Hyper-V', 'Windows', '虚拟机']
toc = true
+++

今天想用 Hyper-V 来模拟一下 OpenWRT，但是发现 Win10 家庭版是没有此功能的，搜索了一下找到以下办法，记录一下。

## 原因

Windows 10 家庭版默认不提供 Hyper-V 功能，只有专业版和企业版才在"启用或关闭 Windows 功能"中显示该选项。

实际上 Hyper-V 的组件文件在家庭版系统中是存在的，只是被禁用了，通过手动启用的方式可以绕过限制。

## 操作步骤

### 第一步：创建安装脚本

在桌面右键新建一个 `txt` 文件，输入以下内容：

```bat
pushd "%~dp0"

dir /b %SystemRoot%\servicing\Packages\*Hyper-V*.mum >hyper-v.txt

for /f %%i in ('findstr /i . hyper-v.txt 2^>nul') do dism /online /norestart /add-package:"%SystemRoot%\servicing\Packages\%%i"

del hyper-v.txt

Dism /online /enable-feature /featurename:Microsoft-Hyper-V-All /LimitAccess /ALL
```

保存后将文件后缀名改为 `.bat`。

### 第二步：以管理员身份运行

右键该 `.bat` 文件，选择**以管理员身份运行**。

脚本会自动：
- 扫描系统中已有的 Hyper-V 相关组件包
- 逐个安装这些包
- 启用 Hyper-V 所有功能

### 第三步：重启电脑

安装完成后会提示是否立即重启，输入 `Y` 回车重启。

### 第四步：等待更新完成

重新开机后系统会自动配置更新，这个过程需要几分钟，耐心等待即可。

更新完成后，在开始菜单搜索 **Hyper-V**，就能看到 Hyper-V 管理器了。

## 注意事项

1. **Hyper-V 需要硬件虚拟化支持** — 确保在 BIOS/UEFI 中开启了 Intel VT-x 或 AMD-V
2. **家庭版启用后部分功能受限** — 如虚拟机迁移等高级功能可能不可用
3. **建议用专业版/企业版** — 如果需要完整功能，升级系统是更稳妥的选择
4. **与 VMware/VirtualBox 冲突** — Hyper-V 启用后，其他虚拟化软件可能无法正常运行，需要在"启用或关闭 Windows 功能"中关闭 Hyper-V

## 验证安装成功

打开 PowerShell，执行：

```powershell
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V
```

返回 `State : Enabled` 说明安装成功。

## 总结

家庭版虽然没有图形化入口，但底层组件是完整的，通过 DISM 命令可以手动启用。适合临时测试使用，生产环境还是建议用专业版或企业版。
