window.qnml=window.qnml||{};
(function(b){var c=[],a=!1,e=[];b.addLanguage=function(a){for(var k=b.lib.isArray.call(a.nodeName)?a.nodeName:[a.nodeName],m=0,h;h=k[m];m++)c.push({nodeName:h,parse:a.parse,match:new RegExp("<"+h+"([^>]*)>([\\s\\S]*?)<\\/"+h+">","gi")});e.push(a.style||"")};b.parse=function(a,k,b){for(var e=!1,l=0,f;f=c[l];l++)if(f.nodeName==k){a=f.parse(a,null,a,b);e=!0;break}e||(a=this.parse(a,"qnml:unknown",b));return a};b.parseAll=function(b,k){a||(this.insertStyle(e.join("\r\n")),a=!0);for(var m=0,h;h=c[m];m++)b=
b.replace(h.match,function(a,b,d){return h.parse(a,b,d,k)});return b};b.insertStyle=function(a){var b=document.createElement("style");b.type="text/css";document.getElementsByTagName("head")[0].appendChild(b);a&&(b.styleSheet?b.styleSheet.cssText=a:b.appendChild(document.createTextNode(a)));return b.sheet||b}})(window.qnml);qnml.lib=qnml.lib||{};
(function(b){var c={13:"@line@",10:"@line@",9:"&nbsp;&nbsp;&nbsp;&nbsp;",32:"&nbsp;",160:"&nbsp;",11:""},a=/(\/{2,}[^\r\n]*)|(\/\*[\s\S]*?\*\/)|(<!\-\-[\s\S]*?\-\->)/g,e=/([\r\n])(#.*)/g,g=/(\'.*?[^\\]?\')|(\".*?[^\\]?\")/g,k=/([,;{(\[\s=:])(\/.+?[^\\]\/)([igm]+|[,.;)\]}\s])/g,m=/(\W)(\d+)(\W|$)/g,h=/[<>'"&;]/g,l=/\r\n/g,f=/[\s]/g,d=/@tag(\d+)@/g,n={Format:function(a,b){this.raw=a;this.index=0;this.pool={};this.config=b||{};this.config.option||(this.config.option={});this.output=a}};n.Format.prototype=
{process:function(a,b){this.index++;var d={output:String(a)};this.escape.call(d);this.escBlank.call(d);d=d.output.split("@line@");this.pool[this.index]={data:d,module:b};return"@tag"+this.index+"@"},trim:function(a){return a.replace(/(^[\r\n]+)|(\s+$)/g,"")},escString:function(){var a=this;this.output=this.output.replace(g,function(b){return a.process(b,"string")});return this},escComment:function(){var b=this;this.output=this.output.replace(a,function(a){return b.process(a,"comment")});return this},
escPound:function(){var a=this;this.output=this.output.replace(e,function(b,d,f){return d+a.process(f,"pound")});return this},escRegExp:function(){var a=this;this.output=this.output.replace(k,function(b,d,f,c){if(/^\/\//.test(f))return b;/[igm]/.test(c)&&(f+=c,c="");return d+a.process(f,"regexp")+c});return this},escNumber:function(){var a=this;this.output=this.output.replace(m,function(b,d,f,c){return d+a.process(f,"number")+c});return this},escKeyWord:function(){var a=this,b=this.config.keywords;
b&&(this.output=this.output.replace(new RegExp("(^|\\W)("+b.join("|")+")(\\W|$)","g"),function(b,d,f,c){return d+a.process(f,"keyword")+c}));return this},escLibrary:function(){var a=this,b=this.config.library;b&&(this.output=this.output.replace(new RegExp("(^|\\W)("+b.join("|")+")(\\W|$)","g"),function(b,d,f,c){return d+a.process(f,"library")+c}));return this},escape:function(){this.output=this.output.replace(h,function(a){return"&#"+a.charCodeAt(0)+";"});return this},escBlank:function(){this.output=
this.output.replace(l,function(a){return"@line@"});this.output=this.output.replace(f,function(a){return c[a.charCodeAt(0)]||""});return this},check:function(){var a=this;this.output=this.output.replace(/&#38#/g,"&#");this.output=this.output.replace(d,function(b,d){return a.pool[d].data.join("")});return this},restHtml:function(){var a=this,b=0;this.output=this.output.replace(d,function(b,d){return a.color(a.pool[d])});this.config.option.inner||(this.output=this.output.replace(RegExp("@line@","g"),
function(){b++;return a.color({data:[b],module:"line",attr:'unselectable="on"'})+"<br />"}),b++,this.output+=a.color({data:[b],module:"line"}));return this},color:function(a){if(a){for(var b=[],d=1<a.data.length?"@line@":"",f=0,c=a.data.length;f<c;f++)b.push("<span "+(a.attr||"")+' class="hh-'+a.module+'">'+a.data[f]+"</span>");return b.join(d)}},lightHtml:function(){var a=this,b=0,d={};this.output=this.output.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/g,function(a,f,c,e){if(!/\w/.test(c))return a;
b++;d[b]=qnml.parse(c,"qnml:code-js",{inner:!0});return f+"{tpl"+b+"}"+e});this.output=this.output.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g,function(a,f,c,e){if(/style/i.test(c)||!/\w/.test(c))return a;b++;d[b]=qnml.parse(c,"qnml:code-css",{inner:!0});return f+"{tpl"+b+"}"+e});this.output=this.output.replace(/<!\-\-[\s\S]*?\-\->/g,function(b){return a.process(b,"comment")});this.output=this.output.replace(/<!DOCTYPE[^>]+>/i,function(b){return a.process(b,"pound")});this.output=this.output.replace(/(<\w+)(.*?)(>)/g,
function(b,d,f,c){b=a.process(d,"tag");f=f.replace(/([\w\-]+=)(\".*?\"|\'.*?\')/g,function(b,d,f){return a.process(d,"attr")+a.process(f,"string")});c=a.process(c,"tag");return b+f+c});this.output=this.output.replace(/(\/>|<\/\w+>)/g,function(b){return a.process(b,"tag")});this.escape();this.escBlank();this.output=this.output.replace(/{tpl(\d+)}/g,function(a,b){return d[b]});this.restHtml().check();return'<div class="hh-code">'+this.output+"</div>"},lightCss:function(){var a=this;this.escString().escComment();
this.output=this.output.replace(/([\w\-])\:([^;\r\n}]+)/g,function(b,d,f){return a.process(d,"keyword")+":"+a.process(f,"library")});this.escBlank().restHtml().check();return this.config.option.inner?this.output:'<div class="hh-code">'+this.output+"</div>"},lightCode:function(){this.escRegExp().escString().escComment().escPound().escNumber().escKeyWord().escLibrary().escape().escBlank().restHtml().check();return this.config.option.inner?this.output:'<div class="hh-code">'+this.output+"</div>"},toString:function(){return this.lightCode()}};
b.highlight=n})(qnml.lib);qnml.lib=qnml.lib||{};
(function(b){var c=/```\s*(\w+)([\s\S]+?)\n```/g,a=/\n{2,}([\s\S]+)\n{2,}/g,e=/[<>'"&;]/g,g=/(#{1,6})([^\n]+)/g,k=/(\*+)([^\*\n]+?)(\*+)/g,m=/{tpl\d+}/g,h={},l=0;b.markdown={toHTML:function(b){var d=this;b=b.replace(/\r\n/g,"\n").replace(/\r/g,"\n");b=b.replace(/(^\n+)|(\s+$)/g,"");b=b.replace(c,function(a,b,c){return d.push(d.surround(qnml.parse(c,"qnml:code-"+b)+"",{className:"code"}))});b=b.replace(g,function(a,b,c){return d.push(d.surround(d.pre(c.replace(/#+$/,"")),{className:"title",tag:"h"+
b.length}))});b=b.replace(k,function(a,b,c,f){return d.push(d.surround(d.pre(c),{inLine:!0,className:"em",style:"font-weight:"+(500+100*f.length)}))});b=b.replace(a,function(a,b){return d.push(d.surround(d.pre(b),{className:"paragraph"}))});b=this.pre(b);return b=this.pull(b)},pre:function(a){a=a.replace(e,function(a){return"&#"+a.charCodeAt(0)+";"});a=a.replace(/\r\n/g,"\n").replace(/\r/g,"\n");return a=a.replace(/\s/g,function(a){return{10:"<br>",9:"&nbsp;&nbsp;&nbsp;&nbsp;",32:"&nbsp;"}[a.charCodeAt(0)]||
""})},surround:function(a,b){b=b||{};var c=b.tag?b.tag:b.inLine?"span":"div";return("<"+c+' class="md-'+b.className+'" style="'+b.style+'">$</'+c+">").replace("$",a)},push:function(a){var b="{tpl"+ ++l+"}";h[b]=a;return b},pull:function(a){var b=this;a=a.replace(m,function(a){a=h[a];return m.test(a)?b.pull(a):a});h={};return a}}})(qnml.lib);qnml.lib=qnml.lib||{};
(function(b){var c=Object.prototype.toString;b.isArray=function(){return"[object Array]"==c.call(this)};b.tmpl=function(){var a={};return function g(b,c,h){h=h||{};var l=h.key;h=h.mixinTmpl;var f=!/\W/.test(b),l=l||(f?b:null),d;if(l){var n=l;if(!(l=a[l])){b=f?document.getElementById(b).innerHTML:b;if(h)for(d in h)b=b.replace(new RegExp("<%#"+d+"%>","g"),h[d]);l=g(b)}d=a[n]=l}else d=new Function("obj","var _p_=[],print=function(){_p_.push.apply(_p_,arguments);};with(obj){_p_.push('"+b.replace(/[\r\t\n]/g,
" ").split("\\'").join("\\\\'").split("'").join("\\'").split("<%").join("\t").replace(/\t=(.*?)%>/g,"',$1,'").split("\t").join("');").split("%>").join("_p_.push('")+"');}return _p_.join('');");return c?d(c):d}}()})(qnml.lib);
(function(){qnml.addLanguage({nodeName:["qnml:code-cpp","qnml:code-h","qnml:code-c","qnml:code-cc"],parse:function(b,c,a,e){return new qnml.lib.highlight.Format(a,{keywords:"typedef auto double inline short typeid bool int signed typename long sizeof case enum static unsigned namespace using char virtual struct class void const private template float protected public goto if else while do switch case new continue try catch return break delete true fale".split(" "),library:[]})}})})();
(function(){qnml.addLanguage({nodeName:["qnml:code-css"],parse:function(b,c,a,e){return(new qnml.lib.highlight.Format(a,{option:e})).lightCss()}})})();(function(){qnml.addLanguage({nodeName:["qnml:code-html","qnml:code-htm"],parse:function(b,c,a,e){return(new qnml.lib.highlight.Format(a)).lightHtml()},style:'.hh-code{        font-family: Consolas, "Liberation Mono", Courier, monospace;        font-size: 12px;        line-height: 18px;        color: #333333;        margin-left:40px;        border-left: 1px solid #D4D4D4;        position:relative;        padding:10px;        word-wrap:break-word;        text-decoration:none;    }    u .hh-code{        text-decoration:none;    }    .hh-comment{        color: #999999;        font-style: italic;    }    .hh-pound{        color: #999988;    }    .hh-tag{        color:#000080;    }    .hh-attr{        color:#008080;    }    .hh-string{        color: #d14;    }    .hh-regexp{        color: #009926;    }    .hh-keyword{        font-weight: bold;    }    .hh-library{        color: #0086B3;    }    .hh-number{        color: #009999;    }    .hh-line{        position:absolute;        left:-40px;        display: inline-block;        width: 30px;        color: #aaa;        text-align: right;        padding-right: 8px;        -webkit-user-select:none;    }'})})();
(function(){qnml.addLanguage({nodeName:["qnml:code-js","qnml:code-as"],parse:function(b,c,a,e){e=e||{};return new qnml.lib.highlight.Format(a,{keywords:"var function if else while do switch case new continue in typeof instanceof try catch return break this delete undefined null true fale".split(" "),library:"Array Boolean Date Function Number Object RegExp String Error decodeURI decodeURIComponent encodeURI encodeURIComponent eval isFinite isNaN parseFloat parseInt Infinity JSON Math NaN undefined null arguments document window getElementById getElementsByTagName addEventListener removeEventListener setTimeout clearTimeout setInterval clearInterval".split(" "),
option:e})}})})();
(function(){qnml.addLanguage({nodeName:["qnml:code-php"],parse:function(b,c,a,e){return new qnml.lib.highlight.Format(a,{keywords:"__halt_compiler abstract and array as break callable case catch class clone const continue declare default die do echo else elseif empty enddeclare endfor endforeach endif endswitch endwhile eval exit extends final for foreach function global goto if implements include include_once instanceof insteadof interface isset list namespace new or print private protected public require require_once return static switch throw trait try unset use var while xor".split(" "),library:"__CLASS__ __DIR__ __FILE__ __FUNCTION__ __LINE__ __METHOD__ __NAMESPACE__ __TRAIT__".split(" ")})}})})();
(function(){qnml.addLanguage({nodeName:"qnml:code",parse:function(b,c,a,e){var g=/language=[\"\']?(\w*)[\"\']?/i.exec(c)[1],k=g;if(c=/text=[\"\']?(\w*)[\"\']?/i.exec(c))k=c[1];if(e&&"edit"==e.status)return qnml.lib.tmpl('<div id="<%=isNew?"ve-codewrapper":""%>" class="g_md_codeBox" name="ve-codewrapper" data-qnml="<%=tag%>" contenteditable="false">\x3c!--no gettitle start--\x3e\x3c!--no url start--\x3e<div name="ve-codeblock" data-language="<%=language%>" data-text="<%=languageText%>" class="code_content"><textarea name="ve-codetextarea" class="ve-codetextarea" _event="textarea"><%=source%></textarea></div>\x3c!--no gettitle end--\x3e\x3c!--no url end--\x3e\x3c!--<div class="code_bottom" contenteditable="false" name="ve-codebottom"><div class="codeType_box codeType_edit" name="ve-bottom"><a class="codeType" href="#inner" _event="changeLanguage" title="<%=languageText%>"><span name="ve-bottomlanguage"><%=languageText%></span><span class="g_ico g_ico_drop3"></span></a><a href="#inner" class="codeType_clear" title="\u6e05\u9664\u683c\u5f0f" _event="clearformat">\u6e05\u9664\u683c\u5f0f</a><div class="codeType_menu g_md_menu g_md_menu_show" name="ve-languageoption" style="display:none"><ul><li><a href="#inner" title="html" value="html|html" _event="codeoption">html</a><span class="g_ico g_ico_tick"></span></li><li><a href="#inner" title="javascript" value="js|javascript" _event="codeoption">javascript</a><span class="g_ico g_ico_tick"></span></li><li><a href="#inner" title="css" value="css|css" _event="codeoption">css</a><span class="g_ico g_ico_tick"></span></li><li><a href="#inner" title="c/c++" value="c|c/c++" _event="codeoption">c/c++</a><span class="g_ico g_ico_tick"></span></li><li class="last"><a href="#inner" title="php" value="php|php" _event="codeoption">php</a><span class="g_ico g_ico_tick"></span></li></ul><span class="arrow"><span class="arrow"></span></span></div></div></div>--\x3e</div>',
{language:g,languageText:k,tag:encodeURIComponent(b),source:a,isNew:e.isNew});b=document.createElement("textarea");b.innerHTML=a.replace(/\n/g,"%@%");a=b.value.replace(/%@%/g,"\n");""==a&&(a=" ");"\n"==a[a.length-1]&&(a+=" ");return qnml.lib.tmpl('    <div class="g_md_codeBox">\x3c!--no url start--\x3e\x3c!--no gettitle start--\x3e<div class="code_content">        <pre class="ve-codepre" name="ve-codepre"><%=hilightcode%></pre>    </div>    <div class="code_bottom">        <span name="ve-codelanguage" class="codeType_box"><%=languageText%></span>    </div>\x3c!--no gettitle end--\x3e\x3c!--no url end--\x3e</div>',
{language:g,languageText:k,hilightcode:qnml.parseAll("<qnml:code-"+g+">"+a+"</qnml:code-"+g+">")})},style:"    /*\u7ec8\u7aef\u7684\u6837\u5f0f*/    .g_md_codeBox{background-color:#fbfbfb;border:1px solid #cbcbcb;word-wrap:break-word;word-break:break-all;white-space:normal;position:relative}    .g_md_codeBox .code_content{padding:5px}    .g_md_codeBox .codeType_box{font-size:12px;color:#999}    .g_md_codeBox .code_keyword{color:#39f}    .g_md_codeBox .codeType_edit{}    .g_md_codeBox .code_bottom{position:relative;height:27px}    .g_md_codeBox .code_bottom .codeType_box{padding:0 6px;height:23px;line-height:23px;position:absolute;left:2px;top:0;border:1px dashed transparent}    .g_md_codeBox .code_bottom .codeType_edit{background-color:#fff;border:1px solid #cbcbcb}    .g_md_codeBox .code_bottom .codeType_box a{text-decoration:none}    .g_md_codeBox .code_bottom .codeType_box .codeType{color:#666}    .g_md_codeBox .code_bottom .codeType_box .codeType_clear{border-bottom:1px solid #099;color:#099;padding-bottom:1px}    .g_md_codeBox .code_bottom .g_ico_drop3{margin:0 6px 0 2px}    .g_md_codeBox .codeType_menu{top:23px;left:-1px}    .g_md_codeBox .codeType_menu_above{bottom:23px;left:-1px;border-bottom-width:1px}    .g_md_codeBox .code_bottom .g_md_menu{width:126px}    .g_md_codeBox .code_bottom .g_md_menu a{text-decoration:none}    .g_md_codeBox .code_bottom .g_md_menu .arrow{display:none}    @media screen and (max-width:650px) {        .editTool_code{display:none!important}     }"})})();
(function(){qnml.addLanguage({nodeName:"qnml:file",parse:function(b,c,a,e){a=document.createElement("div");a.innerHTML="<span "+c+"></span>";c=a.getElementsByTagName("span")[0];b=encodeURIComponent(b);a=c.getAttribute("src");e=c.getAttribute("name");var g=c.getAttribute("filesize"),k=c.getAttribute("filetype");c=c.getAttribute("percent");isNaN(g)||(g=g?g/1024:0,g=1024<g?(g/1024).toFixed(2)+"M":g.toFixed(2)+"KB");return qnml.lib.tmpl('<div class="qnml-box">    <div>&nbsp;</div>\x3c!--no url start--\x3e    <div data-qnml="<%=data.tag%>" class="content_delete_ie">        <div title="<%=data.name%>" class="g_md_clipBox file_box" contenteditable="false" unselectable="on" _event="viewFile" data-name="<%=data.name%>" data-type="<%=data.filetype%>" <% if(data.src){ %> data-src="<%=data.src%>"<% } %> >            <%     var fileIco = "";    if (data.filetype == 0) {    fileIco = "clip_normal";    } else if (data.filetype == 1) {    fileIco = "clip_normal";    } else {    fileIco = "clip_normal";    }    %>            <span class="ico_clip <%=fileIco%>"></span>            <p class="clipName"><%=data.name%></p>            <% if(data.percent){ %>            <p class="progressBar"><span class="progress" style="width:<%=data.percent%>"></span></p>            <% } %>            <% if(data.filesize){ %>            <p class="size"><%=data.filesize%></p>            <% } %>            <span class="g_ico g_ico_popClose" _event="delFile" title="\u5220\u9664\u9644\u4ef6"></span>        </div>    </div>\x3c!--no url end--\x3e    <div>&nbsp;</div></div>',
{data:{tag:b,src:a,filesize:g,name:e,filetype:k,percent:c}})},style:".g_md_clipBox{-moz-user-select:none; -webkit-user-select:none; font-weight:normal!important; text-decoration:none!important; color:#666; margin-bottom: 10px;}.g_md_clipBox strong{font-weight:normal}.g_md_clipBox u{text-decoration:none}.g_md_clipBox em{font-style:normal}.file_box{cursor:pointer}.file_box:hover{background-color:#f5f5f5!important}.qnml-box .g_ico_popClose{display:none}.ve-editor .qnml-box .g_ico_popClose{display:inherit}"})})();
(function(){qnml.addLanguage({nodeName:"qnml:md",parse:function(b,c,a,e){return qnml.lib.markdown.toHTML(a)},style:".md-paragraph{margin:10px 0px;padding:5px;border:1px dashed #ccc;}.md-code{border:1px solid #ccc;}"})})();
(function(){qnml.addLanguage({nodeName:"qnml:item",parse:function(b,c,a,e){b=document.createElement("div");b.innerHTML="<span "+c+">";c=b.getElementsByTagName("span")[0].getAttribute("checked");return qnml.lib.tmpl("    <div>\x3c!--no url start--\x3e    <span class=\"todo-checkbox note_component content_delete_ie\"><span class=\"<%=checked%>\" onclick=\"if(this.className=='ico_checkbox') this.className='ico_checkbox_sel';else if(this.className=='ico_checkbox_sel') this.className='ico_checkbox';\"></span></span><span class=\"todo-content\"><%=content%></span>\x3c!--no url end--\x3e    </div>",{checked:"true"==
c?"ico_checkbox_sel":"ico_checkbox",content:a})},style:"    .todo-checkbox{    display:inline-block;    vertical-align: middle;    }    .todo-content{    margin-left:10px    }    .note_component span{display: inline-block;width:32px;height:32px;}.note_component .ico_checkbox{background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGRjgwNkVEREYyQkYxMUUyQTUxMUQwNjIxNjA0ODlCRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGRjgwNkVERUYyQkYxMUUyQTUxMUQwNjIxNjA0ODlCRiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkZGODA2RURCRjJCRjExRTJBNTExRDA2MjE2MDQ4OUJGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkZGODA2RURDRjJCRjExRTJBNTExRDA2MjE2MDQ4OUJGIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+c6GDqwAAAIBJREFUeNpi/P//P8NAAiaGAQajDmBB5ty4ccMTSM0FYkkq2/MciJM1NDS2EwoBWljOADVzLsEQgFkOdClVbQeGLAMuj40mwlEHjDpg1AGjDhh1wKgDRh0w6oDB1SqGtl4loW04aoMXxIRACi6FFIKnoGY5NgnG0b7hiHcAQIABAFA6F+FU2FivAAAAAElFTkSuQmCC) no-repeat;}.note_component .ico_checkbox_sel{background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGRjgwNkVEOUYyQkYxMUUyQTUxMUQwNjIxNjA0ODlCRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGRjgwNkVEQUYyQkYxMUUyQTUxMUQwNjIxNjA0ODlCRiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkZGODA2RUQ3RjJCRjExRTJBNTExRDA2MjE2MDQ4OUJGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkZGODA2RUQ4RjJCRjExRTJBNTExRDA2MjE2MDQ4OUJGIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+hyKRkwAAAfpJREFUeNpi/P//P8NAAsZRByA74MaNG55Aai4QS1LZnudAnKyhobEdXYIFjU8LyxmgZoLMlrLzimQD0suAOACIJ7BgUcgAdClVbQeGLNhsqOVrgNgXKpXPRK+4/vP3LwOa5SCwm4lels9csIoBzfJTQBzJQmvL//37xzBn8VqGi1dvMaBZ7nZo2/KPTLS2vKVnGsO5S9exWg7iMNHa8j0HjuK0nKADrt64zdAzZQ7DiTMXKLZcVlqCAd1ybAXRf+Rs6BeZzvDh4ycGJkZGhuqSLAZXRxuyLJeWFGMoyoxnMDUxYiRUEKEAJiZIAP0DOrIVaCgI4HMEyDM9k+egWK4oL8uQkxzBwMvDhd0OfA5oqMhjYGdjQ3HE7v1HcFreN3Uew5ad+1Esn9hRg9Nygg4w0NVk6GwsQ3FEe/8MhqMnzmK1fOO2PRiWC/Dz4Y0ygrnASF8bxRF//vxlqG3rhzsCm+XSkuIME9oJW050NoQ5go2NFcURR06cwWr5pM46BkEBPqJyDN5cgA5AvgZZDHIANgCzXFRECFtlBDKXkawQgAFrC2OG5qpCBhYWZqItp0oUEHIEuZaTXRSDHNFUVcDAw80FtrynpZIsy0lOAxQ2SChPA7QAA+4AFiytV0lYkFEZvCAmBFJwKaQQPAU1y0d7RqMOGJQOAAgwAMJoAaCZeKFxAAAAAElFTkSuQmCC) no-repeat;}.note_component .ico_dot{background: url(component/comp_dot.png) no-repeat 50% 50%;}"})})();
(function(){qnml.addLanguage({nodeName:"qnml:unknown",parse:function(b,c,a,e){return qnml.lib.markdown.pre(a)}})})();
(function(){qnml.addLanguage({nodeName:"qnml:voice",parse:function(b,c,a,e){a=document.createElement("div");a.innerHTML="<span "+c+"></span>";e=a.getElementsByTagName("span")[0];b=encodeURIComponent(b);c=e.getAttribute("src");a=e.getAttribute("filesize");e=e.getAttribute("seconds");var g=Math.floor(e/60),k=e%60,g=(9<g?g:"0"+g).toString()+":"+(9<k?k:"0"+k).toString();a=(parseFloat(a)/1E3).toFixed(2)+"KB";return qnml.lib.tmpl('<div class="qnml-box"><div>&nbsp;</div>\x3c!--no url start--\x3e<div data-qnml="<%=data.tag%>" class="content_delete_ie"><div class="g_md_clipBox voice_box stationary_voice_box" contenteditable="false" unselectable="on" data-src="<%=data.src%>" data-seconds="<%=data.seconds%>"><span class="ico_clip clip_play voice_control" _event="playVoice">\u64ad\u653e</span><span class="ico_clip clip_pause voice_control" _event="pauseVoice" style="display:none">\u6682\u505c</span><span class="ico_clip clip_stop voice_control" _event="stopVoice" style="display:none">\u505c\u6b62</span><div class="progressBar_play"><p style="width:0%;" class="progress_play"><span class="progress_dot" _event = "voiceProgress"></span></p></div><span class="clipName">\u5f55\u97f3</span><span class="clipSeconds"><%=data.formartSeconds%></span><span class="clipSize"><%=data.filesize%></span><span class="time_current" style="display:none">00:00</span><span class="time_total" style="display:none"><%=data.formartSeconds%></span><span title="\u5220\u9664\u5f55\u97f3" _event="delVoice" class="g_ico g_ico_popClose"></span><span class="download_voice" _event="downloadVoice" title="\u4e0b\u8f7d"></span>    </div></div>\x3c!--no url end--\x3e    <div>&nbsp;</div></div>',
{data:{tag:b,src:c,filesize:a,seconds:e,formartSeconds:g}})},style:'.voice_control{cursor:pointer}.stationary_voice_box .clipName,.stationary_voice_box .clipSeconds,.stationary_voice_box .clipSize{position:relative; top:9px; margin-right:10px}.voice_box .g_ico_popClose{cursor:pointer}.g_md_clipBox_play .g_ico_popClose{right:0px; top:0px}.download_voice{width:12px; height:13px; display:inline-block; cursor:pointer; background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAANAQMAAACn5x0BAAAAA3NCSVQICAjb4U/gAAAABlBMVEWGjZT///8WZGrIAAAAAnRSTlP/AOW3MEoAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDgvMTcvMTMNl9j1AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M1cbXjNgAAABxJREFUCJlj+PCBAQ0dMGB4UABiWB5gsD/AAAYApKERWcskvewAAAAASUVORK5CYII="); position: relative; left: 10px; top: 10px;}.g_md_clipBox_play .download_voice{display:none}'})})();

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