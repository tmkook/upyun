/**
* 又拍云form表单上传jQuery插件
* [github](http://github.com/tmkook/upyun)
*/
var UpyunFormUpload = function(ele,opt){
	if(!ele){
		throw 'ele undefined';
	}else if(!opt.ready){
		throw 'opt.ready undefined';
	}else if(typeof(opt.ready) != 'function'){
		throw 'opt.ready not a function';
	}
	
	this.$ele = ele;
	this.opt = opt;
	this.formdata = {};
	this.upUrl = '';
	
	var that = this;
	var signUrl = './upyuntoken.php';
	var script = $('script').each(function(){
		if($(this).attr('src') && $(this).attr('src').indexOf('upyunFormUpload') > -1){
			var url = $(this).attr('src').replace('upyunFormUpload.js','');
			if(url){
				signUrl = url+'upyuntoken.php';
			}
		}
	});

	$.ajax({
		url:signUrl,
		dataType:'JSON',
		success:function(res){
			//获取到sign
			var signature = res.signature;
			var policy = res.policy;
			var bucket = res.bucket;
			that.upUrl = 'http://v0.api.upyun.com/'+bucket;
			that.opt.sign && that.opt.sign(res);
			
			//监听上传表单
			$(that.$ele).on('change',function(){
				var file = $(this)[0].files[0];
				var formdata = new FormData();
				formdata.append('file',file);
				formdata.append('authorization',signature);
				formdata.append('policy',policy);
				that.formdata = formdata;
				that.opt.ready && that.opt.ready(that);
			});
		}
	});	
}

UpyunFormUpload.prototype = {
	upload:function(){
		var that = this;
		that.opt.uploadBefore && that.opt.uploadBefore(this);
		$.ajax({
			url:that.upUrl,
			type:'POST',
			cache:false,
			dataType:'JSON',
			data:that.formdata,
			processData: false,
			contentType: false
		}).done(function(res) {
			if(res.code == 200){
				that.opt.success && that.opt.success(res);
			}else{
				that.opt.error && that.opt.error(res);
			}
		});
	}
}

$.fn.upyunForm = function(options) {
    var up = new UpyunFormUpload(this, options);
	return up;
}