+++
date = '2024-05-15T17:22:23+08:00'
draft = false
title = '解决ValidationError: Progress Plugin Invalid Options options shou'
featured_image = ''
categories = ['编程']
tags= ['vue','vuecli']
toc= false
+++
在vue-cli4升级到vue-cli5的时候出现这个错误。
详细错误信息如下：

``` TS
ERROR  ValidationError: Progress Plugin Invalid Options
        options should NOT have additional properties
        options should NOT have additional properties
        options should NOT have additional properties
        options should pass "instanceof" keyword validation
        options should match exactly one schema in oneOf
```
<!--more-->

## 原因：

这是因为webpack的版本与vue-cli5的版本不匹配引起。

## 解决办法：

除了常规的删除node_modules，清除npm缓存（npm cache clean --force）重新安装外。

如果问题还是无法解决，

请排查package.json文件的dependencies项目，笔者在npm update成功的情况下还是出现这个问题，这意味着在npm构建的关系树里存在依赖webpack4的项目。有一部分webpack的插件是同时支持webpack4和webpack5的，这导致升级vue-cli5时如果只是简单地修改package.json的dependencies版本号再进行升级，看起来是稳妥的，实际上webpack的插件和loador可能没有顺利进行升级而出现这个错误的信息。

笔者的情况是排查dependencies后，发现less-loader的版本过低指向webpack4，所以导致npm update时总是安装webpack4引起与vue-cli5不一致的情况。



## 结语

此类问题不是什么严重的技术问题，但是因为过于细小也会引起一些小骚动。这个也是工程师除了技术外，需要积累经验才能想到原因吧（踩坑足够多就好了）。