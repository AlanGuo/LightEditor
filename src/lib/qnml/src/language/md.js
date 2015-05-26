;(function(){
	qnml.addLanguage({
		nodeName:"qnml:md",
		parse:function(match,attr,text,option){
			return  qnml.lib.markdown.toHTML(text);
		},
		style:QNML.STYLE.MD
	});
})();