~

function(exports) {
    var keycodeToFunctionKey = {
        8: "backspace",
        9: "tab",
        13: "return",
        19: "pause",
        27: "escape",
        32: "space",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        44: "printscreen",
        45: "insert",
        46: "delete",
        112: "f1",
        113: "f2",
        114: "f3",
        115: "f4",
        116: "f5",
        117: "f6",
        118: "f7",
        119: "f8",
        120: "f9",
        121: "f10",
        122: "f11",
        123: "f12",
        144: "numlock",
        145: "scrolllock"
    }
    var keycodeToPrintableChar = {
        48: "0",
        49: "1",
        50: "2",
        51: "3",
        52: "4",
        53: "5",
        54: "6",
        55: "7",
        56: "8",
        57: "9",
        59: ";",
        61: "=",
        65: "a",
        66: "b",
        67: "c",
        68: "d",
        69: "e",
        70: "f",
        71: "g",
        72: "h",
        73: "i",
        74: "j",
        75: "k",
        76: "l",
        77: "m",
        78: "n",
        79: "o",
        80: "p",
        81: "q",
        82: "r",
        83: "s",
        84: "t",
        85: "u",
        86: "v",
        87: "w",
        88: "x",
        89: "y",
        90: "z",
        107: "+",
        109: "-",
        110: ".",
        188: ",",
        190: ".",
        191: "/",
        192: "`",
        219: "[",
        220: "\\",
        221: "]",
        222: "\""
    }

    var keymap = {
        _config: null,
        _mapping: null,
        _elems: null,
        install: function(elem) {
            if (!elem) {
                throw new Error("a html element is needed");
            } else {
                if (!this._elems) this._elems = [];

                var self = this;
                var elemPair = {
                    e: elem,
                    h: function(event) {
                        var modifier = "";
                        var keyname = null;

                        if (event.type == "keydown") {
                            var code = event.keyCode;
                            //忽略ctrl,alt,shift
                            if (code <= 18 && code >= 16) return;
                            keyname = keycodeToFunctionKey[code];

                            //如果这个按键并非一个功能键，并且ctrl或者alt按下，我们认为这是个组合键
                            if (!keyname && (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey)) {
                                keyname = keycodeToPrintableChar[code];
                            }

                            if (keyname) {
                                //这是个功能键
                                if (event.altKey) modifier += "alt_";
                                if (event.ctrlKey) modifier += "ctrl_";
                                if (event.shiftKey) modifier += "shift_";
                                if (event.metaKey) modifier += "command_";
                            } else return;
                        }

                        var funcArray = self._mapping[modifier + keyname];

                        if (funcArray) {
                            var target = event.target || event.srcElement;
                            for (var i = 0; i < funcArray.length; i++) {
                                var func = funcArray[i];
                                func && func(target, modifier + keyname, event);
                            }
                        }

                        if(self._config.preventDefault){
                            //禁止默认操作和冒泡
                            if (event.stopPropagation)
                                event.stopPropagation();
                            else event.cancelBubble = true;

                            if (event.preventDefault)
                                event.preventDefault();
                            else
                                event.returnValue = false;
                            return false;
                        }
                        else return true;
                    }
                }
                //绑定事件，可以重复绑定，仅提示，不阻止
                //如果按键是非打印字符，keypress事件在IE下收不到
                elemPair.e.addEventListener("keydown", elemPair.h);

                if (this.isInstalled(elem))
                    console.error("this elem is already installed, and this will cause bind repeatedly");
                else {
                    this._elems.push(elemPair);
                }
            }
            return this;
        },
        uninstall: function(elem) {
            var index = -1;
            var findElemPair = this._elems.filter(function(item, idx) {
                if (item.e == elem) {
                    index = idx;
                    return true;
                }
            });
            if (findElemPair.length > 0 && index > -1) {
                this._elems.splice(index, 1);
                findElemPair[0].e.removeEventListener("keydown", findElemPair[0].h);
            }
            return this;
        },
        isInstalled: function(elem) {
            var findElemPair = this._elems.filter(function(item) {
                if (item.e == elem)
                    return true;
            });
            return !!findElemPair.length;
        },
        /**
         * 解绑事件
         * key,是快捷键，func为需要绑定的方法，或者数组
         */
        bind: function(key, func) {
            if (!this._mapping) this._mapping = {};
            if(/object/i.test(typeof key)){
                if(key.length){
                    //数组
                    for(var i=0;i<key.length;i++){
                        this.bind(key[i],func);
                    }
                }
                else{
                    //对象
                    for(var p in key){
                        if(!this._mapping[p]) this._mapping[p] = [];
                        if(key[p].length){
                            this._mapping[p] = this._mapping[p].concat(key[p]);
                        }
                        else{
                            this._mapping[p].push(key[p]);
                        }
                    }
                }
            }
            else if (/string/i.test(typeof key)) {
                if (!this._mapping[key]) this._mapping[key] = [];
                if(func.length){
                    this._mapping[key] = this._mapping[key].concat(func);
                }
                else{
                    this._mapping[key].push(func);
                }
            } else {
                throw new Error("key must be a string");
            }
            return this;
        },
        /*
         * 解绑事件
         * func为需要解绑的方法，如果不填则默认为解绑所有方法
         */
        unbind: function(key, func) {
            if (!this._mapping) return this;
            else {
                if (/string/i.test(typeof key)) {
                    if (!this._mapping[key]) return this;
                    if (func) {
                        var index = this._mapping[key].indexOf(func);
                        this._mapping[key].splice(index, 1);
                    } else {
                        this._mapping[key] = null;
                    }
                } else {
                    throw new Error("key must be a string");
                }
            }
            return this;
        },
        dispatch: function(event) {

        }
    };

    exports.keymap = {
        create: function(options) {
            var obj = Object.create(keymap);
            obj._config = options || {};

            obj._config.preventDefault = obj._config.preventDefault || false;

            return obj;
        }
    }
}(window);