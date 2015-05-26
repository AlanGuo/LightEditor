(function(window,undefined){

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