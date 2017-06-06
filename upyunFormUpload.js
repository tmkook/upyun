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
	if(opt.signUrl){
		signUrl = opt.signUrl;
	}else{
		var script = $('script').each(function(){
			if($(this).attr('src') && $(this).attr('src').indexOf('upyunFormUpload') > -1){
				var url = $(this).attr('src').replace('upyunFormUpload.js','');
				if(url){
					signUrl = url+'upyuntoken.php';
				}
			}
		});
	}

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
				that.file = $(this)[0].files[0];
				that.formdata = new FormData();
				that.formdata.append('authorization',signature);
				that.formdata.append('policy',policy);
				that.opt.ready && that.opt.ready(that);
			});
		}
	});	
}

UpyunFormUpload.prototype = {
	compress:function(opt,cb){
		if (!/\/(?:jpeg|png|gif)/i.test(this.file.type)) return;
		var reader = new FileReader();
		reader.readAsDataURL(this.file);
		var that = this;
		reader.onload = function(){
            var result = this.result;
            var img = new Image();
            img.src = result;
            img.onload = function() {
            	console.log(img.width,img.height);
            	if (img.width > 1000) {
            		imw = opt.width? opt.width : img.width;
            		imh = opt.height? opt.height : img.height;
	                that.file = that.imgCompressToBuffer(img,imw,imh);
	                console.log(that.file.size);
	                img = null;
            	}
            	cb && cb();
            }
        };
		return this;
	},

	upload:function(opt){
		var that = this;
		function xhrSend(){
			that.formdata.append('file',that.file);
			that.file = null;
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
				that.formdata = null;
			});
		}
		this.opt.uploadBefore && this.opt.uploadBefore(this);
		if(opt && opt.compress){
			this.compress(opt,xhrSend);
		}else{
			xhrSend();
		}
	},

	imgCompressToBuffer:function(img,width,height) {
	    var initSize = img.src.length;
	    canvas = document.createElement("canvas"),
		ctx = canvas.getContext('2d');

	    //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
	    var ratio;
	    if ((ratio = width * height / 4000000)>1) {
	        ratio = Math.sqrt(ratio);
	        width /= ratio;
	        height /= ratio;
	    }else {
	        ratio = 1;
	    }

	    canvas.width = width;
	    canvas.height = height;

		//铺底色
	    ctx.fillStyle = "#fff";
	    ctx.fillRect(0, 0, canvas.width, canvas.height);

	    //如果图片像素大于100万则使用瓦片绘制
	    var count;
	    if ((count = width * height / 1000000) > 1) {
	    	tCanvas = document.createElement("canvas"),
			tctx = tCanvas.getContext('2d');
	        count = ~~(Math.sqrt(count)+1); //计算要分成多少块瓦片

			//计算每块瓦片的宽和高
	        var nw = ~~(width / count);
	        var nh = ~~(height / count);

	        tCanvas.width = nw;
	        tCanvas.height = nh;

	        for (var i = 0; i < count; i++) {
	            for (var j = 0; j < count; j++) {
	                tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
	                ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
	            }
	        }
	        tCanvas.width = tCanvas.height = 0;
	    } else {
	        ctx.drawImage(img, 0, 0, width, height);
	    }

	    //进行最小压缩
	    var format = 'image/jpeg';
	    var base64 = canvas.toDataURL(format, 0.1);

	    console.log('压缩前：' + initSize);
	    console.log('压缩后：' + base64.length);
	    console.log('压缩率：' + ~~(100 * (initSize - base64.length) / initSize) + "%");
	    console.log(canvas.width,canvas.height);
	    // document.body.appendChild(img);
	    // document.body.appendChild(canvas);

        var code = window.atob(base64.split(",")[1]);
        var aBuffer = new window.ArrayBuffer(code.length);
        var uBuffer = new window.Uint8Array(aBuffer);
        for(var i = 0; i < code.length; i++){
            uBuffer[i] = code.charCodeAt(i) & 0xff ;
        }
        // console.info([aBuffer]);
        // console.info(uBuffer);
        // console.info(uBuffer.buffer);
        // console.info(uBuffer.buffer==aBuffer); //true

        var blob=null;
        try{
            blob = new Blob([uBuffer], {type : format});
        }catch(e){
            window.BlobBuilder = window.BlobBuilder ||
            window.WebKitBlobBuilder ||
            window.MozBlobBuilder ||
            window.MSBlobBuilder;
            if(e.name == 'TypeError' && window.BlobBuilder){
                var bb = new window.BlobBuilder();
                bb.append(uBuffer.buffer);
                blob = bb.getBlob("image/jpeg");

            }else if(e.name == "InvalidStateError"){
                blob = new Blob([aBuffer], {type : format});
            }
        }
        return blob;
	}
}

$.fn.upyunForm = function(options) {
    var up = new UpyunFormUpload(this, options);
	return up;
}



