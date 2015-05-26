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