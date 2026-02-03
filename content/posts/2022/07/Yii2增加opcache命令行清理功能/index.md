+++
date = '2022-07-26T12:03:54+08:00'
draft = true
title = 'Yii2增加opcache命令行清理功能'
featured_image = ''
categories = ['编程']
tags= ['Yii','opcache','php']
toc= false
+++

opcache作为PHP的重要加速功能，可以在生产环境上大大地提升运行速度。如非极度追求速度需要上CLI类的框架，一般生产环境开启opcache即可。

opcache的功能不再叙述，可以参考此文（ https://segmentfault.com/a/1190000023731765?utm_source=tag-newest ）。

opcache的效果立竿见影，但是有一个很严重的问题。就是php-fpm的缓存，只能在php-fpm运行php脚本进行清理。简单来说，就是必须暴露一个接口进行浏览器访问才能清理，而不能在命令行完成。Cli的opcache缓存与fpm的opcache缓存是完全独立的。下面就简单介绍一下在YII2如何利用命令行进行解决。 

<!--more-->

1. 在frontend的模块创建可访问控制器，定义该控制器只能127.0.0.1（内网）才能访问。代码如下： 
```php
/**
 * Opcache控制器
 *
 */
class OpcacheController extends yii\rest\Controller
{
	protected $optional = [
        'reset',
    ];
    /**
     * 重置
     *
     * @return void
     */
    public function actionReset()
    {
        if (\Yii::$app->request->hostName !== '127.0.0.1') {
            throw new NotFoundHttpException();
        }
        if (function_exists('opcache_reset') && opcache_reset()) {
            return $this->success();
        }
        return $this->error();
    }
} 
```

讲解：这里是使用了REST控制器，并且声明了reset方法不用权限验证即可访问。


2、在connsole的模块创建可访问控制器，使用Curl远程访问frontend的opcache控制器对字节码缓存进行清理。代码如下： 
```php
class OpcacheController extends yii\console\Controller
{
	public $baseUrl = 'http://127.0.0.1';
	/**
	 * 重置
	 */
	public function actionReset($baseUrl = '')
	{
		$baseUrl = $baseUrl ?: $this->baseUrl;
		// exec('curl ' . $baseUrl . '/opcache/reset', $result);

		$client = new yii\httpclient\Client();
		$response = $client->get($baseUrl . '/opcache/reset')->send();
		$result = json_decode($response->getContent());
		// $result = json_decode($result[0] ?? '');
		if ($result) {
			$this->stdout('操作成功!' . PHP_EOL);
			return;
		}
		$this->stdout('操作失败!' . PHP_EOL);
		return;
	}
} 
```

讲解：实现远程访问的方式有多样，方法一是curl直接访问（无需PHP，但是服务器必须先安装curl），方法二是使用php的执行exec命令，方法三是使用php脚本。

方法一：

优点：curl直接访问运行速度快，例 curl 127.0.0.1/opcache/reset

缺点：要求服务器必须先安装curl,并且每次都需要手敲命令行，敲错是在所难免，或者写称sh脚本



方法二：

优点：php的执行exec命令，执行的命令同方法一。也是执行速度相对更快，能使用参数输入地址，例php yii /opcache/reset （127.0.0.1：xxxx）,也可以自定义baseUrl。

缺点：要求服务器必须先安装curl,并且方法二的本质还是方法一，如果追求速度不如直接用方法一。



方法三：

优点：使用yii\httpclient\Client进行请求，服务器是否安装curl不影响，并且具备配置设置baseUrl的灵活性，能使用参数输入地址，例php yii /opcache/reset （127.0.0.1：xxxx）。

缺点：执行速度是三种方式重最慢的。



本人最终采用方法三，是感觉竟然采用yii2编写命令行脚本，还使用exec执行的话，那不如直接写curl的命令，或者sh脚本。采用方法三的方式编写后，还可以分享给大家使用。



服务器每次更新代码后，只需要执行php yii /opcache/reset即可。如果非80端口，请自行预配置。但是如果觉得上面的命令行还是太长的话，本人还会写一层npm的scripts简化脚本("oc": "php yii /opcache/reset",)，直接执行npm run oc。



果然懒惰才是促进科技发展的动力（笑）。 