class Game {
	constructor(params){
		var that=this;
		this.joystickDom=params.joystick;
		this.controlDom=params.control;
		this.scoreDom=params.score;
		this.timeDom=params.time;
		this.dom=params.container;
		this.state='play';
		this.height=500;
		this.width=800;
		this.blockSize=20;
		this.snakeLength=3;
		this.snakeSpeed=500;
		let startBtn=document.createElement('button');
		startBtn.innerText="START";
		startBtn.onclick=function(){
			that.start();
		}
		this.controlDom.innerHTML='';
		this.controlDom.appendChild(startBtn);
		let firstRow=document.createElement('div');
		let upButton=document.createElement('button');
		upButton.innerText='UP';
		upButton.onclick=function(){
			that.handleEvent('ArrowUp');
		}
		firstRow.appendChild(upButton);
		let secondRow=document.createElement('div');
		let leftButton=document.createElement('button');
		leftButton.innerText='LEFT';
		leftButton.onclick=function(){
			that.handleEvent('ArrowLeft');
		}
		secondRow.appendChild(leftButton);
		let spacer=document.createElement('span');
		spacer.className='spacer';
		secondRow.appendChild(spacer);
		let rightButton=document.createElement('button');
		rightButton.innerText='RIGHT';
		rightButton.onclick=function(){
			that.handleEvent('ArrowRight');
		}
		secondRow.appendChild(rightButton);
		let thirdRow=document.createElement('div');
		let downButton=document.createElement('button');
		downButton.innerText='LEFT';
		downButton.onclick=function(){
			that.handleEvent('ArrowDown');
		}
		thirdRow.appendChild(downButton);
		this.joystickDom.appendChild(firstRow);
		this.joystickDom.appendChild(secondRow);
		this.joystickDom.appendChild(thirdRow);
	}
	start(){
		var that=this;
		this.snakePos=[];
		this.turnPos=[];
		this.foodPos=[];
		this.time=[];
		this.dom.innerHTML='';
		this.canvas=document.createElement('canvas');
		this.canvas.height=this.height;
		this.canvas.width=this.width;
		this.ctx=this.canvas.getContext('2d');
		this.ctx.textAlign="center";
		this.snakeInit();
		this.init();
		this.draw();
		this.dom.appendChild(this.canvas);
		let startBtn=document.createElement('button');
		startBtn.innerText="PAUSE";
		startBtn.onclick=function(){
			that.pauseResume();
		}
		this.controlDom.innerHTML='';
		this.controlDom.appendChild(startBtn);
	}
	dead(){
		var that=this;
		this.clearAllInterval();
		var ctx=this.ctx;
		ctx.fillStyle="#0008";
		ctx.fillRect(0,0,this.width,this.height);
		ctx.fillStyle="#fff";
		ctx.font="12pt Arial";
		ctx.fillText("Game Over!",this.width/2,this.height/2-20);
		ctx.font="20pt Arial";
		ctx.fillText(this.snakePos.length-this.snakeLength,this.width/2,this.height/2+15);
		let startBtn=document.createElement('button');
		startBtn.innerText="RE-START";
		startBtn.onclick=function(){
			that.start();
		}
		this.controlDom.innerHTML='';
		this.controlDom.appendChild(startBtn);
	}
	updateScore(){
		this.scoreDom.innerText=String((this.snakePos.length-this.snakeLength)*10).padStart(4,"0");
	}
	snakeInit(){
		var that=this;
		for(var i=this.snakeLength-1;i>=0;i--){
			that.snakePos.push({
				x:i*that.blockSize,
				y:0,
				to:'right'
			});
		}
		this.newFood();
	}
	init(){
		var that=this;
		this.snakeInterval=setInterval(function(){
			that.isEatFood();
			for (var i = 0;i<that.snakePos.length;i++) {
				let current=that.snakePos[i];
				that.turnPos.forEach((item,index)=>{
					if(item.x===current.x&&current.y===item.y){
						current.to=item.to;
						if(i===that.snakePos.length-1){
							delete that.turnPos[index];
						}
					}
				});
				switch(current.to){
					case 'right':
						that.snakePos[i]={
							x:current.x+that.blockSize,
							y:current.y,
							to:current.to
						}
						break;

					case 'left':
						that.snakePos[i]={
							x:current.x-that.blockSize,
							y:current.y,
							to:current.to
						}
						break;

					case 'up':
						that.snakePos[i]={
							x:current.x,
							y:current.y-that.blockSize,
							to:current.to
						}
						break;

					case 'down':
						that.snakePos[i]={
							x:current.x,
							y:current.y+that.blockSize,
							to:current.to
						}
						break;
				}
			}
		},this.snakeSpeed);
		this.drawInterval=setInterval(function(){
			that.draw();
		},100);
		this.timeInterval=setInterval(function(){
			that.time++;
			that.timeDom.innerText=that.time+' s';
		},1000);
		this.initEvent();
	}
	clearAllInterval(){
		clearInterval(this.snakeInterval);
		clearInterval(this.drawInterval);
		clearInterval(this.timeInterval);
	}
	pauseResume(){
		var that=this;
		let startBtn=document.createElement('button');
		if(this.state==='play'){
			this.state='paused';
			this.clearAllInterval();
			startBtn.innerText="RESUME";
			var ctx=this.ctx;
			ctx.fillStyle="#0008";
			ctx.fillRect(0,0,this.width,this.height);
			ctx.fillStyle="#fff";
			ctx.font="12pt Arial";
			ctx.fillText("PAUSED!",this.width/2,this.height/2);
		}else if(this.state==='paused'){
			this.state='play';
			this.init();
			startBtn.innerText="PAUSE";
		}
		startBtn.onclick=function(){
				that.pauseResume();
		}
		this.controlDom.innerHTML='';
		this.controlDom.appendChild(startBtn);
	}
	isEatFood(){
		let current=this.snakePos[0];
		if(current.x>this.width-this.blockSize||current.x<0||current.y>this.height-this.blockSize||current.y<0){
			return this.dead();
		}
		let food=this.foodPos;
		if(current.x===food.x&&current.y===food.y){
			let lastSnake=this.snakePos[this.snakePos.length-1];
			let x=0;
			let y=0;
			switch(lastSnake.to){
				case 'right':
					x=lastSnake.x-this.blockSize;
					y=lastSnake.y;
					break;

				case 'left':
					x=lastSnake.x+this.blockSize;
					y=lastSnake.y;
					break;

				case 'up':
					x=lastSnake.x;
					y=lastSnake.y+this.blockSize;
					break;

				case 'down':
					x=lastSnake.x;
					y=lastSnake.y-this.blockSize;
					break;
			}
			this.snakePos.push({
				x:x,
				y:y,
				to:lastSnake.to
			});
			this.newFood();
			this.updateScore();
		}
	}
	random(min,max){
		return Math.floor(Math.random()*max)+min;
	}
	newFood(){
		this.foodPos={
			x:this.random(0,this.width/this.blockSize)*this.blockSize,
			y:this.random(0,this.height/this.blockSize)*this.blockSize
		}
	}
	initEvent(){
		var that=this;
		window.addEventListener('keydown',function(event){
			that.handleEvent(event.key);
		})
	}
	handleEvent(key){
		var that=this;
		switch(key){
			case 'ArrowUp':
				if(that.snakePos[0].to!=='down'&&that.snakePos[0].to!=='up'){
					that.turnPos.push({
						x:that.snakePos[0].x,
						y:that.snakePos[0].y,
						to:'up'
					});
				}
				break;

			case 'ArrowDown':
				if(that.snakePos[0].to!=='down'&&that.snakePos[0].to!=='up'){
					that.turnPos.push({
						x:that.snakePos[0].x,
						y:that.snakePos[0].y,
						to:'down'
					});
				}
				break;

			case 'ArrowLeft':
				if(that.snakePos[0].to!=='left'&&that.snakePos[0].to!=='right'){
					that.turnPos.push({
						x:that.snakePos[0].x,
						y:that.snakePos[0].y,
						to:'left'
					});
				}
				break;

			case 'ArrowRight':
				if(that.snakePos[0].to!=='left'&&that.snakePos[0].to!=='right'){
					that.turnPos.push({
						x:that.snakePos[0].x,
						y:that.snakePos[0].y,
						to:'right'
					});
				}
				break;
		}
	}
	draw(){
		let ctx=this.ctx;
		ctx.clearRect(0,0,this.width,this.height);
		for(var i=0;i<this.height/this.blockSize;i++){
			for(var j=0;j<this.width/this.blockSize;j++){
				let x=j*this.blockSize;
				let y=i*this.blockSize;
				if(i%2===0){
					ctx.fillStyle=j%2===0?"#4e7ea3":"#67b4f0";
				}else{
					ctx.fillStyle=j%2===0?"#67b4f0":"#4e7ea3";
				}
				ctx.fillRect(x,y,this.blockSize,this.blockSize);
			}
		}
		ctx.fillStyle="#f00";
		ctx.fillRect(this.foodPos.x,this.foodPos.y,this.blockSize,this.blockSize);
		ctx.fillStyle="#ff0";
		for (var i = this.snakePos.length - 1; i >= 0; i--) {
			let current=this.snakePos[i];
			ctx.fillRect(current.x,current.y,this.blockSize,this.blockSize);
		}
		ctx.fillStyle="#fff";
		ctx.font="15pt Bold Arial";
		ctx.textAlign="right";
		ctx.fillText("COPYRIGHT : @HSNFirdaus",this.width-10,this.height-10);
		ctx.textAlign="center";
	}

}