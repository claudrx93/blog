+++
date = '2022-10-01T22:34:13+08:00'
draft = false
title = 'Ds4windows一直要求安装.net问题'
featured_image = ''
categories = []
tags = ['Ds4windows']
toc= false
+++
今天试着把PS4的手柄使用蓝牙连接PC玩游戏，但是部分游戏无法使用蓝牙游玩。
最后搜索各种方法推荐使用Ds4windows模拟为xbox手柄,
安装则可。
<!--more-->

但是下载安装后，一直提示需要安装.NET RUNTIME，点解下载会打开一个微软的下载页面。

顺利下载安装后，再打开还是会继续提示安装。

这个问题真的让人很崩溃。。

一直反复尝试和寻找后，网上关于这个问题的资料真的少之又少，历经九九八十一难，终于找到问题的原因。

原来Ds4windows需要安装.NET RUNTIME和.NET DESKTOP RUNTIME，两个均需要安装，如果只安装其中一个均是不行的，并且必须安装下X86 32位版本。

再次打开一次就能愉快地游戏了！

留个记录帮助有缘人。 