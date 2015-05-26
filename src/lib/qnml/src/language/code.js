;(function(){
	var tpl_edit = QNML.TPL.CODE_EDIT;
	var tpl_view = QNML.TPL.CODE_VIEW;

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
		style:QNML.STYLE.CODE
	});
})();