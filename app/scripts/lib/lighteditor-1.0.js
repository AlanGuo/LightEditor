/**
 *
 *
 */

window.qnml = window.qnml || {}; 

(function(qnml){
	
	var languages = [];

	var isInit = false;

	var style = [];

	var unknown = null;

	qnml.addLanguage = function(option){
		var nodeNames = qnml.lib.isArray.call(option.nodeName)?option.nodeName:[option.nodeName];

		for(var i=0,nn;nn = nodeNames[i];i++){
			languages.push({
				nodeName:nn,
				parse:option.parse,
				match:new RegExp("<"+nn+"([^>]*)>([\\s\\S]*?)<\\/"+nn+">",'gi')
			});
		}	

		style.push(option.style || '');
	}	
	/**
	 *将文本内容用指定的标记语言来解析
	 *@param {String} raw 文本内容
	 *@param {String} 标记语言标签
	 *@param {Object} 选项
	 */
	qnml.parse = function(raw,nodeName,option){
		var hit = false;
		for(var i = 0,la;la = languages[i];i++){
			if(la.nodeName == nodeName){
				//全文本 属性 内容
				raw = la.parse(raw,null,raw,option);
				hit = true;
				break;
			}
		}

		if(!hit){
			raw = this.parse(raw,"qnml:unknown",option);
		}

		return raw;
	}
	/**
	 *解析文本中的标记语言
	 */
	qnml.parseAll = function(raw,option){
		
		if(!isInit){
			
			this.insertStyle(style.join("\r\n"));
			isInit = true;
		}

		//
		for(var i = 0,la;la = languages[i];i++){
			raw = raw.replace(la.match,function(match,attr,text){
				return la.parse(match,attr,text,option);
			});
		}
		return raw;
	},
	qnml.insertStyle = function(rules){
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
	}

})(window.qnml);
/**
 * QNML - 函数高亮库
 * @class qnml.lib
 */

//test1 var r = /['"]/,x = "xx" 字符串和正则的冲突
//test2 var r = "dd/dfd";//dfdfd  字符串和正则的冲突
//test3 var r = "/*dfdfd*/"; 字符串和注释的冲突
//test4 var r = "//dfdf";
//test5 var r = "'dfd'";
//test6 var r = '"dfd"';


qnml.lib = qnml.lib || {}; 

