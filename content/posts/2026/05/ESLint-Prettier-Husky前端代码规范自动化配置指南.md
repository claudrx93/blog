+++
date = '2026-05-12T10:35:00+08:00'
draft = true
title = 'ESLint + Prettier + Husky：前端代码规范自动化配置指南'
categories = ['编程']
tags = ['ESLint', '代码规范', '工程化']
toc = true
+++

团队协作中，代码风格统一是最基本的要求。本文给出一套完整的代码规范自动化方案，确保代码在提交前自动格式化和检查。

## 工具选型

| 工具 | 作用 |
|------|------|
| ESLint | 代码质量检查（语法错误、最佳实践） |
| Prettier | 代码格式化（缩进、换行、引号等） |
| Husky | Git hooks 管理 |
| lint-staged | 只检查暂存区文件，提升速度 |

## 配置步骤

### 1. 安装依赖

<!--more-->

```bash
npm install -D eslint prettier
npm install -D @eslint/js typescript-eslint eslint-plugin-vue
npm install -D eslint-config-prettier eslint-plugin-prettier
npm install -D husky lint-staged
```

### 2. ESLint 配置

使用 ESLint Flat Config（v9+ 新格式）：

```js
// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
  // 基础规则
  js.configs.recommended,
  
  // TypeScript
  ...tseslint.configs.recommended,
  
  // Vue
  ...pluginVue.configs['flat/recommended'],
  
  // Prettier（必须放最后，覆盖冲突规则）
  prettier,
  
  // 自定义规则
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_'
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  },
  
  // 忽略文件
  {
    ignores: ['dist/', 'node_modules/', '*.d.ts']
  }
)
```

### 3. Prettier 配置

```js
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false
}
```

### 4. Husky 配置

```bash
# 初始化
npx husky init

# 添加 pre-commit 钩子
echo "npx lint-staged" > .husky/pre-commit

# 添加 commit-msg 钩子（可选，规范 commit 信息）
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

### 5. lint-staged 配置

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,html,json,md}": [
      "prettier --write"
    ]
  }
}
```

### 6. NPM Scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

## VSCode 配置

确保编辑器保存时自动格式化：

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ]
}
```

推荐扩展：

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "vue.volar"
  ]
}
```

## Commit 规范（可选）

安装 commitlint：

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

```js
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]]
  }
}
```

## 工作流

配置完成后，日常开发流程：

1. **写代码** — VSCode 保存时自动格式化 + ESLint 修复
2. **git add** — 暂存修改文件
3. **git commit** — Husky 触发 pre-commit → lint-staged 检查暂存文件 → 通过则提交
4. **commit message** — Husky 触发 commit-msg → commitlint 检查格式

如果检查不通过，提交会被拦截，修复后重新提交即可。

## 总结

代码规范自动化是项目工程化的基础。ESLint + Prettier + Husky 这套组合覆盖了从编码到提交的全流程，一次配置、全团队受益。建议新项目初始化时就把这套配上，而不是等项目大了再补。
