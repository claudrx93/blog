+++
date = '2026-05-16T10:35:00+08:00'
draft = true
title = 'Vite 插件开发入门：打造你自己的构建工具'
categories = ['编程']
tags = ['Vite', '插件开发']
toc = true
+++

Vite 的插件系统基于 Rollup 插件接口扩展而来，开发一个 Vite 插件比想象中简单。本文从零开始，带你开发一个实用的 Vite 插件。

## Vite 插件基础

一个最简单的 Vite 插件：
<!--more-->
```js
// vite-plugin-hello.js
export default function vitePluginHello() {
  return {
    name: 'vite-plugin-hello', // 插件名称，必须唯一
    
    // 构建开始前的钩子
    buildStart() {
      console.log('👋 Hello from vite-plugin-hello!')
    }
  }
}
```

在 `vite.config.js` 中使用：

```js
import hello from './vite-plugin-hello'

export default defineConfig({
  plugins: [hello()]
})
```

## 钩子函数

Vite 插件的核心是钩子函数，分为两类：

### 通用钩子（Rollup 兼容）

| 钩子 | 触发时机 | 用途 |
|------|---------|------|
| `buildStart` | 构建开始 | 初始化 |
| `resolveId` | 解析模块 ID | 自定义模块解析 |
| `load` | 加载模块内容 | 自定义模块加载 |
| `transform` | 转换模块代码 | 代码转换 |
| `buildEnd` | 构建结束 | 清理资源 |

### Vite 独有钩子

| 钩子 | 触发时机 | 用途 |
|------|---------|------|
| `configResolved` | 配置解析完成 | 读取最终配置 |
| `configureServer` | 配置开发服务器 | 添加中间件 |
| `transformIndexHtml` | 转换 index.html | 注入脚本/样式 |
| `handleHotUpdate` | HMR 更新 | 自定义热更新 |

## 实战：开发一个自动导入组件的插件

### 需求

自动扫描 `src/components` 目录，全局注册所有 Vue 组件，无需手动 import。

### 实现

```ts
// vite-plugin-auto-import.ts
import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

export default function vitePluginAutoImport(
  componentsDir = 'src/components'
): Plugin {
  const virtualModuleId = 'virtual:auto-import-components'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'vite-plugin-auto-import',

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },

    load(id) {
      if (id !== resolvedVirtualModuleId) return

      const fullPath = path.resolve(process.cwd(), componentsDir)
      if (!fs.existsSync(fullPath)) return ''

      const files = fs.readdirSync(fullPath)
        .filter(f => f.endsWith('.vue'))

      const imports = files.map(f => {
        const name = path.basename(f, '.vue')
        return `import ${name} from '${componentsDir}/${f}'`
      }).join('\n')

      const registrations = files.map(f => {
        const name = path.basename(f, '.vue')
        return `app.component('${name}', ${name})`
      }).join('\n')

      return `${imports}\n\nexport function registerComponents(app) {\n  ${registrations}\n}`
    },

    transformIndexHtml: {
      enforce: 'pre',
      transform(html) {
        // 自动注入虚拟模块的脚本
        return html
      }
    }
  }
}
```

### 使用

```ts
// main.ts
import { registerComponents } from 'virtual:auto-import-components'

const app = createApp(App)
registerComponents(app)
app.mount('#app')
```

## 实战：开发一个 Mock 数据插件

开发环境下经常需要 Mock API 数据：

```ts
// vite-plugin-mock.ts
import type { Plugin, ViteDevServer } from 'vite'

interface MockItem {
  url: string
  method?: string
  response: any
}

export default function vitePluginMock(mocks: MockItem[]): Plugin {
  return {
    name: 'vite-plugin-mock',
    
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const mock = mocks.find(m => {
          const methodMatch = !m.method || m.method === req.method
          return m.url === req.url && methodMatch
        })

        if (mock) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(mock.response))
          return
        }
        
        next()
      })
    }
  }
}
```

使用：

```ts
// vite.config.ts
import mock from './vite-plugin-mock'

export default defineConfig({
  plugins: [
    mock([
      { url: '/api/user', response: { name: 'Miantu', age: 28 } },
      { url: '/api/posts', response: [{ id: 1, title: 'Hello' }] }
    ])
  ]
})
```

## 调试技巧

1. **使用 `debug` 模块** — 在插件中打印日志，设置 `DEBUG=vite-plugin-*` 环境变量
2. **检查 `transform` 返回值** — 确保返回正确的 sourcemap
3. **区分开发/生产环境** — 用 `apply: 'serve' | 'build'` 控制插件只在特定模式生效

```ts
export default {
  name: 'my-plugin',
  apply: 'serve', // 只在开发模式生效
  // ...
}
```

## 总结

Vite 插件开发的核心是理解钩子函数的执行时机和用途。从简单的 `transform` 钩子开始，逐步掌握虚拟模块、开发服务器中间件等高级功能，就能打造出适合自己项目的构建工具。
