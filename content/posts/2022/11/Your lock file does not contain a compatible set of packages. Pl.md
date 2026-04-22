+++
date = '2022-11-18T17:51:23+08:00'
draft = false
title = 'Your lock file does not contain a compatible set of packages. Pl'
featured_image = ''
categories = ['编程']
tags = ['php','composer']
toc= false
+++


## 问题：

Installing dependencies from lock file (including require-dev)

Verifying lock file contents can be installed on current platform.

Your lock file does not contain a compatible set of packages. Please run composer update.

<!--more-->


## 解决办法：

执行composer install --ignore-platform-reqs 回避版本问题。 