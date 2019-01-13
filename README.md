文件选择
input获取file，拖拽获取file

本地文件预览
图片、pdf、video
readAsDataURL 和 createObjectURL

下载文件
readAdDataURL

## 文件选择
文件选择有两种方式：通过input标签获取和通过拖拽文件到指定区域获取。  

### 通过input标签获取文件

```html
<input type="file" id="fileInput" multiple>
```  

```js
function handleFiles (e) {
    console.log(e.target.files);
}

document.querySelector('#fileInput').addEventListener('change', handleFiles);
```  
一个 `File` 对象主要包含 `name` `size` `type`
这种方式下 `input` 标签的样式不容易定义成我们想要的样子，所以一般都会把它隐藏掉，而利用 `label` 标签的 `for` 属性来触发 `input` 标签的选择文件行为：  
```html
<label class="btn" for="hiddenFileInput">选择文件（隐藏input标签）</label>
<input type="file" id="hiddenFileInput" multiple style="display: none">
```
```js
document.querySelector('#hiddenFileInput').addEventListener('change', handleFiles);
```
对于 `label` 标签，就可以自由的用css重新定义样式了。除了用 `label` 标签触发之外，还可以直接调用 `input` 节点的 `click` 方法来触发选择文件弹窗：
```js
document.querySelector('#fileInput').click();
```

### 通过拖拽文件到指定区域获取
```html
<div class="drop-box" id="dropBox"><p>把文件拖进来</p></div>
```  
```js
function noloop (e) {
    e.stopPropagation();
    e.preventDefault();
}
function onDrop (e) {
    noloop(e);

    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; ++i) {
        previewFile(files[i]);
    }
}
var dropBox = document.querySelector('#dropBox');
dropBox.addEventListener('dragenter', noloop);
dropBox.addEventListener('dragover', noloop);
dropBox.addEventListener('drop', onDrop);
```  
在这里，要对 `dragenter`、`dragover`、`drop`事件做取消默认行为，取消冒泡的处理，否则可能触发浏览器直接打开拖拽的文件的行为。  

