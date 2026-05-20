+++
date = '2022-08-01T10:00:00+08:00'
draft = false
title = '安装 Docker 可视化 UI：Portainer'
categories = ['编程']
tags = ['Docker', 'Portainer', '运维']
toc = true
+++

Portainer 是一个 Docker 的可视化界面，除非您是一个 Docker 命令的高手中的高手，否则安装一个可视化的 UI 界面在 Docker 的管理上是十分有必要的。

官网：[https://portainer.io](https://portainer.io)

## 安装步骤

### 1. 拉取镜像

```bash
sudo docker pull docker.io/portainer/portainer
```

### 2. 启动容器

```bash
sudo docker run -d \
  -p 9000:9000 \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name portainer \
  docker.io/portainer/portainer
```

### 参数说明

| 参数 | 说明 |
|------|------|
| `-p 9000:9000` | 映射 9000 端口，访问时用 |
| `--restart=always` | Docker 重启后自动启动容器 |
| `-v /var/run/docker.sock:/var/run/docker.sock` | 挂载 Docker socket，Portainer 通过它管理 Docker |
| `--name portainer` | 容器名称 |

### 3. 访问

运行后在浏览器打开 `http://服务器IP:9000`，首次访问需要设置管理员账号密码。

## 界面功能

Portainer 可以管理：
- 容器（启动/停止/日志/终端）
- 镜像（拉取/构建/删除）
- 网络、数据卷
- 多 Docker 节点（Portainer Agent 模式）
