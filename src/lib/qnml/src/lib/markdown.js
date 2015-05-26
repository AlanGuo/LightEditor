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