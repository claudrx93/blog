+++
date = '2026-05-13T10:35:00+08:00'
draft = true
title = '前端项目 Docker 化部署实战'
categories = ['编程']
tags = ['Docker', '部署', 'Nginx']
toc = true
+++

将前端项目 Docker 化部署是现代运维的基本操作。本文以 Vue/Vite 项目为例，从 Dockerfile 编写到 CI/CD 配置，给出完整的实战方案。

## 多阶段构建

前端项目的最佳实践是**多阶段构建**：第一阶段构建，第二阶段只保留产物 + Nginx。
<!--more-->
```dockerfile
# 阶段一：构建
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 阶段二：部署
FROM nginx:alpine

# 自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 从构建阶段复制产物
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

最终镜像只有 ~20MB（Nginx + 静态文件），不包含 Node.js 和源码。

## Nginx 配置

针对 SPA 应用的关键配置：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA 路由：所有路径回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存（Vite 构建的文件名带 hash）
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # index.html 不缓存
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1024;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## Docker Compose 一键部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - TZ=Asia/Shanghai
```

```bash
# 构建并启动
docker compose up -d --build

# 查看日志
docker compose logs -f

# 停止
docker compose down
```

## 环境变量处理

前端项目构建时注入环境变量的正确姿势：

```dockerfile
# 方案一：构建时注入（适合变量不常变）
ARG VITE_API_URL=https://api.example.com
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# 方案二：运行时注入（适合频繁变更）
# 构建时用占位符
ARG VITE_API_URL=__API_URL__
RUN npm run build

# 启动脚本替换
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
```

`entrypoint.sh`：

```bash
#!/bin/sh
# 替换 JS 文件中的占位符
find /usr/share/nginx/html/assets -name "*.js" -exec \
  sed -i "s|__API_URL__|${API_URL}|g" {} +

exec "$@"
```

## GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build & Push Docker Image
        run: |
          docker build -t my-app:latest .
          docker tag my-app:latest registry.example.com/my-app:latest
          docker push registry.example.com/my-app:latest

      - name: Deploy to Server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            docker pull registry.example.com/my-app:latest
            docker compose up -d
```

## 常见问题

### 1. 构建时内存不足

Vite 构建大项目可能 OOM：

```dockerfile
RUN node --max-old-space-size=4096 ./node_modules/.bin/vite build
```

### 2. 路由刷新 404

Nginx 缺少 `try_files` 回退规则，确保配置了 SPA 回退。

### 3. 跨域问题

开发环境用 Vite proxy，生产环境在 Nginx 配置反向代理：

```nginx
location /api/ {
    proxy_pass http://backend:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 总结

前端 Docker 化的核心要点：多阶段构建控制镜像大小、Nginx 配置处理 SPA 路由和缓存、环境变量在构建时或运行时注入。这套方案可以覆盖绝大多数前端项目的部署需求。
