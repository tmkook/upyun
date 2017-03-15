/**
* Ueditor 又拍云单图上传插件
* [github](http://github.com/tmkook/upyun)
*/
UE.registerUI('button', function(editor, uiName) {
    //注册按钮执行时的command命令，使用命令默认就会带有回退操作
    editor.registerCommand(uiName, {
        execCommand: function() {
            var that = this;
            var fileInput = $('<input>').attr('type','file');
            $(fileInput).upyunForm({
                ready:function(up){
                    up.upload();
                },
                success:function(res){
                    that.execCommand('insertHtml', '<img alt="" src="http://img.zctx8.com'+res.url+'">');
                },
                error:function(res){
                    alert('上传失败：'+JSON.stringify(res));
                }
            });
            fileInput.click();
        }
    });
	
    //创建一个button
    var btn = new UE.ui.Button({
        name: uiName,
        title: uiName,
        //添加额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules: 'background-position: -380px 0;',
        //点击时执行的命令
        onclick: function() {
            //这里可以不用执行命令,做你自己的操作也可
            editor.execCommand(uiName);
        }
    });
	
    //当点到编辑内容上时，按钮要做的状态反射
    editor.addListener('selectionchange', function() {
        var state = editor.queryCommandState(uiName);
        if (state == -1) {
            btn.setDisabled(true);
            btn.setChecked(false);
        } else {
            btn.setDisabled(false);
            btn.setChecked(state);
        }
    });
	
    //因为你是添加button,所以需要返回这个button
    return btn;
});