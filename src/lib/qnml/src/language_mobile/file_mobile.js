;(function(){
	var tpl = QNML.TPL.FILE;
	qnml.addLanguage({
		nodeName:"qnml:file",
		parse:function(match,attr,text,option){
			var div = document.createElement("div");
			div.innerHTML = "<span "+attr+">";
			var el = div.getElementsByTagName('span')[0];

			var src = el.getAttribute('src');
			var filesize = el.getAttribute("filesize");
			var name = el.getAttribute("name");
			var createtime = new Date(el.getAttribute("createtime")*1000);

			filesize = (parseFloat(filesize)/1024).toFixed(2)+"KB";
			createtime = createtime.getFullYear()+"-"+(createtime.getMonth()+1)+"-"+createtime.getDate();
			
			return qnml.lib.tmpl(tpl,{src:src,filesize:filesize,name:name,createtime:createtime});
		},
		style:QNML.STYLE.FILE
	});
})();