;(function(){
	var tpl = QNML.TPL.TODO;
	qnml.addLanguage({
		nodeName:"qnml:item",
		parse:function(match,attr,text,option){
			var div = document.createElement("div");
			div.innerHTML = "<span "+attr+">";
			var el = div.getElementsByTagName('span')[0];

			var checked = el.getAttribute('checked');

			return qnml.lib.tmpl(tpl,{checked:checked=="true"?"ico_checkbox_sel":"ico_checkbox",content:text});
		},
		style:QNML.STYLE.TODO
	});
})();