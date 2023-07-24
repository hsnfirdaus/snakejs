import Layout from "./layout";

const BLOCK_SIZE = 20;

const SNAKE_LENGTH = 3;
const SNAKE_ROUNDED = 10;
const WIDTH = 800;
const HEIGHT = 500;

const DARK_BLOCK = "#0f766e";
const LIGHT_BLOCK = "#0d9488";
const SNAKE_COLOR = "#fdba74";
const FOOD_COLOR = "#f87171";

interface SnakePosItem {
	x: number;
	y: number;
	to: "left" | "right" | "bottom" | "up";
}

interface FoodPos {
	x: number;
	y: number;
}

export default class SnakeJS {
	private layout: Layout;
	private ctx: CanvasRenderingContext2D;

	private snakeSpeed = 300;
	private snakePos: SnakePosItem[] = [];
	private foodPos: FoodPos | undefined;

	private turnPos: SnakePosItem[] = [];

	private snakeInterval: number | undefined;
	private drawInterval: number | undefined;
	private timeInterval: number | undefined;

	private time = 0;

	private state: "PLAY" | "PAUSE" | "STOP" = "STOP";

	constructor(root: HTMLElement) {
		this.layout = new Layout(root, {
			height: HEIGHT,
			width: WIDTH,
			onStart: this.start,
			onControlBtn: this.handleEvent,
			onPauseResume: this.pauseResume,
		});
		this.ctx = this.layout.ctx;
		this.drawBg();
	}

	public start = () => {
		this.snakePos = [];
		this.turnPos = [];
		this.time = 0;
		for (var i = SNAKE_LENGTH - 1; i >= 0; i--) {
			this.snakePos.push({
				x: i * BLOCK_SIZE,
				y: 0,
				to: "right",
			});
		}
		this.layout.setScore("0000");
		this.draw();
		this.newFood();
		this.initGame();
		this.initEvent();
	};

	public initGame = () => {
		this.state = "PLAY";
		this.snakeInterval = setInterval(this.handleSnakeForward, this.snakeSpeed);
		this.drawInterval = setInterval(this.draw, 100);
		this.timeInterval = setInterval(() => {
			this.time++;
			this.layout.setTime(this.time + "s");
		}, 1000);
	};

	protected initEvent = () => {
		window.addEventListener("keydown", (event) => {
			this.handleEvent(event.key);
		});
	};
	public handleEvent = (key: string) => {
		switch (key) {
			case "ArrowUp":
				if (this.snakePos[0].to !== "bottom" && this.snakePos[0].to !== "up") {
					this.turnPos.push({
						x: this.snakePos[0].x,
						y: this.snakePos[0].y,
						to: "up",
					});
				}
				break;

			case "ArrowDown":
				if (this.snakePos[0].to !== "bottom" && this.snakePos[0].to !== "up") {
					this.turnPos.push({
						x: this.snakePos[0].x,
						y: this.snakePos[0].y,
						to: "bottom",
					});
				}
				break;

			case "ArrowLeft":
				if (this.snakePos[0].to !== "left" && this.snakePos[0].to !== "right") {
					this.turnPos.push({
						x: this.snakePos[0].x,
						y: this.snakePos[0].y,
						to: "left",
					});
				}
				break;

			case "ArrowRight":
				if (this.snakePos[0].to !== "left" && this.snakePos[0].to !== "right") {
					this.turnPos.push({
						x: this.snakePos[0].x,
						y: this.snakePos[0].y,
						to: "right",
					});
				}
				break;

			case " ":
				if (this.state === "PLAY") {
					this.pauseResume();
				}
		}
	};

	protected handleSnakeForward = () => {
		if (this.isDead()) {
			return this.onDead();
		}
		this.isEatFood();
		for (var i = 0; i < this.snakePos.length; i++) {
			let current = this.snakePos[i];
			this.turnPos.forEach((item, index) => {
				if (item.x === current.x && current.y === item.y) {
					current.to = item.to;
					if (i === this.snakePos.length - 1) {
						delete this.turnPos[index];
					}
				}
			});
			switch (current.to) {
				case "right":
					this.snakePos[i] = {
						x: current.x + BLOCK_SIZE,
						y: current.y,
						to: current.to,
					};
					break;

				case "left":
					this.snakePos[i] = {
						x: current.x - BLOCK_SIZE,
						y: current.y,
						to: current.to,
					};
					break;

				case "up":
					this.snakePos[i] = {
						x: current.x,
						y: current.y - BLOCK_SIZE,
						to: current.to,
					};
					break;

				case "bottom":
					this.snakePos[i] = {
						x: current.x,
						y: current.y + BLOCK_SIZE,
						to: current.to,
					};
					break;
			}
		}
	};

	protected clearAllInterval() {
		clearInterval(this.snakeInterval);
		clearInterval(this.drawInterval);
		clearInterval(this.timeInterval);
		this.state = "PAUSE";
	}

	protected onDead = () => {
		this.clearAllInterval();
		this.state = "STOP";
		this.layout.gameOverModal();
	};

