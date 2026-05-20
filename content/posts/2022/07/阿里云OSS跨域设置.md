+++
date = '2022-07-01T10:00:00+08:00'
draft = false
title = '阿里云 OSS 跨域设置'
categories = ['编程']
tags = ['OSS', '跨域', '阿里云']
toc = true
+++

有时网站需要 OSS 返回 `Access-Control-Allow-Origin` 的标识，这个不是什么困难的问题，可以直接在 OSS 控制台进行设置。

## 设置步骤

1. 登录阿里云 OSS 控制台
2. 进入对应的 Bucket
3. 点击左侧菜单 **数据安全** → **跨域设置**
4. 点击「创建跨域规则」，按需求填写：

| 字段 | 说明 |
|------|------|
| 来源 | `*` 或指定域名，如 `https://example.com` |
| 允许 Methods | `GET`, `POST`, `PUT`, `DELETE`, `HEAD` |
| 允许 Headers | `*` 或指定，如 `Authorization`, `Content-Type` |
| 暴露 Headers | `ETag`, `x-oss-request-id` 等 |

## 注意事项

- 来源配置 `*` 只适合开发/测试环境，生产环境应指定具体域名
- 设置后可能需要几分钟生效，可以用浏览器开发者工具的 Network 面板验证响应头是否包含 `Access-Control-Allow-Origin`
