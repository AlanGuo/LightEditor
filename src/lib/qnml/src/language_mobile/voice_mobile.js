;(function(){
	var tpl = QNML.TPL.VOICE;
	qnml.addLanguage({
		nodeName:"qnml:voice",
		parse:function(match,attr,text,option){
			var div = document.createElement("div");
			div.innerHTML = "<span "+attr+">";
			var el = div.getElementsByTagName('span')[0];

			var src = el.getAttribute('src');
			var filesize = el.getAttribute("filesize");
			var seconds = el.getAttribute("seconds");
			var m = Math.floor(seconds / 60);
            var s = seconds % 60;
            seconds = (m>9?m:"0"+m).toString()+":"+(s>9?s:"0"+s).toString();
            filesize = (parseFloat(filesize)/1000).toFixed(2)+"KB";

			return qnml.lib.tmpl(tpl,{src:src,filesize:filesize,seconds:seconds});
		},
		style:QNML.STYLE.VOICE
	});
})();