	public pauseResume = () => {
		if (this.state === "PLAY") {
			this.clearAllInterval();
			this.layout.pausedModal();
		} else if (this.state === "PAUSE") {
			this.initGame();
		}
	};

	protected isDead = () => {
		let current = this.snakePos[0];
		if (current.x > WIDTH - BLOCK_SIZE || current.x < 0 || current.y > HEIGHT - BLOCK_SIZE || current.y < 0) {
			return true;
		}
		for (let i = 1; i < this.snakePos.length; i++) {
			const element = this.snakePos[i];
			if (current.x === element.x && current.y === element.y) {
				return true;
			}
		}

		return false;
	};

	protected isEatFood = () => {
		let current = this.snakePos[0];
		let food = this.foodPos;
		if (current.x === food?.x && current.y === food?.y) {
			let lastSnake = this.snakePos[this.snakePos.length - 1];
			let x = 0;
			let y = 0;
			switch (lastSnake.to) {
				case "right":
					x = lastSnake.x - BLOCK_SIZE;
					y = lastSnake.y;
					break;

				case "left":
					x = lastSnake.x + BLOCK_SIZE;
					y = lastSnake.y;
					break;

				case "up":
					x = lastSnake.x;
					y = lastSnake.y + BLOCK_SIZE;
					break;

				case "bottom":
					x = lastSnake.x;
					y = lastSnake.y - BLOCK_SIZE;
					break;
			}
			this.snakePos.push({
				x: x,
				y: y,
				to: lastSnake.to,
			});
			this.newFood();
			this.updateScore();
		}
	};

	protected updateScore = () => {
		this.layout.setScore(String((this.snakePos.length - SNAKE_LENGTH) * 10).padStart(4, "0"));
	};

	protected newFood = () => {
		let newFood = {
			x: this.random(0, WIDTH / BLOCK_SIZE) * BLOCK_SIZE,
			y: this.random(0, HEIGHT / BLOCK_SIZE) * BLOCK_SIZE,
		};
		for (const item of this.snakePos) {
			if (newFood.x === item.x && newFood.y === item.y) {
				this.newFood();
				return;
			}
		}
		this.foodPos = newFood;
	};

	protected random = (min: number, max: number) => {
		return Math.floor(Math.random() * max) + min;
	};

	protected draw = () => {
		this.drawBg();
		this.drawFood();
		this.drawSnake();
	};

	protected drawBg = () => {
		this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
		for (var i = 0; i < HEIGHT / BLOCK_SIZE; i++) {
			for (var j = 0; j < WIDTH / BLOCK_SIZE; j++) {
				let x = j * BLOCK_SIZE;
				let y = i * BLOCK_SIZE;
				if (i % 2 === 0) {
					this.ctx.fillStyle = j % 2 === 0 ? DARK_BLOCK : LIGHT_BLOCK;
				} else {
					this.ctx.fillStyle = j % 2 === 0 ? LIGHT_BLOCK : DARK_BLOCK;
				}
				this.ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
			}
		}
	};

	protected drawSnake = () => {
		this.ctx.fillStyle = SNAKE_COLOR;
		for (var i = this.snakePos.length - 1; i >= 0; i--) {
			let current = this.snakePos[i];
			this.ctx.beginPath();
			if (i === 0) {
				this.ctx.roundRect(
					current.x,
					current.y,
					BLOCK_SIZE,
					BLOCK_SIZE,
					current.to === "right"
						? [0, SNAKE_ROUNDED, SNAKE_ROUNDED, 0]
						: current.to === "left"
						? [SNAKE_ROUNDED, 0, 0, SNAKE_ROUNDED]
						: current.to === "up"
						? [SNAKE_ROUNDED, SNAKE_ROUNDED, 0, 0]
						: [0, 0, SNAKE_ROUNDED, SNAKE_ROUNDED]
				);
			} else if (i === this.snakePos.length - 1) {
				let prev = this.snakePos[i - 1];
				this.ctx.roundRect(
					current.x,
					current.y,
					BLOCK_SIZE,
					BLOCK_SIZE,
					prev.to === "right"
						? [SNAKE_ROUNDED, 0, 0, SNAKE_ROUNDED]
						: prev.to === "left"
						? [0, SNAKE_ROUNDED, SNAKE_ROUNDED, 0]
						: prev.to === "up"
						? [0, 0, SNAKE_ROUNDED, SNAKE_ROUNDED]
						: [SNAKE_ROUNDED, SNAKE_ROUNDED, 0, 0]
				);
			} else {
				this.ctx.rect(current.x, current.y, BLOCK_SIZE, BLOCK_SIZE);
			}
			this.ctx.fill();
		}
	};

	protected drawFood = () => {
		if (this.foodPos) {
			this.ctx.fillStyle = FOOD_COLOR;
			this.ctx.fillRect(this.foodPos.x, this.foodPos.y, BLOCK_SIZE, BLOCK_SIZE);
		}
	};
}
