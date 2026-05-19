+++
date = '2026-05-18T10:35:00+08:00'
draft = true
title = 'TypeScript 在 Vue 3 项目中的最佳实践'
categories = ['编程']
tags = ['Vue3', 'TypeScript']
toc = true
+++

TypeScript 已经成为 Vue 3 项目的标配。本文总结在实际项目中积累的 TypeScript 最佳实践，帮你写出更类型安全的 Vue 代码。

## 项目配置

使用 Vite 创建 Vue 3 + TypeScript 项目：

```bash
npm create vite@latest my-app -- --template vue-ts
```
<!--more-->
关键配置文件 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 组件类型定义

### Props 类型

使用 `defineProps` 的泛型写法：

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items: string[]
  status: 'active' | 'inactive'
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  status: 'active'
})
</script>
```

### Emits 类型

```vue
<script setup lang="ts">
interface Emits {
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}

const emit = defineEmits<Emits>()
</script>
```

### Ref 类型

```ts
const count = ref<number>(0)
const user = ref<User | null>(null)
const el = ref<HTMLDivElement | null>(null)
```

## Composable 的类型设计

好的 Composable 应该有完善的类型推导：

```ts
// useFetch.ts
interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
}

interface UseFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  loading: Ref<boolean>
  execute: () => Promise<void>
}

export function useFetch<T>(url: string, options?: UseFetchOptions): UseFetchReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<Error | null>(null)
  const loading = ref(false)

  async function execute() {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(url, {
        method: options?.method || 'GET',
        headers: options?.headers,
        body: JSON.stringify(options?.body)
      })
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { data, error, loading, execute }
}
```

使用时自动推导返回类型：

```ts
interface User {
  id: number
  name: string
}

const { data, loading } = useFetch<User>('/api/user')
// data.value 的类型是 User | null，自动推导
```

## 常见类型技巧

### 工具类型提取 Props

```ts
// 从组件实例提取 Props 类型
type MyComponentProps = InstanceType<typeof MyComponent>['$props']
```

### 使用 satisfies 操作符

```ts
const config = {
  api: 'https://api.example.com',
  timeout: 5000,
  retries: 3
} satisfies Record<string, string | number>
```

### 泛型组件

Vue 3.3+ 支持泛型组件：

```vue
<script setup lang="ts" generic="T extends { id: number }">
defineProps<{
  items: T[]
  selected: T
}>()
</script>
```

## 避免 any 的策略

| 场景 | 不推荐 | 推荐 |
|------|--------|------|
| API 返回值 | any | 定义 interface |
| 事件对象 | any | 具体事件类型 |
| 第三方库无类型 | any | 声明 .d.ts |
| 复杂对象 | any | unknown + 类型守卫 |

## 总结

TypeScript 在 Vue 3 项目中的核心价值是**编译期错误检测**和**IDE 智能提示**。坚持 `strict: true`，避免 `any`，善用泛型和工具类型，你的项目可维护性会大幅提升。
