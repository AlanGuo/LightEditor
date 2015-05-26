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