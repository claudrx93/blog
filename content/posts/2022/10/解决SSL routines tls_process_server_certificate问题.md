+++
date = '2022-10-08T16:25:20+08:00'
draft = true
title = '解决SSL routines:tls_process_server_certificate问题'
featured_image = ''
categories = ['编程']
tags = ['PHP','Yii']
toc= false
+++

更新sqlsrv驱动后，产生TLS加密的问题，问题如下：

``` SQL
SQLSTATE[08001]: [Microsoft][ODBC Driver 18 for SQL Server]SSL Provider: [error:1416F086:SSL routines:tls_process_server_certificate:certificate verify failed:self signed certificate] 
``` 
<!--more-->

## 原因：

该问题由SSL使用TLS加密通讯引起的证书问题，与代码无关。使用旧版的17驱动即可恢复正常。

## 解决办法：

如果是使用\PDO连接，

在连接的DSN信息增加TrustServerCertificate=1,Encrypt=1即可，在options增加无效。

例：

sqlsrv:Server=IP,端口;Database=dbname;TrustServerCertificate=1;Encrypt=1



如果是Laravel之类数组配置参考如下：
```php
'sqlsrv' => [
    'driver' => 'sqlsrv',
    'host' => env('DB_HOST', 'localhost'),
    'database' => env('DB_DATABASE', 'forge'),
    'username' => env('DB_USERNAME', 'forge'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => 'utf8',
    'prefix' => '',
    'encrypt' => 'yes', // 增加属性
    'trust_server_certificate' => 'true', // 增加属性
],
```

参考 https://www.php.net/manual/zh/ref.pdo-sqlsrv.connection.php