(function(lib){

	//换行替换符
	var sLine = "@li"+"ne@";

	//\r - 10,\n - 13,\t - 9,\s - 32
	var blanks  = {13:sLine,10:sLine,9:'&nbsp;&nbsp;&nbsp;&nbsp;',32:'&nbsp;',160:'&nbsp;',11:''};

	//注释 . 出\n以外的任何字符
	var rComments = /(\/{2,}[^\r\n]*)|(\/\*[\s\S]*?\*\/)|(<!\-\-[\s\S]*?\-\->)/g;

	//#
	var rPound = /([\r\n])(#.*)/g;　

	//字符串
	var rStr = /(\'.*?[^\\]?\')|(\".*?[^\\]?\")/g;

	//正则
	//var rRegexp = /\/.+?[^\\]\/[igm]?/g;
	var rRegexp = /([,;{(\[\s=:])(\/.+?[^\\]\/)([igm]+|[,.;)\]}\s])/g;

	//数字
	var rNumber = /(\W)(\d+)(\W|$)/g;

	//实体
	var rTag = /[<>'"&;]/g

	//换行
	var rBr = /\r\n/g;

	//缩进（换行）
	var rBlank = /[\s]/g;

	//还原
	var rRest = /@tag(\d+)@/g;
	
	
	var highlight = {
		/** 
		 * @class qnml.lib.Format
		 * @constructor
		 * @param {String} 源码
		 * @param {Object} config 可选参数
		 */
		 /**
		  * @for qnml.lib.Format
		  */
		Format:function(raw,config){
			/**
			 * @property raw 源码
			 * @type {String}
			 */
			this.raw = raw;


			/**
			 * @private 
			 */
			this.index = 0;
			/**
			 * @pravite 
			 */
			this.pool = {};


			/**
			 * @property config 选项
			 * @type {Object}
			 */
			this.config = config || {};

			if(!this.config.option){
				this.config.option = {};
			}

			/**
			 * @property output 源码
			 * @type {String}
			 */
			 //this.output = this.config.option.inner ? raw : this.trim(raw);
			this.output = raw;
		}

	}
	highlight.Format.prototype = {
		/**
		 * 将字符串临时存储起来
		 * @private
		 */
		process:function(text,module){
			this.index++;

			//注意、字符串里面存在缩进和实体
			var obj = {output:String(text)};
			
			this.escape.call(obj);
			this.escBlank.call(obj);

			var data = obj.output.split(sLine);

			this.pool[this.index] = {data:data,module:module};

			return "@tag"+this.index+"@";
		},
		/**
		 * 去掉头尾空串
		 * @private
		 */
		trim:function(raw){
			return  raw.replace(/(^[\r\n]+)|(\s+$)/g, ""); 
		},
		
		/**
		 * 解析字符串
		 * @private
		 */
		escString:function(){
			var __this = this;
			this.output = this.output.replace(rStr,function(match){
				return __this.process(match,'string');
			})
			return this;
		},

		/**
		 * 解析注释
		 * @private
		 */
		escComment:function(){
			var __this = this;
			this.output  = this.output.replace(rComments,function(match){
				return __this.process(match,'comment');
			})
			return this;
		},
		/**
		 * 解析#号后面跟着的字符串
		 * @private
		 */
		escPound:function(){
			var __this = this;
			this.output  = this.output.replace(rPound,function(match,pre,pound){
				return pre+__this.process(pound,'pound');
			})
			return this;
		},
		/**
		 * 解析正则
		 * @private
		 */
		escRegExp:function(){
			var __this = this;
			this.output = this.output.replace(rRegexp,function(match,pre,r,end){
				
				if(/^\/\//.test(r)){
					return match;
				}
				//如果是注释
				if(/[igm]/.test(end)){
					 r+=end;
					 end = '';
				}
				return pre+__this.process(r,'regexp')+end;
			})
			return this;
		},
		/**
		 * 解析数字
		 * @private
		 */
		escNumber:function(){
			var __this = this;
			this.output = this.output.replace(rNumber,function(match,pre,n,tail){
				return pre+__this.process(n,'number')+tail;
			})
			return this;
		},
		/**
		 * 解析关键字
		 * @private
		 */
		escKeyWord:function(){
			
			var __this = this;
			var keywords = this.config.keywords;
			if(keywords){
				this.output = this.output.replace(new RegExp("(^|\\W)("+keywords.join("|")+")(\\W|$)",'g'),function(match,pre,keyword,tail){
					return pre+__this.process(keyword,'keyword')+tail;
				})
			}

			return this;
		},
		/**
		 * 解析函数库
		 * @private
		 */
		escLibrary:function(){
			
			var __this = this;
			var library = this.config.library;
			
			if(library){
				this.output = this.output.replace(new RegExp("(^|\\W)("+library.join("|")+")(\\W|$)",'g'),function(match,pre,fn,tail){
					return pre+__this.process(fn,'library')+tail;
				})
			}

			return this;
		},
		/**
		 * 替换实体
		 * @private
		 */
		escape:function(){
			var __this = this;
			this.output =  this.output.replace(rTag,function(match){
				return "&#"+match.charCodeAt(0)+";";
			})
			return this;
		},
		/**
		 * 替换空白字符串
		 * @private
		 */
		escBlank:function(){
			this.output =  this.output.replace(rBr,function(match){
				return sLine;
			})
			this.output =  this.output.replace(rBlank,function(match){
				return blanks[match.charCodeAt(0)]||'';
			})
			return this;
		},
		/**
		 * 执行校验，主要防止html被多次实体，字符串内类似与注释的未被还原
		 * @private
		 */
		check:function(){
			var __this = this;
			
			this.output =  this.output.replace(/&#38#/g,'&#');

			//剩下的不染色，直接还原
			this.output = this.output.replace(rRest,function(match,id){
				return __this.pool[id].data.join('');
			});
			
			return this;
		},
		/**
		 * 将被替换还原
		 * @private
		 */
		restHtml:function(){
			
			var __this = this;
			var i = 0;


			this.output = this.output.replace(rRest,function(match,id){
				
				return __this.color(__this.pool[id]);
			});

			if(!this.config.option.inner){
				this.output =  this.output.replace(new RegExp(sLine,'g'),function(){
					i++;
					//return (i==1?"":"<br />")+__this.color({data:[i],module:'line'});
					return __this.color({data:[i],module:'line',attr:'unselectable="on"'})+"<br />";
				});
				i++;
				this.output += __this.color({data:[i],module:'line'});
			}

			
			return this;
		},
		/**
		 * 染色
		 * @private
		 */
		color:function(option){
			if(!option){
				return;
			}

			var html = [],str = option.data.length>1?sLine:'';
			for (var i = 0,len=option.data.length;i<len; i++) {
				var text =  option.data[i];
				html.push('<span '+(option.attr||'')+' class="hh-'+option.module+'">'+text+'</span>');
			};
			return html.join(str);
		},
		lightHtml:function(){
			var __this = this;
			var i = 0;
			var pool = {};

			this.output = this.output.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/g,function(match,pre,js,end){
				
				if(!/\w/.test(js)){
					return match;
				}
				i++;
				pool[i] = qnml.parse(js,'qnml:code-js',{inner:true});
				return pre+"{tpl"+i+"}"+end;
			});

			this.output = this.output.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g,function(match,pre,css,end){
				if(/style/i.test(css)){
					return match;
				}
				if(!/\w/.test(css)){
					return match;
				}
				i++;
				pool[i] = qnml.parse(css,'qnml:code-css',{inner:true});
				return pre+"{tpl"+i+"}"+end;
			});

			this.output = this.output.replace(/<!\-\-[\s\S]*?\-\->/g,function(match){
				return __this.process(match,'comment');
			});
			this.output = this.output.replace(/<!DOCTYPE[^>]+>/i,function(match){
				return __this.process(match,'pound');
			});


			this.output = this.output.replace(/(<\w+)(.*?)(>)/g,function(match,begin,attr,end){
				var str1 = __this.process(begin,'tag');
				var str2 = attr.replace(/([\w\-]+=)(\".*?\"|\'.*?\')/g,function(match,attr,val){
					return __this.process(attr,'attr')+__this.process(val,'string');
				});
				var str3 = __this.process(end,'tag');
				return str1+str2+str3
			})
			this.output = this.output.replace(/(\/>|<\/\w+>)/g,function(match){
				return __this.process(match,'tag');
			});

			this.escape();
			this.escBlank();

			this.output = this.output.replace(/{tpl(\d+)}/g,function(match,id){
				return pool[id];
			});

			this.restHtml().check();

			return '<div class="hh-code">'+this.output+'</div>';
		},
		lightCss:function(){
			var __this = this;

			this.escString().escComment();

			this.output = this.output.replace(/([\w\-])\:([^;\r\n}]+)/g,function(match,prop,val){
				return __this.process(prop,'keyword')+":"+__this.process(val,'library');
			});

			this.escBlank().restHtml().check();
			if(this.config.option.inner){
				return this.output;
			}

			return '<div class="hh-code">'+this.output+'</div>';


		},
		lightCode:function(){
			this.escRegExp().escString().escComment().escPound().escNumber().escKeyWord().escLibrary().escape().escBlank().restHtml().check();
			
			if(this.config.option.inner){
				return this.output;
			}
			return '<div class="hh-code">'+this.output+'</div>';
		},
		toString:function(){
			return this.lightCode();
		}

	}
	lib.highlight = highlight;

})(qnml.lib);
qnml.lib = qnml.lib || {}; 
(function(lib){

	var rCode = /```\s*(\w+)([\s\S]+?)\n```/g
	var rP = /\n{2,}([\s\S]+)\n{2,}/g;
	var rTag = /[<>'"&;]/g;
	var rTitle = /(#{1,6})([^\n]+)/g;
	var rEm = /(\*+)([^\*\n]+?)(\*+)/g;
	var rTpl = /{tpl\d+}/g;

	var pool = {},i=0;
	var markdown = {
		toHTML:function(text){
			var that = this;
			//统一各个系统对换行的理解
			text = text.replace(/\r\n/g,"\n").replace(/\r/g,"\n");

			//trim
			text = text.replace(/(^\n+)|(\s+$)/g, ""); 

			//code
			text = text.replace(rCode,function(match,la,code){
					return that.push(that.surround(qnml.parse(code,'qnml:code-'+la)+'',{className:'code'}));
			});
			
			//#
			text = text.replace(rTitle,function(match,h,t){
					return that.push(that.surround(that.pre(t.replace(/#+$/,'')),{className:'title',tag:'h'+h.length}));
			});
			//*
			text = text.replace(rEm,function(match,s,t,e){
					return that.push(that.surround(that.pre(t),{inLine:true,className:'em',style:"font-weight:"+(500+e.length*100)}));
			});

			//p
			text = text.replace(rP,function(match,p){
					return that.push(that.surround(that.pre(p),{className:'paragraph'}));
			});

			//
			text = this.pre(text);

			text = this.pull(text);

			return text;
		},
		pre:function(text){
			
			text =  text.replace(rTag,function(match){
				return "&#"+match.charCodeAt(0)+";";
			})

			text = text.replace(/\r\n/g,"\n").replace(/\r/g,"\n");

			//缩进
			text =  text.replace(/\s/g,function(match){
				return {10:'<br>',9:'&nbsp;&nbsp;&nbsp;&nbsp;',32:'&nbsp;'}[match.charCodeAt(0)]||'';
			})

			return text;

		},
		surround:function(text,option){
			option = option || {};
			var tag = option.tag?option.tag:(option.inLine?"span":'div')
			var html = '<'+tag+' class="md-'+option.className+'" style="'+option.style+'">$</'+tag+'>';
			return html.replace("$",text);
		},
		push:function(text){
			var index = '{tpl'+(++i)+'}';
			pool[index] = text;
			return index
		},
		pull:function(text){
			var that = this;
			text =  text.replace(rTpl,function(match){
				var tpl =  pool[match];
				if(rTpl.test(tpl)){
					return that.pull(tpl);
				}
				return tpl;
			});
			pool = {};
			return text;
		}
	}
	lib.markdown = markdown;
	
})(qnml.lib)
qnml.lib = qnml.lib || {}; 

(function(lib){
	var Ot = Object.prototype.toString;
	lib.isArray = function(){
		return Ot.call(this) == "[object Array]";
	}
	lib.tmpl = function(){
		var cache = {};
		function _getTmplStr(rawStr, mixinTmpl) {
			if(mixinTmpl) {
				for(var p in mixinTmpl) {
					var r = new RegExp('<%#' + p + '%>', 'g');
					rawStr = rawStr.replace(r, mixinTmpl[p]);
				}
			}
			return rawStr;
		};
		return function tmpl(str, data, opt) {
			opt = opt || {};
			var key = opt.key, mixinTmpl = opt.mixinTmpl, strIsKey = !/\W/.test(str);
			key = key || (strIsKey ? str : null);
			var fn = key ? cache[key] = cache[key] || tmpl(_getTmplStr(strIsKey ? document.getElementById(str).innerHTML : str, mixinTmpl)) :
			new Function("obj", "var _p_=[],print=function(){_p_.push.apply(_p_,arguments);};with(obj){_p_.push('" + str
				.replace(/[\r\t\n]/g, " ")
				.split("\\'").join("\\\\'")
				.split("'").join("\\'")
				.split("<%").join("\t")
				.replace(/\t=(.*?)%>/g, "',$1,'")
				.split("\t").join("');")
				.split("%>").join("_p_.push('")
			+ "');}return _p_.join('');");
			return data ? fn( data ) : fn;
		};
	}();
})(qnml.lib)
;(function(){
	qnml.addLanguage({
		nodeName:["qnml:code-cpp","qnml:code-h","qnml:code-c","qnml:code-cc"],
		parse:function(match,attr,text,option){
			return new qnml.lib.highlight.Format(
				text,
				{
					keywords:[
						'typedef',
						'auto',
						'double',
						'inline',
						'short',
						'typeid',
						'bool',
						'int',
						'signed',
						'typename',
						'long',
						'sizeof',
						'case',
						'enum',
						'static',
						'unsigned',
						'namespace',
						'using',
						'char',
						'virtual',
						'struct',
						'class',
						'void',
						'const',
						'private',
						'template',
						'float',
						'protected',
						'public',
						'goto',
						'if',
						'else',
						'while',
						'do',
						'switch',
						'case',
						'new',
						'continue',
						'try',
						'catch',
						'return',
						'break',
						'delete',
						'true',
						'fale'
					],
					library:[
						
					]
				}
			);
		}
	});
})();
;(function(){
	qnml.addLanguage({
		nodeName:["qnml:code-css"],
		parse:function(match,attr,text,option){
			var hh = new qnml.lib.highlight.Format(text,{option:option});
			return hh.lightCss();
		}
	});
})();
;(function(){
	qnml.addLanguage({
		nodeName:["qnml:code-html","qnml:code-htm"],
		parse:function(match,attr,text,option){
			var hh = new qnml.lib.highlight.Format(text);
			return hh.lightHtml();
		},
		style:/*<QNML.STYLE.HH>*/'.hh-code{        font-family: Consolas, "Liberation Mono", Courier, monospace;        font-size: 12px;        line-height: 18px;        color: #333333;        margin-left:40px;        border-left: 1px solid #D4D4D4;        position:relative;        padding:10px;        word-wrap:break-word;        text-decoration:none;    }    u .hh-code{        text-decoration:none;    }    .hh-comment{        color: #999999;        font-style: italic;    }    .hh-pound{        color: #999988;    }    .hh-tag{        color:#000080;    }    .hh-attr{        color:#008080;    }    .hh-string{        color: #d14;    }    .hh-regexp{        color: #009926;    }    .hh-keyword{        font-weight: bold;    }    .hh-library{        color: #0086B3;    }    .hh-number{        color: #009999;    }    .hh-line{        position:absolute;        left:-40px;        display: inline-block;        width: 30px;        color: #aaa;        text-align: right;        padding-right: 8px;        -webkit-user-select:none;    }'/*</QNML.STYLE.HH>*/
	});
})();
;(function(){
	qnml.addLanguage({
		nodeName:["qnml:code-js","qnml:code-as"],
		parse:function(match,attr,text,option){
			option = option || {};
			return new qnml.lib.highlight.Format(
				text,
				{
					keywords:[
						'var',
						'function',
						'if',
						'else',
						'while',
						'do',
						'switch',
						'case',
						'new',
						'continue',
						'in',
						'typeof',
						'instanceof',
						'try',
						'catch',
						'return',
						'break',
						'this',
						'delete',
						'undefined',
						'null',
						'true',
						'fale'
					],
					library:[
						'Array',
						'Boolean',
						'Date',
						'Function',
						'Number',
						'Object',
						'RegExp',
						'String',


						'Error',
						

						"decodeURI",
						"decodeURIComponent",
						"encodeURI",
						"encodeURIComponent",
						"eval",
						"isFinite",
						"isNaN",
						"parseFloat",
						"parseInt",

						"Infinity",
						"JSON",
						"Math",
						"NaN",
						"undefined",
						"null",

						"arguments",

						'document',
						'window',
						'getElementById',
						'getElementsByTagName',
						'addEventListener',
						'removeEventListener',

						'setTimeout',
						'clearTimeout',
						'setInterval',
						'clearInterval'	
					],
					option:option
				}
			);
		}
	});
})();
;(function(){
	qnml.addLanguage({
		nodeName:["qnml:code-php"],
		parse:function(match,attr,text,option){
			return new qnml.lib.highlight.Format(
				text,
				{
					keywords:[
						'__halt_compiler', 'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch', 'class', 'clone', 'const', 'continue', 'declare', 'default', 'die', 'do', 'echo', 'else', 'elseif', 'empty', 'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'eval', 'exit', 'extends', 'final', 'for', 'foreach', 'function', 'global', 'goto', 'if', 'implements', 'include', 'include_once', 'instanceof', 'insteadof', 'interface', 'isset', 'list', 'namespace', 'new', 'or', 'print', 'private', 'protected', 'public', 'require', 'require_once', 'return', 'static', 'switch', 'throw', 'trait', 'try', 'unset', 'use', 'var', 'while', 'xor'
					],
					library:[
						'__CLASS__', '__DIR__', '__FILE__', '__FUNCTION__', '__LINE__', '__METHOD__', '__NAMESPACE__', '__TRAIT__'
					]
				}
			);
		}
	});
})();
;(function(){
	var tpl_edit = /*<QNML.TPL.CODE_EDIT>*/'<div id="<%=isNew?"ve-codewrapper":""%>" class="g_md_codeBox" name="ve-codewrapper" data-qnml="<%=tag%>" contenteditable="false"><!--no gettitle start--><!--no url start--><div name="ve-codeblock" data-language="<%=language%>" data-text="<%=languageText%>" class="code_content"><textarea name="ve-codetextarea" class="ve-codetextarea" _event="textarea"><%=source%></textarea></div><!--no gettitle end--><!--no url end--><!--<div class="code_bottom" contenteditable="false" name="ve-codebottom"><div class="codeType_box codeType_edit" name="ve-bottom"><a class="codeType" href="#inner" _event="changeLanguage" title="<%=languageText%>"><span name="ve-bottomlanguage"><%=languageText%></span><span class="g_ico g_ico_drop3"></span></a><a href="#inner" class="codeType_clear" title="清除格式" _event="clearformat">清除格式</a><div class="codeType_menu g_md_menu g_md_menu_show" name="ve-languageoption" style="display:none"><ul><li><a href="#inner" title="html" value="html|html" _event="codeoption">html</a><span class="g_ico g_ico_tick"></span></li><li><a href="#inner" title="javascript" value="js|javascript" _event="codeoption">javascript</a><span class="g_ico g_ico_tick"></span></li><li><a href="#inner" title="css" value="css|css" _event="codeoption">css</a><span class="g_ico g_ico_tick"></span></li><li><a href="#inner" title="c/c++" value="c|c/c++" _event="codeoption">c/c++</a><span class="g_ico g_ico_tick"></span></li><li class="last"><a href="#inner" title="php" value="php|php" _event="codeoption">php</a><span class="g_ico g_ico_tick"></span></li></ul><span class="arrow"><span class="arrow"></span></span></div></div></div>--></div>'/*</QNML.TPL.CODE_EDIT>*/;
	var tpl_view = /*<QNML.TPL.CODE_VIEW>*/'    <div class="g_md_codeBox"><!--no url start--><!--no gettitle start--><div class="code_content">        <pre class="ve-codepre" name="ve-codepre"><%=hilightcode%></pre>    </div>    <div class="code_bottom">        <span name="ve-codelanguage" class="codeType_box"><%=languageText%></span>    </div><!--no gettitle end--><!--no url end--></div>'/*</QNML.TPL.CODE_VIEW>*/;

	qnml.addLanguage({
		nodeName:"qnml:code",
		parse:function(match,attr,text,option){
			var language = /language=[\"\']?(\w*)[\"\']?/i.exec(attr)[1];
			var languageText = language,oRet;
			//向前兼容
			if(oRet = /text=[\"\']?(\w*)[\"\']?/i.exec(attr)){
				languageText = oRet[1];
			}
			
			if(option && option.status == "edit")
				return qnml.lib.tmpl(tpl_edit, {language:language,languageText:languageText,tag:encodeURIComponent(match),source:text,isNew:option.isNew});
			else{
				//decode
				var div = document.createElement("textarea");
				div.innerHTML = text.replace(/\n/g,"%@%");
				var value = div.value.replace(/%@%/g,"\n");

				if(value =="") value=" ";
				if(value[value.length-1]=="\n")
					value += " ";
				return qnml.lib.tmpl(tpl_view, {language:language,languageText:languageText,hilightcode:qnml.parseAll("<qnml:code-"+language+">"+value+"</qnml:code-"+language+">")});
			}
		},
		style:/*<QNML.STYLE.CODE>*/'    /*终端的样式*/    .g_md_codeBox{background-color:#fbfbfb;border:1px solid #cbcbcb;word-wrap:break-word;word-break:break-all;white-space:normal;position:relative}    .g_md_codeBox .code_content{padding:5px}    .g_md_codeBox .codeType_box{font-size:12px;color:#999}    .g_md_codeBox .code_keyword{color:#39f}    .g_md_codeBox .codeType_edit{}    .g_md_codeBox .code_bottom{position:relative;height:27px}    .g_md_codeBox .code_bottom .codeType_box{padding:0 6px;height:23px;line-height:23px;position:absolute;left:2px;top:0;border:1px dashed transparent}    .g_md_codeBox .code_bottom .codeType_edit{background-color:#fff;border:1px solid #cbcbcb}    .g_md_codeBox .code_bottom .codeType_box a{text-decoration:none}    .g_md_codeBox .code_bottom .codeType_box .codeType{color:#666}    .g_md_codeBox .code_bottom .codeType_box .codeType_clear{border-bottom:1px solid #099;color:#099;padding-bottom:1px}    .g_md_codeBox .code_bottom .g_ico_drop3{margin:0 6px 0 2px}    .g_md_codeBox .codeType_menu{top:23px;left:-1px}    .g_md_codeBox .codeType_menu_above{bottom:23px;left:-1px;border-bottom-width:1px}    .g_md_codeBox .code_bottom .g_md_menu{width:126px}    .g_md_codeBox .code_bottom .g_md_menu a{text-decoration:none}    .g_md_codeBox .code_bottom .g_md_menu .arrow{display:none}    @media screen and (max-width:650px) {        .editTool_code{display:none!important}     }'/*</QNML.STYLE.CODE>*/
	});
})();
;(function(){
	var tpl = /*<QNML.TPL.FILE>*/'<div class="qnml-box">    <div>&nbsp;</div><!--no url start-->    <div data-qnml="<%=data.tag%>" class="content_delete_ie">        <div title="<%=data.name%>" class="g_md_clipBox file_box" contenteditable="false" unselectable="on" _event="viewFile" data-name="<%=data.name%>" data-type="<%=data.filetype%>" <% if(data.src){ %> data-src="<%=data.src%>"<% } %> >            <%     var fileIco = "";    if (data.filetype == 0) {    fileIco = "clip_normal";    } else if (data.filetype == 1) {    fileIco = "clip_normal";    } else {    fileIco = "clip_normal";    }    %>            <span class="ico_clip <%=fileIco%>"></span>            <p class="clipName"><%=data.name%></p>            <% if(data.percent){ %>            <p class="progressBar"><span class="progress" style="width:<%=data.percent%>"></span></p>            <% } %>            <% if(data.filesize){ %>            <p class="size"><%=data.filesize%></p>            <% } %>            <span class="g_ico g_ico_popClose" _event="delFile" title="删除附件"></span>        </div>    </div><!--no url end-->    <div>&nbsp;</div></div>'/*</QNML.TPL.FILE>*/;
	qnml.addLanguage({
		nodeName:"qnml:file",
		parse:function(match,attr,text,option){
			var div = document.createElement("div");
			div.innerHTML = "<span "+attr+"></span>";
			var el = div.getElementsByTagName('span')[0];

			var tag = encodeURIComponent(match);
			var src = el.getAttribute('src');
			var name = el.getAttribute("name");
			var filesize = el.getAttribute("filesize");
			var filetype = el.getAttribute("filetype");
			var percent = el.getAttribute("percent");

			if (!isNaN(filesize)) {
				filesize = filesize ? filesize/1024 : 0;
				if (filesize > 1024) {
					filesize = (filesize/1024).toFixed(2) + 'M'; 
				} else {
					filesize = filesize.toFixed(2) + 'KB';
				}
			}

			return qnml.lib.tmpl(tpl,{data:{tag:tag,src:src,filesize:filesize,name:name,filetype:filetype,percent:percent}});
		},
		style:/*<QNML.STYLE.FILE>*/'.g_md_clipBox{-moz-user-select:none; -webkit-user-select:none; font-weight:normal!important; text-decoration:none!important; color:#666; margin-bottom: 10px;}.g_md_clipBox strong{font-weight:normal}.g_md_clipBox u{text-decoration:none}.g_md_clipBox em{font-style:normal}.file_box{cursor:pointer}.file_box:hover{background-color:#f5f5f5!important}.qnml-box .g_ico_popClose{display:none}.ve-editor .qnml-box .g_ico_popClose{display:inherit}'/*</QNML.STYLE.FILE>*/
	});
})();
;(function(){
	qnml.addLanguage({
		nodeName:"qnml:md",
		parse:function(match,attr,text,option){
			return  qnml.lib.markdown.toHTML(text);
		},
		style:/*<QNML.STYLE.MD>*/'.md-paragraph{margin:10px 0px;padding:5px;border:1px dashed #ccc;}.md-code{border:1px solid #ccc;}'/*</QNML.STYLE.MD>*/
	});
})();
;(function(){
	var tpl = /*<QNML.TPL.TODO>*/'    <div><!--no url start-->    <span class="todo-checkbox note_component content_delete_ie"><span class="<%=checked%>" onclick="if(this.className==\'ico_checkbox\') this.className=\'ico_checkbox_sel\';else if(this.className==\'ico_checkbox_sel\') this.className=\'ico_checkbox\';"></span></span><span class="todo-content"><%=content%></span><!--no url end-->    </div>'/*</QNML.TPL.TODO>*/;
	qnml.addLanguage({
		nodeName:"qnml:item",
		parse:function(match,attr,text,option){
			var div = document.createElement("div");
			div.innerHTML = "<span "+attr+">";
			var el = div.getElementsByTagName('span')[0];

			var checked = el.getAttribute('checked');

			return qnml.lib.tmpl(tpl,{checked:checked=="true"?"ico_checkbox_sel":"ico_checkbox",content:text});
		},
		style:/*<QNML.STYLE.TODO>*/'    .todo-checkbox{    display:inline-block;    vertical-align: middle;    }    .todo-content{    margin-left:10px    }    .note_component span{display: inline-block;width:32px;height:32px;}.note_component .ico_checkbox{background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGRjgwNkVEREYyQkYxMUUyQTUxMUQwNjIxNjA0ODlCRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGRjgwNkVERUYyQkYxMUUyQTUxMUQwNjIxNjA0ODlCRiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkZGODA2RURCRjJCRjExRTJBNTExRDA2MjE2MDQ4OUJGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkZGODA2RURDRjJCRjExRTJBNTExRDA2MjE2MDQ4OUJGIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+c6GDqwAAAIBJREFUeNpi/P//P8NAAiaGAQajDmBB5ty4ccMTSM0FYkkq2/MciJM1NDS2EwoBWljOADVzLsEQgFkOdClVbQeGLAMuj40mwlEHjDpg1AGjDhh1wKgDRh0w6oDB1SqGtl4loW04aoMXxIRACi6FFIKnoGY5NgnG0b7hiHcAQIABAFA6F+FU2FivAAAAAElFTkSuQmCC) no-repeat;}.note_component .ico_checkbox_sel{background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGRjgwNkVEOUYyQkYxMUUyQTUxMUQwNjIxNjA0ODlCRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGRjgwNkVEQUYyQkYxMUUyQTUxMUQwNjIxNjA0ODlCRiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkZGODA2RUQ3RjJCRjExRTJBNTExRDA2MjE2MDQ4OUJGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkZGODA2RUQ4RjJCRjExRTJBNTExRDA2MjE2MDQ4OUJGIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+hyKRkwAAAfpJREFUeNpi/P//P8NAAsZRByA74MaNG55Aai4QS1LZnudAnKyhobEdXYIFjU8LyxmgZoLMlrLzimQD0suAOACIJ7BgUcgAdClVbQeGLNhsqOVrgNgXKpXPRK+4/vP3LwOa5SCwm4lels9csIoBzfJTQBzJQmvL//37xzBn8VqGi1dvMaBZ7nZo2/KPTLS2vKVnGsO5S9exWg7iMNHa8j0HjuK0nKADrt64zdAzZQ7DiTMXKLZcVlqCAd1ybAXRf+Rs6BeZzvDh4ycGJkZGhuqSLAZXRxuyLJeWFGMoyoxnMDUxYiRUEKEAJiZIAP0DOrIVaCgI4HMEyDM9k+egWK4oL8uQkxzBwMvDhd0OfA5oqMhjYGdjQ3HE7v1HcFreN3Uew5ad+1Esn9hRg9Nygg4w0NVk6GwsQ3FEe/8MhqMnzmK1fOO2PRiWC/Dz4Y0ygrnASF8bxRF//vxlqG3rhzsCm+XSkuIME9oJW050NoQ5go2NFcURR06cwWr5pM46BkEBPqJyDN5cgA5AvgZZDHIANgCzXFRECFtlBDKXkawQgAFrC2OG5qpCBhYWZqItp0oUEHIEuZaTXRSDHNFUVcDAw80FtrynpZIsy0lOAxQ2SChPA7QAA+4AFiytV0lYkFEZvCAmBFJwKaQQPAU1y0d7RqMOGJQOAAgwAMJoAaCZeKFxAAAAAElFTkSuQmCC) no-repeat;}.note_component .ico_dot{background: url(component/comp_dot.png) no-repeat 50% 50%;}'/*</QNML.STYLE.TODO>*/
	});
})();
;(function(){
	qnml.addLanguage({
		nodeName:"qnml:unknown",
		parse:function(match,attr,text,option){
			return  qnml.lib.markdown.pre(text);
		}
	});
})();
;(function(){
	var tpl = /*<QNML.TPL.VOICE>*/'<div class="qnml-box"><div>&nbsp;</div><!--no url start--><div data-qnml="<%=data.tag%>" class="content_delete_ie"><div class="g_md_clipBox voice_box stationary_voice_box" contenteditable="false" unselectable="on" data-src="<%=data.src%>" data-seconds="<%=data.seconds%>"><span class="ico_clip clip_play voice_control" _event="playVoice">播放</span><span class="ico_clip clip_pause voice_control" _event="pauseVoice" style="display:none">暂停</span><span class="ico_clip clip_stop voice_control" _event="stopVoice" style="display:none">停止</span><div class="progressBar_play"><p style="width:0%;" class="progress_play"><span class="progress_dot" _event = "voiceProgress"></span></p></div><span class="clipName">录音</span><span class="clipSeconds"><%=data.formartSeconds%></span><span class="clipSize"><%=data.filesize%></span><span class="time_current" style="display:none">00:00</span><span class="time_total" style="display:none"><%=data.formartSeconds%></span><span title="删除录音" _event="delVoice" class="g_ico g_ico_popClose"></span><span class="download_voice" _event="downloadVoice" title="下载"></span>    </div></div><!--no url end-->    <div>&nbsp;</div></div>'/*</QNML.TPL.VOICE>*/;
	qnml.addLanguage({
		nodeName:"qnml:voice",
		parse:function(match,attr,text,option){
			var div = document.createElement("div");
			div.innerHTML = "<span "+attr+"></span>";
			var el = div.getElementsByTagName('span')[0];

			var tag = encodeURIComponent(match);
			var src = el.getAttribute("src");
			var filesize = el.getAttribute("filesize");
			var seconds = el.getAttribute("seconds");
			var m = Math.floor(seconds / 60);
            var s = seconds % 60;
            var formartSeconds = (m>9?m:"0"+m).toString()+":"+(s>9?s:"0"+s).toString();
			filesize = (parseFloat(filesize)/1000).toFixed(2)+"KB";
			return qnml.lib.tmpl(tpl,{data:{tag:tag,src:src,filesize:filesize,seconds:seconds,formartSeconds:formartSeconds}});
		},
		style:/*<QNML.STYLE.VOICE>*/'.voice_control{cursor:pointer}.stationary_voice_box .clipName,.stationary_voice_box .clipSeconds,.stationary_voice_box .clipSize{position:relative; top:9px; margin-right:10px}.voice_box .g_ico_popClose{cursor:pointer}.g_md_clipBox_play .g_ico_popClose{right:0px; top:0px}.download_voice{width:12px; height:13px; display:inline-block; cursor:pointer; background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAANAQMAAACn5x0BAAAAA3NCSVQICAjb4U/gAAAABlBMVEWGjZT///8WZGrIAAAAAnRSTlP/AOW3MEoAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDgvMTcvMTMNl9j1AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M1cbXjNgAAABxJREFUCJlj+PCBAQ0dMGB4UABiWB5gsD/AAAYApKERWcskvewAAAAASUVORK5CYII="); position: relative; left: 10px; top: 10px;}.g_md_clipBox_play .download_voice{display:none}'/*</QNML.STYLE.VOICE>*/
	});
})();

﻿(function(window,undefined){

	window.command = function(){
		this.init.apply(this,arguments);
	};
	
	command.prototype = {
		
		init:function(options){
			this.stepstack = [];
			this.current = -1;
			this.maxStep = 10,
			options = options || {maxStep:10};
			this.maxStep = options.maxStep;
		},

		//每当有新操作的时候调用
		saveStep:function(step){
			if(this.current < this.stepstack.length-1){
				//有操作过回退
				//新增操作将抹掉之前的操作步数
				this.stepstack = this.stepstack.slice(0,this.current+1);
			}
			//如果超过最大长度，就删除第一个
			if(this.stepstack.length >= this.maxStep){
				this.stepstack.shift();
			}
			else{
				this.current++;
			}

			this.stepstack.push(step);
		},

		undo:function(){
			if(this.current > 0){
				this.current--;
			}
			return this.stepstack[this.current];
		},

		redo:function(){
			if(this.current < this.stepstack.length-1){
				this.current++;
			}
			return this.stepstack[this.current];
		},

		//1 <= index <= maxStep
		todo:function(index){
			return this.stepstack[index-1];
		},

		reset:function(){
			this.stepstack = [];
			this.current = -1;
			this.maxStep = 10;
		}
	}
})(window,undefined);
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