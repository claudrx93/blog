+++
date = '2022-06-15T18:00:00+08:00'
draft = false
title = 'Vue3 + Vite 增加打包分析报告'
categories = ['编程']
tags = ['Vue3', 'Vite']
toc = true
+++

打包之后发现文件还是很大，也没有优化的方向。在 Webpack 时代是默认配置了分析报告，只要增加 `--report` 在命令行就可以，但是在 Vite 上默认是没有配置的。

## 解决方法

### 1. 安装 rollup-plugin-visualizer

```bash
npm i rollup-plugin-visualizer -D
```

### 2. 修改 vite.config.ts

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

const lifecycle = process.env.npm_lifecycle_event

export default defineConfig(({ mode }: UserConfig): UserConfig => {
  // 如果原来是对象，要修改为方法，增加 return {} 进行包裹
  return {
    // ......
    plugins: [
      // 只有在 report 命令下才配置打包分析插件
      lifecycle === 'report'
        ? visualizer({ open: true, brotliSize: true, filename: 'report.html' })
        : null
      // ......
    ]
  }
})
```

### 3. 修改 package.json

```json
{
  "scripts": {
    "report": "rimraf dist && cross-env vite build"
  }
}
```

如果打包文件不在 `dist`，请修改为实际的打包目录。如果没有 `cross-env` 请先安装：

```bash
npm i cross-env -D
```

### 4. 运行 report 命令

```bash
npm run report
```

命令行运行完成后会自动在浏览器打开分析报告页面，可以直观地看到每个模块的体积占比，方便定位优化方向。

## 总结

Vite 虽然没有内置打包分析功能，但通过 `rollup-plugin-visualizer` 可以轻松实现。建议只在需要分析时启用，避免影响日常构建速度。
