<?php
/**
* 又拍云表单上传签名
* [github](http://github.com/tmkook/upyun)
*/
//----------------------------------------------------------
//操作员帐号
$operator = '操作员账号';

//操作员密码
$password = md5('操作员密码');

//应用名称
$bucket = '应用名称';

//图片保存路径
$savekey = '/{year}/{mon}/{day}/{filemd5}{.suffix}';
//----------------------------------------------------------


//query params
$params = array(
	'bucket'=>$bucket,
	'save-key'=>$savekey,
	'expiration'=>time()+3000
);

//make policy
$policy = base64_encode(json_encode($params));

//signature params
$sign = array(
	'Method'=>'POST',
	'URI'=>'/'.$bucket,
	'Policy'=>$policy,
);

//make signature
$hashdata = implode('&',$sign);
$signature = base64_encode(hash_hmac('sha1',$hashdata,$password,true));
$signature = 'UPYUN '.$operator.':'.$signature;
$return = array('policy'=>$policy,'signature'=>$signature,'bucket'=>$bucket);
echo json_encode($return);