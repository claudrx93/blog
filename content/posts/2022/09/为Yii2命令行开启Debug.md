+++
date = '2022-09-15T18:00:00+08:00'
draft = false
title = '为 Yii2 命令行开启 Debug'
categories = ['编程']
tags = ['Yii2', 'Debug', 'CLI']
toc = true
+++

Yii2 是一个集命令行工具的框架，对于一些稍微复杂的项目来说，开发命令行（CLI）进行开发辅助或使用队列（Queue）进行任务均是很常见的。但是开发进行调试只能在 console 内完成，这样就比较原始和落后。

Yii2 一直拥有 debug 工具，但是只能用在 Web 端。随着 Yii-debug 升级到 2.1，Yii-debug 工具也能用到命令行上（CLI）。

## 配置方法

在 console 项目的 `main-local.php` 上增加如下配置即可：

```php
<?php
$config['bootstrap'][] = 'debug';
$config['modules']['debug'] = [
    'class' => \yii\debug\Module::class,
    'dataPath' => '@frontend/runtime/debug',
];

return $config;
```

## 注意事项

- `dataPath` 指向 frontend 前台项目，因此直接访问前台的 debug 页面即可看到 command 的记录
- 命令行执行后，debug 数据会写入指定的 `dataPath` 目录
- 在浏览器中访问前台项目的 debug 面板，就能看到命令行的执行记录，包括 SQL 查询、日志、性能数据等

## 总结

Yii-debug 2.1+ 支持命令行调试，只需简单配置即可开启。对于使用队列或命令行任务的 Yii2 项目来说，这是非常实用的功能，不再局限于 `var_dump` 和 `echo` 的原始调试方式。
