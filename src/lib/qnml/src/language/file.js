;(function(){
	var tpl = QNML.TPL.FILE;
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
		style:QNML.STYLE.FILE
	});
})();