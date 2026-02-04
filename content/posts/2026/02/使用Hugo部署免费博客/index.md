+++
date = '2026-02-03T20:12:50+08:00'
draft = true
title = '使用Hugo部署免费博客'
featured_image = ''
categories = ['编程']
tags = ['hugo']
toc= true
+++

介绍一下本博客的部署方案。本博客是使用Hugo的静态博客方案，托管在Github上，再设置自定义域名。优势就是节省服务器资源，其实博客现在也是一个彰显自己个性但是不讨好费钱的活儿。过去也关注过一些个人博客，也总是莫名其妙就消失不见了。只能感叹每个人的际遇境况各不相同，并非每个人都能坚持维护一个个人博客。目前所知道最成功的一个就是[阮一峰的博客](https://ruanyifeng.com/blog/)。


<!--more-->

## 技术方案
静态博客的热门方案有下面这些：
- Jekyll (Ruby)
- Hugo (Go)
- Hexo​ (Node.js)
- Next.js​ (React)
- VuePress​/VitePress​ (Vue)

对比了很久之后，最后选择了Hugo。这里也是比较有趣，Jekyll是跟Github整合最好的，基本免配置，但是AI直言Ruby构建很慢，而且对于Ruby实在是不太熟悉，不方便以后二次开发也就没有选择。
而Hexo本应该是最合适的选择，主题也多。但是Node.js的构建速度也是较慢，因此选择了与php模板语法差不多的Hugo。
VuePress​/VitePress​ 则更加倾向于文档网站，主题不太合适做博客。

## Github部署
在github上新建一个公共仓库，然后开启pages功能，本来以为则可。但是总是无法把public文件夹设置为网站的发布文件夹，只能设置(root/)。只能改为使用gitaction,设置一下部署脚本，代码如下：
```yml
name: Deploy Hugo to GitHub Pages

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

defaults:
  run:
    shell: bash

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: 0.128.0
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      with:
        submodules: recursive
        fetch-depth: 0
    
    - name: Setup Hugo
      run: |
        wget -O ${{ runner.temp }}/hugo.deb https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb
        sudo dpkg -i ${{ runner.temp }}/hugo.deb
    
    - name: Setup Pages
      id: pages
      uses: actions/configure-pages@v4
    
    - name: Install Node.js (if theme requires)
      if: ${{ steps.cache-npm-deps.outputs.cache-hit != 'true' }}
      uses: actions/setup-node@v4
      with:
        node-version: 20
    
    - name: Build with Hugo
      env:
        HUGO_ENVIRONMENT: production
        HUGO_ENV: production
      run: |
        hugo \
          --gc \
          --minify \
          --baseURL "${{ steps.pages.outputs.base_url }}/"
    
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

```

## 设置个人域名
在github上部署后，则可以设置个人域名，当然前提是得拥有一个个人的域名。可以到[spaceship](https://www.spaceship.com/)上购买同款xyz域名，数字域名10年只要50元多点，也就是一个奶茶钱。
部署的时候有三种方式:
- A记录
- AAA记录
- CNAME记录

在三种方式中选择其中一种则可，把域名指到指定的地址上。其中使用CNAME方式则要考虑github在国内访问不是很方便。笔者使用cloudflare对域名进行托管，则选择A记录的方式。

## 结语
整个博客的搭建其实并不算太困难，最困难的莫过于github的访问不稳定。因此花了大量的时间优先解决github的访问问题。


其实，整个方案都是比较成熟的，而且基本免费，因此是非常好的。但是，对于非程序员可能难度会稍微大点。