## 预览文件
选择文件之后很可能会有预览的需求，最多的场景是预览图片，这里介绍一下预览图片、pdf文件、视频文件的方法，[微软office文档预览点这里](https://www.microsoft.com/en-us/microsoft-365/blog/2013/04/10/office-web-viewer-view-office-documents-in-a-browser)。  
预览这几种文件分别可以用 `img` `iframe` `video` 几个标签，给他们设置上要预览的文件的地址就可以展示在网页上了，于是问题转化成了如何获取本地文件的链接。

### 先来了解一下 window.URL
`window.URL` 是一个函数，主要功能是接收至少两个地址参数，返回合并后的新地址对象：
```js
new URL("../cats/", "https://www.example.com/dogs/");
/* 
{
    hash: ""
    host: "www.example.com",
    hostname: "www.example.com",
    href: "https://www.example.com/cats/",
    origin: "https://www.example.com",
    password: "",
    pathname: "/cats/",
    port: "",
    protocol: "https:",
    search: "",
    searchParams: URLSearchParams {},
    username: ""
}
*/
```
第一个参数可以是相对地址，后面的参数必须是带协议头的地址，然后前面的参数依次覆盖后面参数里的某些部分，有点类似 `Object.assign`，以上是这个函数的功能（感觉并没有什么卵用）。除此之外，window.URL还有两个静态方法：`URL.createObjectURL`、`URL.revokeObjectURL` 这两个方法就比较有用了，前者可以生成 File 对象的 blob url，这个url设置进标签的src属性，用来展示文件。对于生成的url，需要用 URL.revokeObjectURL(url) 来释放掉，以获取更好的性能，否则页面被关闭的时候，会被自动释放掉。示例代码：
```js
// 图片文件
function previewImg (file) {
    var url = window.URL.createObjectURL(file);
    // blob:null/ba752225-a3fd-4865-881d-cacc6e813bd1

    var img = document.createElement('img');
    img.height = 100;
    img.src = url;
    document.querySelector('#dropBox').appendChild(img);
}

// pdf文件
function previewPDF (file) {
    var url = window.URL.createObjectURL(file);
    var frame = document.createElement('iframe');
    frame.width = 200;
    frame.height = 100;
    frame.src = url;
    document.querySelector('#dropBox').appendChild(frame);
}

// 视频文件
function previewVideo (file) {
    var url = window.URL.createObjectURL(file);
    var video = document.createElement('video');
    video.width = 200;
    video.height = 100;
    video.src = url;
    document.querySelector('#dropBox').appendChild(video);
    video.play();
}
```

## 上传文件
这里用 FormData 简单展示一下上传文件的方法，对大文件分片上传、http请求头的设置等内容还不甚了解，在此不作展开了。
```html
<label class="btn" for="uploadFileInput">选择文件并上传</label><input type="file" id="uploadFileInput" style="display: none">
```
```js
function handleUpload (e) {
    var file = e.target.files[0];
    var formData = new FormData();
    formData.append('formdataKey', file, file.name);

    var xhr = new XMLHttpRequest();
    xhr.open('post', 'http://localhost:7000/upload');
    xhr.onload = function (res) {
        console.log(res);
    }
    xhr.send(formData);
}
```
## 文件创建和下载
webAPI里的 Blob 能够帮助我们在前端直接创建文件，在继续之前强烈建议阅读了解一下[理解DOMString、Document、FormData、Blob、File、ArrayBuffer数据类型](https://www.zhangxinxu.com/wordpress/2013/10/understand-domstring-document-formdata-blob-file-arraybuffer/)。  

### 创建文件
```js
// 语法
var aBlob = new Blob( array, options );
```

* array 是一个由ArrayBuffer, ArrayBufferView, Blob, DOMString 等对象构成的 Array ，或者其他类似对象的混合体，它将会被放进 Blob。DOMStrings会被编码为UTF-8。  
* options 是一个可选的BlobPropertyBag字典，它可能会指定如下两个属性：
type，默认值为 ""，它代表了将会被放入到blob中的数组内容的MIME类型。
endings，默认值为"transparent"，用于指定包含行结束符\n的字符串如何被写入。 它是以下两个值中的一个： "native"，代表行结束符会被更改为适合宿主操作系统文件系统的换行符，或者 "transparent"，代表会保持blob中保存的结束符不变    

```js
var domString = `<html>
    <head>
        <title>document</title>    
    </head>
    <body>
        <h3>Hello world</h3>    
    </body>
</html>`;
var blob = new Blob([domString], { type: 'text/html' });
// 这样就创建了一份html文件
// 下面获取它的blob url，并展示：
var blobUrl = URL.createObjectURL(blob);
var f = document.createElement('iframe');
f.src = blobUrl;
document.body.appendChild(f);
```
### 下载文件
下载文件可以利用`a`标签的 `download` 属性：
```html
<a download="a.html" href="blob:...">下载</a>
```
需要注意的是，如果是网络地址，则需要是同域名下的文件才能这样下载。  
对于通过 `ajax` 请求获取到的二进制数据也可以通过上面的方式生成blob对象，并用适当的标签展示，比如图片、视频资源。另一个应用是前端直接导出表格里的数据到本地：
```html
<span class="btn" id="createAndDownloadCSVBtn">创建并导出csv文件</span>
```
```js
function createAndDownloadCSV() {
    var header = ['id', '姓名', '爱好'];
    var data = [
        { id: 1, name: '张三', favirote: '钓鱼' },
        {  id: 2, name: '李四', favirote: '旅行' },
        { id: 3, name: '王五', favirote: '听音乐' }
    ]
    var csvStr = `${header.join(',')}\n${data.map((line) => line.id + ',' + line.name + ',' + line.favirote).join('\n')}`;
    var blob = new Blob([csvStr], { type: 'text/csv' });
    var blobUrl = URL.createObjectURL(blob);
    
    var a = document.createElement('a');
    a.download = `${new Date().toLocaleDateString()}-测试.csv`;
    a.href = blobUrl;
    document.body.appendChild(a);
    a.click();
}

document.querySelector('#createAndDownloadCSVBtn').addEventListener('click', createAndDownloadCSV);
```

## 参考资料
1. [理解DOMString、Document、FormData、Blob、File、ArrayBuffer数据类型](https://www.zhangxinxu.com/wordpress/2013/10/understand-domstring-document-formdata-blob-file-arraybuffer/)
2. [MDN-URL()](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/URL)