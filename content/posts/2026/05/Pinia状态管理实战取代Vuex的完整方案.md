+++
date = '2026-05-15T10:35:00+08:00'
draft = true
title = 'Pinia 状态管理实战：取代 Vuex 的完整方案'
categories = ['编程']
tags = ['Vue3', 'Pinia']
toc = true
+++

Pinia 已经成为 Vue 3 官方推荐的状态管理方案，完全取代了 Vuex。本文从实际项目出发，分享 Pinia 的使用经验和最佳实践。

## 为什么选择 Pinia？

相比 Vuex，Pinia 的优势：

- **更简洁** — 没有 mutations，直接修改 state
- **更好的 TS 支持** — 完善的类型推导，无需手写类型
- **更轻量** — 约 1KB gzip
- **模块化** — 每个 Store 独立，无需嵌套模块
- **DevTools 支持** — 完整的时间旅行调试

<!--more-->

## Store 的两种风格

### Option Store（选项式）

类似 Vuex 的写法，适合简单场景：

```ts
// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: 'Miantu',
    age: 28,
    token: localStorage.getItem('token') || ''
  }),

  getters: {
    isLogin: (state) => !!state.token,
    userInfo: (state) => `${state.name}, ${state.age}岁`
  },

  actions: {
    login(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },
    
    logout() {
      this.token = ''
      localStorage.removeItem('token')
    }
  }
})
```

### Setup Store（组合式）

使用 Composition API 风格，更灵活：

```ts
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // state
  const name = ref('Miantu')
  const age = ref(28)
  const token = ref(localStorage.getItem('token') || '')

  // getters
  const isLogin = computed(() => !!token.value)
  const userInfo = computed(() => `${name.value}, ${age.value}岁`)

  // actions
  function login(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function logout() {
    token.value = ''
    localStorage.removeItem('token')
  }

  return { name, age, token, isLogin, userInfo, login, logout }
})
```

**我推荐 Setup Store**，因为它和 Composition API 风格一致，复用 Composable 更方便。

## 在组件中使用

```vue
<script setup>
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

// 解构需要 storeToRefs 保持响应性
const { name, isLogin } = storeToRefs(userStore)
// 方法可以直接解构
const { login, logout } = userStore
</script>
```

## Store 之间互相调用

```ts
// stores/cart.ts
import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  function addItem(item: CartItem) {
    const userStore = useUserStore() // 在 action 内部调用
    if (!userStore.isLogin) {
      throw new Error('请先登录')
    }
    items.value.push(item)
  }

  return { items, addItem }
})
```

## 持久化方案

### 方案一：手动持久化

```ts
// 在 action 中手动处理
function login(token: string) {
  this.token = token
  localStorage.setItem('token', token)
}
```

### 方案二：pinia-plugin-persistedstate

```ts
// main.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// store 中配置
export const useUserStore = defineStore('user', {
  state: () => ({ token: '', name: '' }),
  persist: {
    key: 'user-store',
    paths: ['token'] // 只持久化 token
  }
})
```

## 插件：全局错误处理

```ts
// pinia-error-plugin.ts
import type { PiniaPluginContext } from 'pinia'

export function piniaErrorPlugin({ store }: PiniaPluginContext) {
  store.$onAction(({ name, onError }) => {
    onError((error) => {
      console.error(`[Pinia] Action "${name}" failed:`, error)
      // 可以接入上报系统
    })
  })
}
```

## 常见问题

### Q：重置 Store 状态？

```ts
// Option Store 支持 $reset
userStore.$reset()

// Setup Store 需要自己实现
const initialState = { name: 'Miantu', token: '' }
function $reset() {
  Object.assign(userStore, initialState)
}
```

### Q：批量更新不触发多次渲染？

```ts
// 使用 $patch 批量更新
userStore.$patch({
  name: 'New Name',
  age: 30
})

// 或函数式
userStore.$patch((state) => {
  state.name = 'New Name'
  state.age = 30
})
```

## 总结

Pinia 简洁、类型安全、与 Vue 3 深度集成。从 Vuex 迁移几乎无痛：state → state，getters → getters，mutations → 删除，actions → actions。新项目直接用 Pinia 就对了。
