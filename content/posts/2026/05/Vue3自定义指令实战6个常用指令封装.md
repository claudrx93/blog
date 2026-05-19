+++
date = '2026-05-11T10:35:00+08:00'
draft = true
title = 'Vue 3 自定义指令实战：6 个常用指令封装'
categories = ['编程']
tags = ['Vue3', '自定义指令']
toc = true
+++

Vue 3 的自定义指令在 DOM 操作场景下非常好用，比如权限控制、懒加载、防抖等。本文封装 6 个实际项目中常用的自定义指令。

## 指令注册方式

### 全局注册

```ts
// main.ts
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})
```
<!--more-->
### 局部注册

```vue
<script setup>
const vFocus = {
  mounted(el) {
    el.focus()
  }
}
</script>
```

## 1. v-permission — 权限控制

根据用户权限显示/隐藏元素：

```ts
// directives/permission.ts
import type { Directive } from 'vue'
import { useUserStore } from '@/stores/user'

export const vPermission: Directive<HTMLElement, string[]> = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const requiredPermissions = binding.value
    
    if (!requiredPermissions.some(p => userStore.permissions.includes(p))) {
      el.parentNode?.removeChild(el)
    }
  }
}
```

使用：

```html
<button v-permission="['admin', 'editor']">编辑</button>
```

## 2. v-loading — 加载状态

给元素添加加载遮罩：

```ts
// directives/loading.ts
import type { Directive } from 'vue'

export const vLoading: Directive<HTMLElement, boolean> = {
  mounted(el, binding) {
    toggleLoading(el, binding.value)
  },
  updated(el, binding) {
    toggleLoading(el, binding.value)
  }
}

function toggleLoading(el: HTMLElement, isLoading: boolean) {
  // 移除已有的 loading 元素
  const existing = el.querySelector('.v-loading-mask')
  
  if (isLoading && !existing) {
    const mask = document.createElement('div')
    mask.className = 'v-loading-mask'
    mask.innerHTML = '<div class="v-loading-spinner"></div>'
    mask.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.7); display: flex;
      align-items: center; justify-content: center; z-index: 999;
    `
    el.style.position = 'relative'
    el.appendChild(mask)
  } else if (!isLoading && existing) {
    existing.remove()
  }
}
```

使用：

```html
<div v-loading="isLoading">内容区域</div>
```

## 3. v-debounce — 防抖点击

防止按钮重复提交：

```ts
// directives/debounce.ts
import type { Directive } from 'vue'

export const vDebounce: Directive<HTMLElement, { handler: Function; delay?: number }> = {
  mounted(el, binding) {
    const { handler, delay = 300 } = binding.value
    let timer: number | null = null

    el.addEventListener('click', () => {
      if (timer) clearTimeout(timer)
      timer = window.setTimeout(() => {
        handler()
      }, delay)
    })
  }
}
```

使用：

```html
<button v-debounce="{ handler: handleSubmit, delay: 500 }">提交</button>
```

## 4. v-copy — 一键复制

点击复制文本到剪贴板：

```ts
// directives/copy.ts
import type { Directive } from 'vue'

export const vCopy: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    el.style.cursor = 'pointer'
    el.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(binding.value)
        // 可以触发一个成功提示
        el.dispatchEvent(new CustomEvent('copy-success', { bubbles: true }))
      } catch {
        // fallback
        const textarea = document.createElement('textarea')
        textarea.value = binding.value
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
    })
  },
  updated(el, binding) {
    // 更新复制内容
    el._copyValue = binding.value
  }
}
```

使用：

```html
<span v-copy="inviteCode">点击复制邀请码</span>
```

## 5. v-longpress — 长按事件

移动端常用的长按交互：

```ts
// directives/longpress.ts
import type { Directive } from 'vue'

export const vLongpress: Directive<HTMLElement, Function> = {
  mounted(el, binding) {
    const handler = binding.value
    let timer: number | null = null

    const start = (e: Event) => {
      e.preventDefault()
      timer = window.setTimeout(() => {
        handler()
      }, 500)
    }

    const cancel = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }

    el.addEventListener('mousedown', start)
    el.addEventListener('mouseup', cancel)
    el.addEventListener('mouseleave', cancel)
    el.addEventListener('touchstart', start)
    el.addEventListener('touchend', cancel)
    el.addEventListener('touchcancel', cancel)
  }
}
```

使用：

```html
<div v-longpress="handleLongPress">长按我</div>
```

## 6. v-lazy — 图片懒加载

图片进入视口时才加载：

```ts
// directives/lazy.ts
import type { Directive } from 'vue'

export const vLazy: Directive<HTMLImageElement, string> = {
  mounted(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.src = binding.value
          observer.unobserve(el)
        }
      })
    }, {
      rootMargin: '100px'  // 提前 100px 开始加载
    })

    observer.observe(el)
    el._lazyObserver = observer
  },
  unmounted(el) {
    el._lazyObserver?.disconnect()
  }
}
```

使用：

```html
<img v-lazy="imageUrl" alt="lazy image" />
```

## 统一注册

```ts
// directives/index.ts
import type { App } from 'vue'
import { vPermission } from './permission'
import { vLoading } from './loading'
import { vDebounce } from './debounce'
import { vCopy } from './copy'
import { vLongpress } from './longpress'
import { vLazy } from './lazy'

export function registerDirectives(app: App) {
  app.directive('permission', vPermission)
  app.directive('loading', vLoading)
  app.directive('debounce', vDebounce)
  app.directive('copy', vCopy)
  app.directive('longpress', vLongpress)
  app.directive('lazy', vLazy)
}
```

```ts
// main.ts
import { registerDirectives } from './directives'

const app = createApp(App)
registerDirectives(app)
```

## 总结

自定义指令适合**直接操作 DOM** 的场景，但不要滥用——能用组件实现的优先用组件。这 6 个指令覆盖了权限、交互、性能三个维度，直接复制到项目中即可使用。
