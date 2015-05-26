codepad.controller('IndexController', ['$scope','$element','le','messageQueue','dialog','storage',function($scope,$element,le,messageQueue,dialog,storage){
	
	var $ul = $element.find('ul');

	var syncMenu = function(filename){
		chrome.storage.sync.get('codepad.items',function(value){
			if(value && value['codepad.items']) {
				var items = value['codepad.items']['category'];
				$scope.snippets = items;
				$scope.$digest();

				if(filename){
					var lis = $ul.find('li');
					for(var i=0;i<lis.length;i++){
						if(angular.element(lis[i]).attr('data-name') === filename){
							lis[i].click();
						}
					}
				}
			}
		});
	};
	
	$scope.snippets = [];
	syncMenu();

	$scope.selected = function(event){
		var $li = angular.element(event.currentTarget);
		$scope.selectedIndex = $li.attr('data-index');

		var selectedSnippet = $scope.snippets.filter(function(item){
			if(item.name === $li.attr('data-name')){
				return item;
			}
		});

		if(selectedSnippet && selectedSnippet[0]){
			storage.selectedSnippet = selectedSnippet[0];
			le.editor.setContent(selectedSnippet[0].content);
		}
	};

	$scope.mouseEnter = function(event){
		var $li = angular.element(event.currentTarget);
		var $close = $li.find('a');
		$close.removeClass('none');
	};

	$scope.mouseLeave = function(event){
		var $li = angular.element(event.currentTarget);
		var $close = $li.find('a');
		$close.addClass('none');
	};

	//新代码
	$scope['new'] = function(){
		$scope.selectedIndex = -1;
		le.editor.setContent('');
		storage.selectedSnippet = {name:''};
	};

	//删除
	$scope['delete'] = function(event){
		var $a = angular.element(event.currentTarget);
		var name = $a.attr('data-name');

		var _dialogIns = dialog({
			title:'温馨提示',
			content:'确定要删除该代码段吗？',
			buttons:[{
				name:'删除',
				primary:true,
				callback:function(){
					//删除选中的代码段
					var newItems = $scope.snippets.filter(function(item){
						if(item.name !== name){
							return item;
						}
					});
					chrome.storage.sync.set({'codepad.items':{'category':newItems}},function(){
						//选中上一个选项
						var $prevli = $a.parent()[0];
						if($prevli && $prevli.previousElementSibling){
							$prevli.previousElementSibling.click();
						}

						$scope.snippets = newItems;
						$scope.$digest();
						_dialogIns.close();
					});

					return false;
				}
			},{
				name:'取消'
			}]
		});
		
	};

	messageQueue.on($scope,'updateMenu',function(file){
		syncMenu(file.name);
	});
}]);