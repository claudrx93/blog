+++
date = '2022-07-27T12:42:25+08:00'
draft = false
title = '关于vue-router的props传值的一次有趣记录'
featured_image = ''
categories = ['编程']
tags = ['vue']
toc = true
+++

## 正文
在开发新组件时测试出一个有趣的现象，现在记录一下。

有一个完整的页面组件Crud.vue及其props参数的配置文件ProductLabeling.js，使用vue-router的props传值，能正常展示数据（如图）。 
<!--more-->
![](1.jpg)

创建一个File.vue的空白组件，包含Crud.vue，此时File组件没有定义任何的props，但是props的值被传递给Crud.vue组件的props(如图)。 
![](2.jpg)
File.vue,代码如下： 
```vue
<script setup lang="ts">
import { ComponentInternalInstance, getCurrentInstance } from 'vue'
import Crud from '../../crud/Index.vue'
const instance = getCurrentInstance() as ComponentInternalInstance
// const props = defineProps(
//     {
//         data: {
//             type: Array,
//             default: [],
//         },
//     }
// )
// console.log(props)
console.log(instance)

</script>

<template>
    <Crud></Crud>
</template> 
```

测试其他情况：

1. 在File.vue组件定义接收的props,会干扰往下传播的props的值，但是不会阻断这个行为（如图）。 
![](3.jpg)
代码如下： 

```vue
<script setup lang="ts">
import { ComponentInternalInstance, getCurrentInstance } from 'vue'
import Crud from '../../crud/Index.vue'
const instance = getCurrentInstance() as ComponentInternalInstance
const props = defineProps(
    {
        data: {
            type: Array,
            default: [],
        },
    }
)
console.log(props)
console.log(instance)

</script>

<template>
    <Crud></Crud>
</template> 
```

2. 修改template，增加一些其他显示，完全阻断这个现象（如图）。 
![](4.png)
代码如下： 
```vue
<script setup lang="ts">
import { ComponentInternalInstance, getCurrentInstance } from 'vue'
import Crud from '../../crud/Index.vue'
const instance = getCurrentInstance() as ComponentInternalInstance
// const props = defineProps(
//     {
//         data: {
//             type: Array,
//             default: [],
//         },
//     }
// )
// console.log(props)
console.log(instance)

</script>

<template>
    <div>测试</div>
    <Crud></Crud>
</template> 
```

这里贴一下路由的传值方法 

```js
{
  path: '/productLabeling',
  component: File,
  props: () => {
    return ProductLabeling
  },
}, 
```

写vue3也有一段时间，这个现象完全超出理解的范畴，感觉更像一个BUG。

当然有时我们也想要这个功能把父组件的props完全传递到子组件，但是大部分时间我们都不需要。

通过dev-tool也确定了props数据的传递。使用vue-router传值的props成为了File.vue组件的attrs,而往下传递给Crud.vue组件时，则是实打实的通过props传递进去。

可能template只有一个组件的情况下，衍生出一种类似继承的关系吧（笑）。

网上搜索了一下也没有找到相关的资料，只能单纯记录一下，如果有人能解释这种传值的逻辑欢迎留言讨论。 


--------
## 补充
06.02.03补充

后面在官网翻查了很久资料，发现这是vue组件的一种继承行为，当不定义任何props时，就会出现此种情况。