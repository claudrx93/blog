+++
date = '2022-07-19T16:41:29+08:00'
draft = false
title = 'Yii2与vue整合开发'
featured_image = ''
categories = ['编程']
tags = ['php','yii','vue']
toc= true
+++

大家使用vue已经习惯了vue全家桶上，其实vue还是可以跟传统的模式进行整合，没有webpack，没有vite。下面来简要介绍一下：

<!--more-->
## Yii引入vue
### 1. 建立VueAsset资源文件，让页面自动加载vue资源
```php 
class VueAsset extends AssetBundle
{
    public $sourcePath = '@webroot';
    public $jsOptions = ['position' => \yii\web\View::POS_HEAD];
    public $css = [
        'css/element-ui/index.css',
    ];

    public $js = [
        'js/vue.min.js',
        'js/element-ui/index.js',
        'js/axios.min.js',
    ];
}
``` 
这里自动引入了elmentUI和axios。vue使用vue2和vue3均可。

### 2. 建立对应的view页面。笔者这里是扩展一个form页面的异步上传图片功能。

```html
<?php
use yii\helpers\Html;
use yii\helpers\Url;
use yii\widgets\ActiveForm;

/* @var $this yii\web\View */
/* @var $model backend\models\QqService */
/* @var $form yii\widgets\ActiveForm */
?>

<div class="qq-service-form">

    <?php
    $form = ActiveForm::begin(); ?>

    <?= $form->field($model, 'code')->textInput(['maxlength' => true]) ?>

    <?= $form->field($model, 'images') ?>
    <?= $form->field($model, 'imagesUrl') ?>
    <div id="images">
        <div v-if='img'>
            <el-image style="width: 100px; height: 100px" :src="img" fit="fill" :preview-src-list="[img]"></el-image>
        </div>

        <el-button @click="dialogVisible = true">上传图片</el-button>
        <el-dialog title="上传图片" :visible.sync="dialogVisible" width="30%" :destroy-on-close="true">
            <el-upload ref="upload" class="upload" drag action="<?= Url::to('/upload/upload') ?>" :headers="headers" :on-success="handleSuccess">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>

    <div class="form-group">
        <?= Html::submitButton('保存', ['class' => 'btn btn-success']) ?>
    </div>

    <?php ActiveForm::end(); ?>

</div>


<script>
    var app = new Vue({
        el: '#images',
        data: function() {
            return {
                dialogVisible: false,
                img: document.querySelector('#qqservice-imagesurl').value,
            }
        },
        methods: {
            handleSuccess: function(response, file) {
                if (response && response.result) {
                    document.querySelector('#qqservice-images').value = response.data;
                    this.img = document.querySelector('#qqservice-imagesurl').value = response.url;
                } else {
                    this.$message({
                        message: response.msg,
                        type: 'error'
                    });
                }
                this.dialogVisible = false;
                this.$refs.upload.clearFiles();
            },
            handleRemove: function(file, fileList) {
                console.log(file, fileList);
            }
        }
    });
    document.querySelector('.field-qqservice-imagesurl').style.display = 'none';
</script>
``` 

## 要点讲解

- vue已经全局注册，直接new可以使用。如果是vue3请使用create的方法创建。

- new新建vue的时候，使用el指定对应的div进行vue实例化。这时div的内容相当于变成模板内容。同时vue此时只是用于处理一个div的内容，原则上一个页面可以有多个vue实例（对应多个div）。这种方法相对于把vue变成一个当页面应用来说，可以jq和vue混合使用。

- ElementUI使用script的方式引入，或者cdn的方式引入时，属于全局引用，不需要使用vue.use进行组件注册。



## 结语
对于活跃于JQ世代的老前端来说，单页面应用并不是唯一的方式，还有传统的网页方式（结合JQ或者直接操作DOM）。仅仅记录一下，相信大部分人也不会这么使用。毕竟现在vue3的工具越来越简单而强大。 