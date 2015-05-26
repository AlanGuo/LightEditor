;(function(){
	qnml.addLanguage({
		nodeName:["qnml:code-html","qnml:code-htm"],
		parse:function(match,attr,text,option){
			var hh = new qnml.lib.highlight.Format(text);
			return hh.lightHtml();
		},
		style:QNML.STYLE.HH
	});
})();