+++
date = '2022-02-12T9:36:18+08:00'
draft = false
title = 'Yii2国内composer安装速度优化'
categories = ['编程']
tags= ['php','Yii']
description ='一般情况下，我们在国内直接使用composer进行安装项目，速度会比较堪忧。经过全网查找资料，笔者找到一个简单有效的方法。原因：如果想探究速度慢的原因，很多文章也分析出来，分别是两点：一，composer的国外源比较慢 二，bower拉取前端资源有部分来自github'
+++

一般情况下，我们在国内直接使用composer进行安装项目，速度会比较堪忧。经过全网查找资料，笔者找到一个简单有效的方法。

原因：

如果想探究速度慢的原因，很多文章也分析出来，分别是两点：

一 composer的国外源比较慢

二 bower拉取前端资源有部分来自github

 <!--more-->

解决：

解决的方法很简单，但是需要几个配置均是对的，才能联动生效。

一，把composer的源切换为国内的源，可以是阿里云的，也可以是其他，自由选择。本人一般配置到项目上，不部署在电脑全局，这样项目在不同环境也会生效。

在composer.json的repositories下进行配置，代码如下：

```json
{
  "repositories": [
    {
      "type": "composer",
      "url": "https://mirrors.aliyun.com/composer/"
    }
  ]
}
```

二，把bower替换为npm拉取前端资源

1.需要通过replace替换资源，使composer不再拉取资源，

在composer.json的replace下进行配置，代码如下：

```json
{
  "replace": {
      "bower-asset/jquery": ">=1.11.0",
      "bower-asset/inputmask": ">=3.2.0",
      "bower-asset/punycode": ">=1.3.0",
      "bower-asset/yii2-pjax": ">=2.0.0",
      "bower-asset/bootstrap": ">=3.4.0"
  }
}
```

2.在项目文件夹新建package.json文件，对npm进行配置。

代码如下：
```json
{
  "dependencies": {
    "jquery": "^2.2.4",
    "bootstrap": "3.3.7",
    "inputmask": "^3.3.11",
    "jquery-treegrid": "^0.3.0",
    "jquery-ui": "^1.12.1",
    "punycode": "^2.1.0",
    "typeahead.js": "^0.11.1",
    "yii2-pjax": "^2.0.7"
  }
}
```

3.在项目配置文件main.php配置别名,使原来引用bower的资源可以正确引用

代码如下：

```php
[
  'aliases' => [
      '@bower' => dirname(dirname(__DIR__)) . '/node_modules',
      '@npm' => dirname(dirname(__DIR__)) . '/node_modules',
  ],
]
```


最后，Yii2安装速度较慢的问题，困扰了好几年。经过不懈的努力，终于找到这个有效的方法，之后Yii2莫名就变得可爱起来了。Yii2的composer安装，往往就是劝退小白的第一步。