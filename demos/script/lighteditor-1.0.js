/**
 * 代码编辑器
 * @author alan
 * 2013/07/10
 */

 window.LE = {};

(function createLE(LE){
	//css tab-size,bug多				
	var tab = unescape("%A0%A0%A0%A0");
	var tabLength = tab.length;
	//直接用空格填充会有其他问题，这里使用%A0
	var space = unescape("%A0");
	//12288汉字占位符
	var chinese = String.fromCharCode("12288");
	var offset = {left:51,top:10,right:10,bottom:10};
	var enterClicked = true;
	var lastStep = true;
	var inputMethodOpened = false;
	var keydownValue = "";
	var copyStart,copyEnd;
	var isTextContent = false;
	//输入法keydown keycode
	var inputMethodDetectedHash = {
		229: 1, //mac safari, ie9 chrome
		231: 1,
		197: 1	//opera
	}

	var keyDownHandles = {
		"8":function(_self,evt){
			//backspace
			var target = evt.target;
			var value = target.value;
			var start = _self.textarea.selectionStart;
			var end = _self.textarea.selectionEnd;

			_self.saveCurrentValue();
			if(start == end && start>0){
				
				//如果待删除的是tab
				if(_self.rawCode.slice(start-tabLength,start) == tab){
					
					_self.rawCode = _self.rawCode.slice(0,start-tabLength) + _self.rawCode.substring(start);
					_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);
					//textarea中的自定义的tab字符替换为\t计算宽度
					target.value = value.slice(0,start-tabLength) + value.substring(start);
					//定位光标
					target.selectionStart = target.selectionEnd = start-tabLength;

					if(_self.options.adjustHeight){
						_self.adjustHeight();
					}

					return false;
				}
				else{
					//删除最后一排的\n时候, 删除一次之后无效
					if(enterClicked && _self.rawCode[start-2]=="\n" && _self.rawCode.lastIndexOf("\n") <= start){
						_self.rawCode = _self.rawCode.slice(0,start-2);
						enterClicked = false;
					}
					else{
						_self.rawCode = _self.rawCode.slice(0,start-1) + _self.rawCode.substring(start);
					}
					_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);

					if(_self.options.adjustHeight){
						_self.adjustHeight();
					}
					return true;
				}
			}
			else{
				var selectionCode = _self.rawCode.substring(start,end);

				if(enterClicked && _self.rawCode[start-1]=="\n" && _self.rawCode.lastIndexOf("\n") <= start){
					_self.rawCode = _self.rawCode.slice(0,start-1) + _self.rawCode.substring(end);
					enterClicked = false;
				}
				else{
					_self.rawCode = _self.rawCode.slice(0,start) + _self.rawCode.substring(end);
				}
				_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);

				if(_self.options.adjustHeight){
					_self.adjustHeight();
				}
				return true;
			}
		},
		"46":function(_self,evt){
			//delete
			var target = evt.target;
			var value = target.value;
			var start = _self.textarea.selectionStart;
			var end = _self.textarea.selectionEnd;

			if(start == end){
				//如果待删除的是tab
				_self.saveCurrentValue();
				
				if(_self.rawCode.slice(start,start+tabLength) == tab){
					_self.rawCode = _self.rawCode.slice(0,start) + _self.rawCode.substring(start+tabLength);
					_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);

					//textarea中的自定义的tab字符替换为\t计算宽度
					target.value = value.slice(0,start) + value.substring(start+tabLength);
					target.selectionStart = target.selectionEnd = start;

					if(_self.options.adjustHeiginitht){
						_self.adjustHeight();
					}
					return false;
				}
				else{
					_self.rawCode = _self.rawCode.slice(0,start) + _self.rawCode.substring(start+1);
					_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);

					if(_self.options.adjustHeight){
						_self.adjustHeight();
					}
					return true;
				}
			}
			else{

				_self.saveCurrentValue();
				_self.rawCode = _self.rawCode.slice(0,start) + _self.rawCode.substring(end);
				_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);

				return true;
			}
		},
		"9":function(_self,evt){
			//tab
			var target = evt.target;
			var start = target.selectionStart;
			var end = target.selectionEnd;
			var value = target.value.substring(start,end);
			//更新rawCode

			var lines = value.split("\n");
			var codeLines = _self.rawCode.substring(start,end).split("\n");
			value = tab;
			var codeValue = tab;

			for(var i=0,length=lines.length;i<length;i++){
				var l=lines[i];
				if(i==0){
					value += l;
					codeValue += codeLines[i];
				}
				else{
					value += tab + l;
					codeValue += tab + codeLines[i];
				}
				if(i < length-1){
					value += "\n";
					codeValue += "\n"
				}
			}

			_self.saveCurrentValue();
			_self.rawCode = _self.rawCode.slice(0,start) + codeValue + _self.rawCode.substring(end);
			//更新textarea
			target.value = target.value.slice(0,start) + value + target.value.substring(end);
			target.selectionStart  = start + tabLength;
			target.selectionEnd =  end + lines.length * tabLength;

			_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);

			if(_self.options.adjustHeight){
				_self.adjustHeight();
			}

			return false;
		},
		"90":function(_self,evt){
			if(evt.ctrlKey || evt.metaKey){
				//ctrl + z
				//记录当前的数据
				if(!lastStep){
					_self.saveCurrentValue();
					lastStep = true;
				}
				var backStep = _self.command.undo();

				if(backStep != undefined){
					var code = backStep.code;
					var start = backStep.start;
					var end = backStep.end;
					var value = getValueFromCode(code);
					_self.rawCode = code;
					_self.textarea.value = value;
					_self.textarea.selectionEnd = end;
					_self.textarea.selectionStart = start;
					_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);
	
					if(_self.options.adjustHeight){
						_self.adjustHeight();
					}
				}
				
				return false;
			}
			return true;
		},
		"89":function(_self,evt){
			if(evt.ctrlKey || evt.metaKey){
				//ctrl + y
				if(!lastStep){
					_self.saveCurrentValue();
					lastStep = true;
				}

				var step = _self.command.redo();

				if(step != undefined){
					var value = getValueFromCode(step.code);
					_self.rawCode = step.code;
					_self.textarea.value = value;
					_self.textarea.selectionEnd = step.end;
					_self.textarea.selectionStart = step.start;
					_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);
				
					if(_self.options.adjustHeight){
						_self.adjustHeight();
					}
				}
				
				return false;
			}
			return true;
		}
	};

	var util = {
		insertStyle : function(rules){
			var node=document.createElement("style");
			node.type='text/css';
			document.getElementsByTagName("head")[0].appendChild(node);
			if(rules){
				if(node.styleSheet){
					node.styleSheet.cssText=rules;
				}else{
					node.appendChild(document.createTextNode(rules));
				}
			}
			return node.sheet||node;
		},

		extend: function(a,b){
			//for object copy
			for(var p in b){
				a[p] = b[p];
			}
			return a;
		},

		addEvt : function(elem,type,fn){
			if(elem.addEventListener){
				elem.addEventListener(type,fn);
			}
			else if(elem.attachEvent){
				elem.attachEvent('on'+type,fn);
			}
		},
		/**
		 * @method getElementAttribute
		 */
		getElementAttribute : function(target,attr,topElem){

			topElem = topElem || document.body;

			while(target  && target.nodeType == 1){
				var val = target.getAttribute(attr);
				if(val!==null){
					return val;
				}
				if(target == topElem){
					return;
				}
				target = target.parentNode;
			}
		},

		isFunction : function(val){
			return Object.prototype.toString.call(val)==="[object Function]";
		},

		bindEvt: function(topElem,type,dealFnMap,scope){
			util.addEvt(topElem,type,function(event){
				
				var target = event.target || event.srcElement;
				currentTarget = target;

				var returnValue = true;

				if(util.isFunction(dealFnMap)){
					returnValue = dealFnMap.call(target,event,target,scope);
				}
				else {
					var evt = util.getElementAttribute(target,"_event",this);
					if(evt && dealFnMap[evt]){
						returnValue = dealFnMap[evt].call(target,event,target,scope);
					}	
				}

				if(!returnValue){
					if(event.preventDefault)
		                event.preventDefault();
		            else
		                event.returnValue = false
				}

			});
		}
	}

	LE.lightEditor = function(elem,options){
		this.textarea = elem;
		options = options || {};
		
		this.options = util.extend({
			"language":"js",
			"adjustHeight":true,
			"maxBackStep":10,
			"lineHeight":18
		},options);

		this.rawCode = this.textarea.value || this.textarea.innerText;
		//属性
		this.command = new window.command();
		this.command.maxStep = this.options.maxBackStep;
		this.keyDownHandles = keyDownHandles;
		
		//用于自动调整高度的pre元素
		this.mirror = document.createElement("pre");
		this.textBoard = document.createElement("div");
		this.wrapper = document.createElement("div");
		this.heightHolder = document.createElement("div");
		var mirror = this.mirror;
		var textBoard = this.textBoard;
		var wrapper = this.wrapper;
		var textarea = this.textarea;
		var heightHolder = this.heightHolder;

		mirror.setAttribute("name","le-heightpre");
		mirror.className+=" le-common-default le-pre-default";
		//textboard
		
		textBoard.setAttribute("name","le-textboard");
		textBoard.className=" le-common-default le-textboard-default";

		textarea.setAttribute("bind","bind");
		textarea.className+=" le-common-default le-textarea-default";
		var oldParent = textarea.parentNode;
		var oldNextSibling = textarea.nextSibling;
		
		//高度占位符
		
		heightHolder.setAttribute("name","le-heightdiv");

		//嵌套wrapper
		wrapper.setAttribute("name","le-wrapper");
		wrapper.setAttribute("contentediable","false");
		wrapper.appendChild(textBoard);
		wrapper.appendChild(textarea);
		wrapper.appendChild(mirror);
		wrapper.setAttribute("contentediable","false");
		wrapper.appendChild(heightHolder);

		//插入div
		oldParent.insertBefore(wrapper,oldNextSibling);

		//初始化
		this.init();

		return this;
	}

	LE.lightEditor.prototype = {
		init : function(){
			var _self = this;
			util.bindEvt(this.textarea,"keypress",function(evt){
				var start = _self.textarea.selectionStart;
				var end = _self.textarea.selectionEnd;
				//firefox兼容
				if(evt.ctrlKey || evt.altKey || evt.metaKey) return true;
				//回车
				if(evt.keyCode ==13){
					enterClicked = true;
					value = "\n";
					//回车之后立即处理汉字
					filterChinese(_self);

					//换行之后加上tab
					var lastLine = _self.rawCode.substring(0,start).split("\n").slice(-1)[0];
					if(lastLine){
						var tabAtStart = new RegExp("^("+tab+")+").exec(lastLine);
						if(tabAtStart){
							var tabCount = tabAtStart[0].length/tabLength;
							var startTab = "";
							
							for(var i=0;i<tabCount;i++){
								startTab += tab;
								value += tab;
							}

							var time = setTimeout(function(){
								_self.textarea.value = _self.textarea.value.slice(0,start+1) + startTab + _self.textarea.value.substring(end+1);
								_self.textarea.selectionEnd = _self.textarea.selectionStart = end + 1 + tabCount*tabLength;

								window.clearTimeout(time);
							},10);
						}
					}

					_self.rawCode = _self.rawCode.slice(0,start) + value+ _self.rawCode.substring(end);
					_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);

					if(_self.options.adjustHeight)
						_self.adjustHeight();

					return true;
				}
				else{
					//控制字符不处理
					if(evt.charCode == 0) return true;

					var value = String.fromCharCode(evt.charCode);
					_self.saveCurrentValue();
					_self.rawCode = _self.rawCode.slice(0,start) + value + _self.rawCode.substring(end);
					_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);

					_self.textarea.value = _self.textarea.value.slice(0,start) + space + _self.textarea.value.substring(end);
					//重新定位光标位置
					_self.textarea.selectionStart = _self.textarea.selectionEnd = start + 1;

					if(_self.options.adjustHeight)
						_self.adjustHeight();
				}
			});

			util.bindEvt(this.textarea,"keydown",function(evt){
				
				keyDownValue = _self.textarea.value;

				if(!!inputMethodDetectedHash[evt.keyCode] != inputMethodOpened){
					inputMethodOpened = !!inputMethodDetectedHash[evt.keyCode];
					inputMethodStatusChanged(_self,inputMethodOpened);
				}

				//如果选取没有，取消记录的选取
				if(_self.textarea.selectionStart ==_self.textarea.selectionEnd)
					copyStart = copyEnd;

				//一些控制字符
				var ret = true;
				if(!inputMethodOpened){
					var handle = _self.keyDownHandles[evt.keyCode];
					
					if(handle) 
						ret = handle(_self,evt);
				}
				return ret;
			});

			util.bindEvt(this.textarea,"click",function(evt){
				if(_self.textarea.selectionStart ==_self.textarea.selectionEnd)
					copyStart = copyEnd;
			});

			util.bindEvt(this.textarea,"select",function(evt){
				copyStart = _self.textarea.selectionStart;
				copyEnd = _self.textarea.selectionEnd;
			});

			util.bindEvt(this.textarea,"paste",function(evt){

				var start = _self.textarea.selectionStart;
				var end = _self.textarea.selectionEnd;
				//\r\n替换成\n
				//防止\t出现
				var clipboardData = evt.clipboardData || window.clipboardData;
				var pastedText = clipboardData.getData("text").replace(/\r\n/g,"\n").replace(/\t/g,tab);

				_self.saveCurrentValue();
				_self.rawCode = _self.rawCode.slice(0,start) + pastedText + _self.rawCode.substring(end);
				_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);

				_self.textarea.value = getValueFromCode(_self.rawCode);

				_self.textarea.selectionStart = _self.textarea.selectionEnd = end + pastedText.length;

				if(_self.options.adjustHeight)
					_self.adjustHeight();
			});

			util.bindEvt(this.textarea,"copy",function(evt){
				//禁用默认的拷贝
				var target = evt.target;
				var start = target.selectionStart;
				var end = target.selectionEnd;

				var copyText = _self.rawCode.substring(start,end).replace(new RegExp(tab,"g"),"\t");
				var clipboardData = evt.clipboardData || window.clipboardData;
				clipboardData.setData("text",copyText);

				return false;
			});

			util.bindEvt(this.textarea,"cut",function(evt){
				//禁用默认的拷贝
				var target = evt.target;
				var start = target.selectionStart;
				var end = target.selectionEnd;

				var copyText = _self.rawCode.substring(start,end).replace(new RegExp(tab,"g"),"\t");
				var clipboardData = evt.clipboardData || window.clipboardData;
				clipboardData.setData("text",copyText);

				_self.saveCurrentValue();
				_self.rawCode = _self.rawCode.slice(0,start)+_self.rawCode.substring(end);
				_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);
				//update editor
				_self.textarea.value =  target.value.slice(0, start) + target.value.substring(end);
				_self.textarea.selectionStart = _self.textarea.selectionEnd = start;

				if(_self.options.adjustHeight)
					_self.adjustHeight();

				return false;
			});

			util.bindEvt(window,"resize", function(evt){
				if(_self.options.adjustHeight){
					_self.adjustHeight();
				}
			});
			
			var val = this.textarea.value;
			if(val == undefined){
				if(isTextContent){
					val = this.textarea.textContent;
				}
				else{
					val = this.textarea.innerText;
				}
			}
			_self.rawCode = val.replace(/\t/g,tab);
			//防止\t的出现
			this.textarea.value = getValueFromCode(_self.rawCode);

			if(this.options.adjustHeight){
				this.adjustHeight();
			}

			//autofocus
			this.textarea.focus();
			_self.textBoard.innerHTML = _self.getHighlightCode(_self.options.language);

			if("textContent" in this.textarea){
				isTextContent = true;
			}
		},

		adjustHeight:function(){
			//目前的高度
    		var value = this.rawCode;
			var lastChar = value[value.length-1];

			//填补一个空缺
			if(!isTextContent)
				this.mirror.innerText = value.replace(/\n$/,"\nx");
			else{
				this.mirror.textContent = value.replace(/\n$/,"\nx");
			}
			var height = this.mirror.offsetHeight;
			//var minHeight = getComputedStyle(this.textarea).getPropertyValue("min-height").replace(/\D/g,"");

			//if(height>minHeight && lastChar === "\n") height += this.options.lineHeight;
	    	this.textarea.style.height = this.textBoard.style.height = this.heightHolder.style.height = height + "px";
		},

		getRawCode:function(){
			return this.rawCode;
		},

		getHighlightCode:function(language){
			language = language || this.options.language;
			//解决行号问题分割线在无文本时长度问题
			var value = this.rawCode;
			if(value == "") value = " ";
			if(value[value.length-1]=="\n")
				value+=" ";
			return qnml.parseAll("<qnml:code-"+language+">"+value+"</qnml:code-"+language+">");
		},

		saveCurrentValue:function(){
			this.command.saveStep({code:this.rawCode,start:this.textarea.selectionStart,end:this.textarea.selectionEnd});
			lastStep = false;
		},

		setContent:function(content){
			var end = this.textarea.selectionEnd;
			var pastedText = content.replace(/\r\n/g,"\n");

			this.rawCode = pastedText;
			this.textBoard.innerHTML = this.getHighlightCode(this.options.language);
			this.textarea.value = getValueFromCode(this.rawCode);
			this.textarea.selectionStart = this.textarea.selectionEnd = end + content.length;

			if(this.options.adjustHeight)
				this.adjustHeight();
		}
	}

	//private methods
	var inputMethodStatusChanged = function(ed, opened){
		if(!opened){
			//关闭输入法的时候进行多字节字符过滤
			filterChinese(ed);
		}
		else{
			//输入法打开的时候，//清空选区
			if(copyStart != copyEnd){
				//有选取区的时候，清空选区
				ed.rawCode = ed.rawCode.slice(0,copyStart)+ed.rawCode.substring(copyEnd);
				ed.textBoard.innerHTML = ed.getHighlightCode(ed.options.language);
				copyEnd = copyStart;
			}
		}
	}

	var filterChinese = function(ed){
		if(keydownValue != ed.textarea.value){
			var start = ed.textarea.selectionStart;
			ed.textarea.value = ed.textarea.value.replace(/[\S]/g,function($$,codeStart){
				ed.rawCode = ed.rawCode.slice(0,codeStart)+$$+ed.rawCode.substring(codeStart);
				if(/[\x00-\xff]/.test($$)){
					return space;
				}
				else{
					return chinese;
				}
			});
			ed.textBoard.innerHTML = ed.getHighlightCode(ed.options.language);
			ed.textarea.selectionStart = ed.textarea.selectionEnd = start;
		}
	}

	var getValueFromCode = function(codeText){
		var textareaContent = codeText.replace(/[^\r\n]/g,function($$){
			if(/[^\x00-\xff]/.test($$)){
				return chinese;
			}
			else return space;
		});
		return textareaContent;
	}

})(LE);