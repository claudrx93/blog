+++
date = '2026-01-19T18:07:23+08:00'
draft = false
title = 'Cocos组件为属性设置资源默认值'
categories = ['编程']
tags= ['Cocos']
toc= true
+++

Cocos中为自定义组件设置默认值，一般使用@property装饰器完成。这个也是官方文档中的方法。但是如果遇到需要设置资源这种非数值类的默认值就没有什么办法。

下面介绍一下其他实现的方法。
<!--more-->

## 如何载入素材 
官网介绍对于所有资源类的载入基本就是两种方法：
- 通过IDE拖到自定义节点上进行绑定
- 在script中，通过loadany方法异步加载实现

### 通过IDE加载素材
通过IDE加载素材看起来简单易用适合小白，但是对于多资源或需要封装组件来说，就可能根本用不上。

单色背景是通过精灵组件加载default_sprite_splash素材到SpriteFrame实现的。一般只能通过右键快速创建，如果直接创建了精灵组件或者在属性面板上直接添加了精灵组件的话，就需要自行为SpriteFrame选择default_sprite_splash，这样就显得笨重而且麻烦了，封装的组件难道还要自己把素材拖到指定属性不成？

所以这种实现方法看似简单，实则就是麻烦。不过该方法有一个好处，就是资源预加载，在代码上直接就可以使用了，不用去管异步的问题。

### 在代码种加载
一旦脱离了IDE，在代码中需要使用各种资源，就必须使用loadAny方法进行加载。进入异步环境后，就必须去处理同步和异步的问题。除了使代码变得复杂实在想不到什么好处，不过异步也是JS代码的一大特点，使用promise会比使用callback更加直观，因此必须优先把官方的loadany方法封装成promise的用法。

下面代码仅供参考:
```ts
/**
 * assetManager.loadAny的Promise封装
 * @param params 
 * @returns 
 */
export function loadAny(requests: string | string[] | object | object[]) {
  return new Promise((resolve, reject) => {
    assetManager.loadAny(requests, (err, assets) => {
      if (err) {
        reject(err);
      } else {
        resolve(assets);
      }
    })
  })
}
```


## 坚持和突破点
所以通过深入了解，在COCOS中，资源一般就分为预加载（非异步）和代码加载（异步）两种使用方法。

俗语说念念不忘必有回响，偶然发现在节点上右键->2D对象->单色，这是直接添加了一个精灵对象，并且添加了单色素材。这个效果正是想实现的，但是官网也没有介绍，一度以为是IDE的内部方法实现的。

苦苦思考了很久很久之后，通过AI的问答和测试研究发现，原来COCOS creator里的可视化组件，也是加载后显示的，生命周期里的onload和start方法也是执行的。

在onload时直接对属性进行赋值，跟@property或者设置属性时直接赋值，均可以完成组件的默认值的行为。也就是说，使用script自定义一个组件，然后直接在组件面板添加，即可以带出默认值。因此在onload方法上使用loadAny的方法加载资源素材也是可行的。但是，这样和在代码上直接运行的异步加载并没有区别。

此时，我们引入一个环境变量EDITOR，通过此环境变量可以让某段方法只在IDE编辑器上执行。可以实现在onload方法上缺少默认值时直接加载资源文件默认值，这样加载的资源文件就是保存在场景里，是预加载实现的。

下面代码仅供参考:
```ts
import { _decorator, Component, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;
@ccclass('MyComponent')
export class MyComponent extends Component {
    @property(SpriteFrame)
    public spriteFrame: SpriteFrame | null = null;

    onLoad() {
        // 只在编辑器中且没有 SpriteFrame 时创建
        if (EDITOR && !this.spriteFrame 
        {                               
          loadAny("7dj5uJT9FMn6OrOOx83tfK@f9941")
          .then((spriteFrame: SpriteFrame) => {
                this.spriteFrame = spriteFrame;
            }
            );
        }
    }
}
```

文字上叙述可能比较拗口，一旦拿到IDE上看看效果就能明白。开篇提到的问题也就能解决了。

所有拖到属性面板上的资源文件，其实都是保存在场景文件的JSON文件里，在里面都可以找到对应的资源ID，通过这个JSON文件记录的关系，资源均会预加载直接映射到组件的属性上。这样就不用等待组件上再去加载资源后，异步再去执行代码里。个人认为会比onLoad上再去加载资源快几帧的时间。