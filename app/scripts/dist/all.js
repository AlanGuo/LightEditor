/**
 * codepad 主窗口
 * @author alan
 * @2014/08/25
 */

//注册模块和Controller
var codepad = angular.module('codepad', []);

//快捷键服务，编辑器
codepad.factory('keys',[function(){
	var keys = keymap.create().install(document.body);
	return keys;
}]).factory('magicform',function(){
	return window.magicform;
}).factory('messageQueue',['$rootScope',function($rootScope){
	var messages = {};

	var messageQueue = {
		
		postMessage:function(key,params){
			if(!messages[key]) {messages[key] = [];}
			messages[key].push(params);

			$rootScope.$broadcast(key);

			return messageQueue;
		},
		on:function($scope,key,fn){
			$scope.$on(key,function(){
				fn(messages[key].pop());
			});

			return messageQueue;
		}
	};
	return messageQueue;
}]).factory('le',function(){
	return window.LE;
}).factory('dialog',function(){
	return window.dialog;
}).factory('storage',function(){
	return {};
}).directive('ngLighteditor',['le',function(le){
	return {
		link:function(scope,element/*,attrs,controller*/){
			le.editor = new le.lightEditor(element[0],{language:'js'});
		}
	};
}]);

/*
 *
 * not working
//上下文菜单

// Create one test item for each context type.
var genericOnClick = function(){
	console.log('clicked');
};
chrome.contextMenus.create({id:'1','title': '新建', 'contexts':['all'],'onclick': genericOnClick});
*/
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
codepad.directive('ngKeybind',['keys','messageQueue','le','dialog','storage',function(keys,messageQueue,le,dialog,storage){
	return {
		link:function(){
			keys.bind(['ctrl_s','command_s'],function(){
				chrome.storage.sync.get('codepad.category',function(value){

					if(!value || !value['codepad.category']) {
						value = {'codepad.category':[{text:'收藏夹',val:'category'}]};
					}
					//读取分类信息
					if(value && value['codepad.category']){
						var categorylist = value['codepad.category'];
						//弹出保存窗口
						messageQueue.postMessage('showDialog',{
							data:{
								category:categorylist[0]?categorylist[0].val:'',
								name:(storage.selectedSnippet && storage.selectedSnippet.name) || ''
							},
							config:{
								category:{mf:1,control:'select',label:{title:'分类'},options:categorylist},
								name:{mf:1,label:{title:'文件名'},validation:'required'}
							},
							options:{
								status:'editable',
								hasbuttons:true,
								action:'#',
								buttons:[{
					                'name': '提交',
					                'title': '提交表单',
					                'classname': 'primary',
					                'attr':'ng-click',
					                'submit': true
					            }, {
					                'name': '取消',
					                'title': '取消',
					                'classname': 'normal',
					                'attr':'ng-click=closeDialog($event)'
					            }]
							},
							onsubmit:function(result){
								var category = result.category;
								result.name = result.name.trim();

								chrome.storage.sync.get('codepad.items',function(value){
									if(value && !value['codepad.items']) {
										value['codepad.items'] = {};
									}
									if(value && value['codepad.items']){
										if(!value['codepad.items'][category]) {
											value['codepad.items'][category] = [];
										}
										//避免重复添加
										var filtered = value['codepad.items'][category].filter(function(item){
											if(item.name === result.name){
												return item;
											}
										});

										if(filtered.length === 0){
											//新建
											value['codepad.items'][category].push({name:result.name,content:le.editor.getRawCode()});
											//save
											chrome.storage.sync.set(value);
											//update menu
											messageQueue.postMessage('updateMenu',result);
										}
										else{
											if(storage.selectedSnippet && storage.selectedSnippet === result.name){
												//直接保存
												//save
												chrome.storage.sync.set(value);
											}
											else{
												//覆盖现有代码
												dialog({
													title:'温馨提示',
													content:'确定要覆盖'+result.name+'代码段吗？',
													buttons:[{
														name:'覆盖',
														primary:true,
														callback:function(){
															//更新现有的
															filtered[0].content = le.editor.getRawCode();
															chrome.storage.sync.set(value);
															//update menu
															messageQueue.postMessage('updateMenu',result);
															return true;
														}
													},{
														name:'取消'
													}]
												});
											}
										}
									}
								});

								return true;
							}
						});
					}
				});
				
			});
		}
	};
}]);
codepad.config(function(/*$routeProvider, $locationProvider*/){
	//$routeProvider
});