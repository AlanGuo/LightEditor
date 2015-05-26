/*TMODJS:{"version":"1.0.0"}*/
!function(){function a(a,b){return(/string|function/.test(typeof b)?h:g)(a,b)}function b(a,c){return"string"!=typeof a&&(c=typeof a,"number"===c?a+="":a="function"===c?b(a.call(a)):""),a}function c(a){return l[a]}function d(a){return b(a).replace(/&(?![\w#]+;)|[<>"']/g,c)}function e(a,b){if(m(a))for(var c=0,d=a.length;d>c;c++)b.call(a,a[c],c,a);else for(c in a)b.call(a,a[c],c)}function f(a,b){var c=/(\/)[^/]+\1\.\.\1/,d=("./"+a).replace(/[^/]+$/,""),e=d+b;for(e=e.replace(/\/\.\//g,"/");e.match(c);)e=e.replace(c,"/");return e}function g(b,c){var d=a.get(b)||i({filename:b,name:"Render Error",message:"Template not found"});return c?d(c):d}function h(a,b){if("string"==typeof b){var c=b;b=function(){return new k(c)}}var d=j[a]=function(c){try{return new b(c,a)+""}catch(d){return i(d)()}};return d.prototype=b.prototype=n,d.toString=function(){return b+""},d}function i(a){var b="{Template Error}",c=a.stack||"";if(c)c=c.split("\n").slice(0,2).join("\n");else for(var d in a)c+="<"+d+">\n"+a[d]+"\n\n";return function(){return"object"==typeof console&&console.error(b+"\n\n"+c),b}}var j=a.cache={},k=this.String,l={"<":"&#60;",">":"&#62;",'"':"&#34;","'":"&#39;","&":"&#38;"},m=Array.isArray||function(a){return"[object Array]"==={}.toString.call(a)},n=a.utils={$helpers:{},$include:function(a,b,c){return a=f(c,a),g(a,b)},$string:b,$escape:d,$each:e},o=a.helpers=n.$helpers;if(a.get=function(a){return j[a.replace(/^\.\//,"")]},a.helper=function(a,b){o[a]=b},"function"==typeof define)define(function(){return a});else if("undefined"!=typeof exports)module.exports=a;else{var p="dialogTemplate".split("."),q=this;p.forEach(function(a){q[a]=q[a]||{},q=q[a]}),q.template=a}/*v:22*/
a("dialogTemplate",function(a){"use strict";var b=this,c=(b.$helpers,b.$escape),d=a.title,e=a.content,f=b.$each,g=a.buttons,h=(a.b,a.index,a.$index,"");return h+=' <div class="dialog-wrapper">  <div class="overlay"></div>  <div class="dialog"> <div class="topbar clearfix"> <span class="title">',h+=c(d),h+='</span> <span class="buttons"><a class="close" href="#" title="\u5173\u95ed"></a></span> </div> <div class="content"> ',h+=c(e),h+=' <div class="form-panel mt30"> <label class="formitem-label w20p align-right mr10p" style=""></label> ',f(g,function(a,b){h+=" ",a.primary?(h+=" <",h+=c(a.tag||"button"),h+=" data-index=",h+=c(b),h+=' class="primary" title="',h+=c(a.title||a.name),h+='">',h+=c(a.name),h+="</",h+=c(a.tag||"button"),h+="> "):(h+=" <",h+=c(a.tag||"a"),h+=' href="#" data-index=',h+=c(b),h+=' class="ml10 normal" title="',h+=c(a.title||a.name),h+='">',h+=c(a.name),h+="</",h+=c(a.tag||"a"),h+="> "),h+=" "}),h+=" </div> </div> </div> </div> ",new k(h)})}();
/**
 * 对话框组件
 * @author alan
 * 2014/09/18
 */

 'use strict';
 (function(exports){

    var _dialog = function(options){
        options = options || {};

        //参数预处理
        options.title = options.title || 'dialog';
        options.content = options.content || '';
        options.buttons = options.buttons || [{name:'确定',title:'确定',tag:'button',primary:true}];
        options.position = options.position || 'center center';
        options.zIndex = options.zIndex || 100;
        options.autoPosition = options.autoPosition || false;
        //模态
        options.modal = options.modal || true;

        var dialogDiv = document.createElement('div');
        dialogDiv.innerHTML = dialogTemplate.template('dialogTemplate')(options);

        var dialogElement = dialogDiv.children[0].querySelector('.dialog');
        document.body.appendChild(dialogDiv.children[0]);
        
        //position
        var position = options.position.split(' ');
        var width = dialogElement.clientWidth,
            height = dialogElement.clientHeight,
            windowWidth = document.documentElement.clientWidth,
            windowHeight = document.documentElement.clientHeight;

        dialogElement.style.zIndex = options.zIndex;

        if(position[0] === 'center'){
            dialogElement.style.top = (windowHeight-height)/2 + 'px';
        }
        if(position[1] === 'center'){
            dialogElement.style.left = (windowWidth-width)/2 + 'px';
        }

        //初始化事件
        dialogElement.querySelector('a.close').addEventListener('click',function(evt){
            _dialog.close();
            evt.preventDefault();
            return false;
        });


        var makeCallback = function(callback){
            return function(event){
                if(callback.call(_dialog,event)){
                    _dialog.close();
                }
                event.preventDefault();
                return false;
            };
        };
        //绑定按钮事件
        var close = function(event){
            _dialog.close();
            event.preventDefault();
            return false;
        };
        for(var i=0;i<options.buttons.length;i++){
            var buttonElem = dialogElement.querySelector('[data-index="'+i+'"]');
            
            if(buttonElem){
                if(options.buttons[i].callback){
                    buttonElem.addEventListener('click',makeCallback(options.buttons[i].callback));
                }
                else{
                    buttonElem.addEventListener('click',close);
                }
            }
        }

        return _dialog;
    };

    _dialog.close = function(){
        document.body.removeChild(document.body.querySelector('.dialog-wrapper'));
    };

    exports.dialog = _dialog;

 })(window);