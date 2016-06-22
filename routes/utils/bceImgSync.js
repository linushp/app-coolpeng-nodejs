var BosClient = require('bce-sdk-js').BosClient;

var config = {
    endpoint: "https://bj.bcebos.com",         //传入Bucket所在区域域名
    credentials: {
        ak: "f0131c5559d3415e956706caf01d1051",         //您的AccessKey
        sk: "ba90fcb9ee2441faa32f49a909192cc9"       //您的SecretAccessKey
    }
};

var bucket = 'coolpeng';
var key = 'hello.js';
var client = new BosClient(config);

//client.putObjectFromFile(bucket, key, __filename)
//    .then(function (response) {
//        console.log('ok');
//        console.log(response);
//    })    // 成功
//    .catch(function (err) {
//        console.log('err');
//        console.log(err)
//    });      // 失败


client.listBuckets()
.then(function(response){
    console.log('ok');
    console.log(response.body.buckets);

}).catch(function(){

});