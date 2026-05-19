+++
date = '2026-05-09T10:35:00+08:00'
draft = true
title = 'Vite 构建优化：打包体积从 2MB 降到 400KB'
categories = ['编程']
tags = ['Vite', '性能优化']
toc = true
+++

Vite 开发体验很快，但构建产物的优化需要手动配置。本文记录一次实际的构建优化过程，将打包体积从 2MB 降到 400KB。

## 分析现状

首先用 rollup-plugin-visualizer 分析包组成：

```bash
npm install -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({ open: true, gzipSize: true })
  ]
})
```

构建后生成 stats.html，直观看到每个依赖的占比。

<!--more-->

## 优化一：代码分割

Vite 默认会将所有依赖打包到一个 vendor chunk，导致首屏加载慢。

### 手动分包

```ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue 核心
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // UI 库
          'ui-vendor': ['element-plus'],
          // 工具库
          'utils': ['lodash-es', 'dayjs', 'axios']
        }
      }
    }
  }
})
```

### 动态导入

路由级别的代码分割：

```ts
// ❌ 同步导入
import UserList from '@/views/UserList.vue'

// ✅ 动态导入
const UserList = () => import('@/views/UserList.vue')

const routes = [
  { path: '/users', component: UserList }
]
```

大组件也用动态导入：

```ts
const HeavyChart = defineAsyncComponent(() => import('@/components/HeavyChart.vue'))
```

## 优化二：Tree Shaking

### 确保使用 ESM 版本

```json
// package.json
{
  "module": "dist/index.esm.js"
}
```

### 按需导入

```ts
// ❌ 全量导入
import { debounce, throttle, cloneDeep } from 'lodash'
// 打包整个 lodash (~70KB gzip)

// ✅ 按需导入
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
import cloneDeep from 'lodash/cloneDeep'

// ✅ 或使用 lodash-es（支持 tree shaking）
import { debounce, throttle, cloneDeep } from 'lodash-es'
```

Element Plus 按需导入：

```bash
npm install -D unplugin-vue-components unplugin-auto-import
```

```ts
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    AutoImport({ resolvers: [ElementPlusResolver()] }),
    Components({ resolvers: [ElementPlusResolver()] })
  ]
})
```

## 优化三：替换重型依赖

| 原依赖 | 体积(gzip) | 替代方案 | 体积(gzip) | 节省 |
|--------|-----------|---------|-----------|------|
| lodash | ~25KB | lodash-es / es-toolkit | ~5KB | 80% |
| moment | ~67KB | dayjs | ~2KB | 97% |
| axios | ~13KB | ofetch / ky | ~4KB | 70% |

## 优化四：压缩配置

```ts
// vite.config.ts
export default defineConfig({
  build: {
    // 关闭 sourcemap（生产环境）
    sourcemap: false,
    
    // 设置 chunk 大小警告阈值
    chunkSizeWarningLimit: 500,
    
    // CSS 代码分割
    cssCodeSplit: true,
    
    // Rollup 配置
    rollupOptions: {
      output: {
        // 文件命名（利于缓存）
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    },
    
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 移除 console
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    }
  }
})
```

## 优化五：图片和资源

```ts
// vite.config.ts
export default defineConfig({
  build: {
    // 小于 4KB 的资源内联为 base64
    assetsInlineLimit: 4096
  }
})
```

大图片用 CDN 或压缩：

```ts
// 使用 vite-plugin-imagemin
import viteImagemin from 'vite-plugin-imagemin'

plugins: [
  viteImagemin({
    gifsicle: { optimizationLevel: 7 },
    optipng: { optimizationLevel: 7 },
    mozjpeg: { quality: 80 },
    pngquant: { quality: [0.8, 0.9] },
    svgo: { plugins: [{ name: 'removeViewBox' }] }
  })
]
```

## 优化六：Gzip/Brotli 预压缩

```bash
npm install -D vite-plugin-compression
```

```ts
import viteCompression from 'vite-plugin-compression'

plugins: [
  viteCompression({
    algorithm: 'brotliCompress',  // 或 'gzip'
    threshold: 1024  // 大于 1KB 才压缩
  })
]
```

Nginx 配合：

```nginx
location /assets/ {
  # 优先使用预压缩文件
  gzip_static on;
  brotli_static on;
}
```

## 优化效果

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 总体积 | 2.1MB | 420KB |
| Gzip 后 | 680KB | 135KB |
| 首屏 JS | 1.8MB | 85KB |
| 首屏加载 | 3.2s | 0.8s |

## 总结

构建优化核心思路：

1. **分析** — visualizer 找出体积大户
2. **分包** — 拆分 vendor chunk + 路由懒加载
3. **瘦身** — tree shaking + 按需导入 + 替换重依赖
4. **压缩** — terser + gzip/brotli
5. **度量** — 每次优化后用数据验证效果
