+++
date = '2024-03-02T09:04:00+08:00'
draft = false
title = 'Portainer 忘记密码修改密码'
categories = ['编程']
tags = ['Docker', 'Portainer']
toc = true
+++

如果您不幸地忘记 Portainer 的密码，那么只需要执行如下操作：

## 操作步骤

### 1. 停止 Portainer 的运行

```bash
docker stop <容器ID或名称>
```

### 2. 寻找 volume 的映射信息

```bash
docker inspect <容器ID或名称>
```

在输出结果中找到 `Mounts` 部分，记录 `Source` 字段的值（即宿主机上的实际路径）。

### 3. 执行重置密码命令

将 `<Source路径>` 替换为上一步找到的实际路径：

```bash
docker run --rm \
  -v <Source路径>:/data \
  portainer/helper-reset-password
```

执行成功后会输出类似内容：

```
2024/03/02 09:04:26 Password successfully updated for user: admin
2024/03/02 09:04:26 Use the following password to login: x@>q6z4(l~t1Z$g0idWf7F:IN&e3h9)8
```

**请妥善保存输出的新密码。**

### 4. 重新启动 Portainer

```bash
docker start <容器ID或名称>
```

重新登录后请立即修改密码。

## 注意事项

- 重置的是 **admin** 用户的密码
- 如果不记得容器 ID，可以用 `docker ps -a` 查看
- 修改密码后请妥善保存新密码
