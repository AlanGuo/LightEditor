//DialogController
codepad.controller('DialogController', ['$scope','$element','$timeout','$compile','messageQueue',function(
	$scope,
	$element,
	$timeout,
	$compile,
	messageQueue){
	//对话框元素
	var dialog = $element.children()[1];
	var contentDiv = $element[0].querySelector('.form-content');
	var json = null;

	//计算对话框位置
	var computePosition = function(){
		var dialogWidth = dialog.offsetWidth,
		dialogHeight = dialog.offsetHeight;

		var bounds = chrome.app.window.current().getBounds();

		return {
			left : (bounds.width - dialogWidth)/2+'px',
			top : (bounds.height - dialogHeight)/2+'px'
		};
	};
	var showDialog = function(json){
		//生成表单内容
		magicform.generate(contentDiv,magicform.attach(json.data,json.config),json.options);
		//编译模板使angular命令生效
		$compile(contentDiv)($scope);

		$scope.show = true;
		//通知变更
		$scope.$apply();

		$timeout(function(){
			//显示出来之后再计算坐标	
			$scope.position = computePosition();
			$scope.visibility = 'visible';

			//焦点元素
			var focusElem = dialog.getElementsByTagName('input')[0];

			//渲染完成之后再focus
			$timeout(function(){
				focusElem.focus();
				focusElem.select();
			},0);
			
		},0);

	};
	var hideDialog = function(){
		$scope.show = false;
	};

	//表单提交方法，提供基础的数据完整性校验和表单提交
	var submit = function(){
		if(json.onsubmit){
			var result = magicform.detach(magicform.html2json(contentDiv),json.config);
			if(json.onsubmit(result)){
				$scope.show = false;
			}
		}
		else{
			$scope.show = false;
		}
	};

	//对话框默认隐藏
	$scope.show = false;
	$scope.visibility = 'hidden';
	$scope.title = '温馨提示';
	$scope.legend = '保存代码';

	$scope.closeDialog = hideDialog;
	$scope.submit = submit;
	
	//消息队列
	messageQueue.on($scope,'showDialog',function(params){
		json = params;
		showDialog(json);
	});
}]);