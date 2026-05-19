+++
date = '2026-05-19T10:35:00+08:00'
draft = true
title = 'Vue 3 Composition API 实战：从 Options API 迁移指南'
categories = ['编程']
tags = ['Vue3', 'Composition API']
toc = true
+++

Vue 3 引入了 Composition API，这是 Vue 生态中最大的范式转变之一。本文将结合实际项目经验，详细介绍如何从 Options API 平滑迁移到 Composition API。

## 为什么需要 Composition API？

在 Options API 中，一个组件的逻辑被拆分到 data、methods、computed、watch 等选项中。当组件变得复杂时，同一个功能的代码散落在不同选项里，难以维护。

Composition API 允许我们按**逻辑功能**组织代码，而不是按选项类型。
<!--more-->
## 核心概念对照

### 响应式数据

**Options API：**
```js
export default {
  data() {
    return {
      count: 0,
      user: { name: 'Miantu' }
    }
  }
}
```

**Composition API：**
```js
import { ref, reactive } from 'vue'

const count = ref(0)           // 基本类型用 ref
const user = reactive({ name: 'Miantu' })  // 对象用 reactive
```



### 计算属性

```js
// Options API
computed: {
  doubleCount() {
    return this.count * 2
  }
}

// Composition API
const doubleCount = computed(() => count.value * 2)
```

### 侦听器

```js
// Options API
watch: {
  count(newVal, oldVal) {
    console.log(newVal)
  }
}

// Composition API
watch(count, (newVal, oldVal) => {
  console.log(newVal)
})
```

## 生命周期钩子映射

| Options API | Composition API |
|---|---|
| beforeCreate | setup() 本身 |
| created | setup() 本身 |
| beforeMount | onBeforeMount |
| mounted | onMounted |
| beforeUpdate | onBeforeUpdate |
| updated | onUpdated |
| beforeUnmount | onBeforeUnmount |
| unmounted | onUnmounted |

## 实战：封装可复用逻辑

Composition API 最大的优势是逻辑复用。以前我们需要 Mixin，现在用 Composable 函数：

```js
// useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  function reset() {
    count.value = initialValue
  }
  
  return { count, doubleCount, increment, decrement, reset }
}
```

在组件中使用：

```js
import { useCounter } from '@/composables/useCounter'

export default {
  setup() {
    const { count, doubleCount, increment } = useCounter(10)
    return { count, doubleCount, increment }
  }
}
```

## 迁移策略

### 渐进式迁移

不需要一次性改写所有组件。推荐策略：

1. **新组件使用 Composition API** — 旧组件保持不变
2. **使用 `setup()` 选项** — 在 Options API 组件中混用
3. **逐步重构** — 提取逻辑为 Composable，逐步替换

### 使用 setup 语法糖

`<script setup>` 是最简洁的写法：

```vue
<script setup>
import { ref } from 'vue'
import { useCounter } from '@/composables/useCounter'

const { count, increment } = useCounter()

// 无需 return，模板直接可用
</script>
```

## 常见坑与注意事项

1. **ref 需要 .value** — 在 JS 中访问 ref 需要 `.value`，模板中自动解包
2. **reactive 不能重新赋值** — `state = newObj` 会丢失响应性，用 `Object.assign()` 或 ref 替代
3. **解构会丢失响应性** — `const { name } = reactive(obj)` 后 name 不是响应式的，用 `toRefs` 解决

```js
import { toRefs } from 'vue'
const state = reactive({ name: 'Miantu', age: 28 })
const { name, age } = toRefs(state)  // 保持响应性
```

## 总结

Composition API 不是替代 Options API，而是提供了更灵活的组织方式。迁移时不必急于求成，渐进式采用才是最佳实践。核心思路：**新代码用 Composition API，旧代码按需重构**。
