+++
date = '2022-08-15T18:00:00+08:00'
draft = false
title = 'Yii2-Debug 定制技巧：自动刷新、VSCode 跳转与记录行数'
categories = ['编程']
tags = ['Yii2', 'Debug']
toc = true
+++

Yii-debug 作为开发工具是非常好用和简单的，一般也是开箱即用。但是其实 Yii-debug 也拥有一定的定制化能力。这里展示三个实用的功能：增加页面自动刷新、VSCode 打开文件、增加 debug 记录行数。

## 增加页面自动刷新

对于经常需要切换查看 debug 数据的场景，每次切换页面后均需要手动刷新一下页面，这步非常麻烦。因此一直想增加自动刷新功能，后在 JS 中了解到可以检测页面是否隐藏，也找到相关的方法。

自动刷新的核心 JS 代码：

```js
document.addEventListener('visibilitychange', function () {
  if (!document.hidden) {
    location.reload()
  }
})
```

只要把上述代码加入到页面就可以实现了。但是难点是如何增加到页面上——对于官方的组件页面不能直接修改，不然每次组件升级就失效。最后发现可以通过模块注册时增加参数的方式注入修改，这样就避免了直接修改官方组件。

通过 `controllerMap` 指定 default 的方法修改 default 控制器的 layout 参数：

```php
'controllerMap' => [
    'default' => [
        'class' => 'yii\\debug\\controllers\\DefaultController',
        'layout' => '@app/views/debug/layout',
    ],
],
```

把 Yii2-debug 的 layout 文件复制一份到项目上，增加上面的 JS 代码即可。

最终实现效果：每次切换到 debug 的页面均会自动刷新。

## VSCode 打开代码文件

现在很多人使用 VSCode 来编写代码，可以通过配置 `traceLine` 参数直接通过 IDE 打开错误的文件和指定的行数：

```php
'traceLine' => '<a href="vscode://file/{file}:{line}">{text}</a>',
```

如果使用的 IDE 不是 VSCode，也可以自行搜索对应的 URL Scheme 格式。

最终实现效果：可以在浏览器上直接跳转到 VSCode 并打开指定的文件。

## 增加 Debug 记录行数

有时需要在正式环境调试问题，但是 debug 记录的行数太少，默认只有 50 行，还没有看完已经被删除了。可以通过参数增加 debug 记录的历史数据行数：

```php
'historySize' => 500,
```

值得注意的是，debug 记录的历史数据越多系统运行的速度越慢。正式环境不能长期开启 debug 功能。

最终效果：debug 的历史数据会达到 500 条记录再被删除。

## 总结

以上就是 Yii2-debug 的一些定制技巧分享。通过修改 layout 注入 JS、配置 traceLine 和 historySize，可以让 debug 工具更贴合开发习惯，提升调试效率。
