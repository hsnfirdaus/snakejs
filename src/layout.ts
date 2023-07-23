import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, createElement, Github, Trophy } from "lucide";

interface StateHolder {
	score: HTMLElement;
	timer: HTMLElement;
}
interface Config {
	width: number;
	height: number;
	onStart: () => void;
	onControlBtn: (key: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight") => void;
	onPauseResume: () => void;
}
export default class Layout {
	private root: HTMLElement;
	public ctx: CanvasRenderingContext2D;
	public holder: StateHolder;

	private config: Config;

	constructor(root: HTMLElement, config: Config) {
		this.root = root;
		this.config = config;

		const container = document.createElement("div");
		container.className = "rounded-2xl shadow-2xl";
		this.root.appendChild(container);

		const header = this.createHeader();
		container.appendChild(header);

		const canvasContainer = document.createElement("div");
		canvasContainer.className = "max-w-[800px] h-auto";
		const canvas = this.createCanvas(config.width, config.height);
		canvasContainer.appendChild(canvas);
		container.appendChild(canvasContainer);
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("Can't get canvas context");
		}
		this.ctx = ctx;

		const { containerElement: footerContainer, timerElement, scoreElement } = this.createFooter();
		this.holder = {
			timer: timerElement,
			score: scoreElement,
		};
		container.appendChild(footerContainer);

		this.startModal();
	}

	private createHeader = (): HTMLElement => {
		const header = document.createElement("header");
		header.className = "text-center p-2 bg-teal-800 text-teal-200 font-bold text-2xl rounded-t-2xl";
		const title = document.createElement("h1");
		title.innerText = "SnakeJS";
		header.appendChild(title);
		return header;
	};

	private createCanvas = (width: number, height: number): HTMLCanvasElement => {
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		canvas.className = "w-full";
		return canvas;
	};

	private createFooter = () => {
		const footer = document.createElement("section");
		footer.className =
			"p-4 bg-teal-800 rounded-b-2xl grid grid-cols-[100px_minmax(10px,_100fr)_100px] items-center";

		const statistics = document.createElement("div");

		const { container: scoreContainer, text: scoreText } = this.createIconWithText(Trophy, "0000");
		statistics.appendChild(scoreContainer);

		const { container: timerContainer, text: timerText } = this.createIconWithText(Clock, "0s");
		statistics.appendChild(timerContainer);

		footer.appendChild(statistics);

		const controls = this.createControls();
		footer.appendChild(controls);

		const others = document.createElement("div");
		others.className = "text-right";
		const github = document.createElement("a");
		github.className = "inline-block bg-gray-950 p-2 rounded-full hover:bg-gray-900";
		github.href = "https://github.com/hsnfirdaus/snakejs";
		github.target = "_blank";
		const githubIcon = createElement(Github);
		githubIcon.classList.add("text-white");
		github.appendChild(githubIcon);
		others.appendChild(github);
		footer.appendChild(others);

		return {
			containerElement: footer,
			scoreElement: scoreText,
			timerElement: timerText,
		};
	};

	private createIconWithText = (icon: typeof Trophy, text: string) => {
		const container = document.createElement("div");
		container.className = "flex items-center gap-2 m-2";
		const iconElement = createElement(icon);
		iconElement.classList.add("text-teal-200", "w-5");
		iconElement.setAttribute("stroke-width", "3px");
		container.appendChild(iconElement);
		const textElement = document.createElement("span");
		textElement.className = "text-teal-200 font-bold font-mono text-xl";
		textElement.innerText = text;
		container.appendChild(textElement);

		return {
			container: container,
			text: textElement,
		};
	};

	private createControls = () => {
		const container = document.createElement("div");
		container.className = "text-center";
		const table = document.createElement("table");
		table.className = "mx-auto";
		const tbody = document.createElement("tbody");

		const row1 = document.createElement("tr");
		row1.appendChild(document.createElement("td"));
		const upTd = document.createElement("td");
		row1.appendChild(upTd);
		row1.appendChild(document.createElement("td"));
		const upBtn = this.createControlBtn(ChevronUp, () => this.config.onControlBtn("ArrowUp"));
		upTd.appendChild(upBtn);

		tbody.appendChild(row1);

		const row2 = document.createElement("tr");
		const leftTd = document.createElement("td");
		const leftBtn = this.createControlBtn(ChevronLeft, () => this.config.onControlBtn("ArrowLeft"));
		leftTd.appendChild(leftBtn);
		row2.appendChild(leftTd);
		row2.appendChild(document.createElement("td"));

		const rightTd = document.createElement("td");
		const rightBtn = this.createControlBtn(ChevronRight, () => this.config.onControlBtn("ArrowRight"));
		rightTd.appendChild(rightBtn);
		row2.appendChild(rightTd);

		tbody.appendChild(row2);

		const row3 = document.createElement("tr");
		row3.appendChild(document.createElement("td"));
		const downTd = document.createElement("td");
		row3.appendChild(downTd);
		row3.appendChild(document.createElement("td"));
		const downBtn = this.createControlBtn(ChevronDown, () => this.config.onControlBtn("ArrowDown"));
		downTd.appendChild(downBtn);

		tbody.appendChild(row3);

		table.appendChild(tbody);
		container.appendChild(table);
		return container;
	};

	private createControlBtn = (icon: typeof Trophy, onClick: (event: MouseEvent) => void) => {
		const btn = document.createElement("button");
		btn.onclick = onClick;
		btn.classList.add(
			"bg-teal-500",
			"hover:bg-teal-400",
			"active:bg-teal-600",
			"transition-color",
			"rounded",
			"w-8",
			"h-8",
			"flex",
			"items-center",
			"justify-center"
		);
		const btnIcon = createElement(icon);
		btnIcon.classList.add("text-teal-800");
		btn.appendChild(btnIcon);

		return btn;
	};

	public setScore = (score: string) => {
		this.holder.score.innerText = score;
	};

	public setTime = (time: string) => {
		this.holder.timer.innerText = time;
	};

	private createButton = (label: HTMLElement | string, onClick: (ev: MouseEvent) => void) => {
		const btn = document.createElement("button");
		btn.className =
			"bg-orange-300 hover:bg-orange-200 active:bg-orange-400 text-orange-800 font-bold px-4 py-2 rounded-xl";
		if (typeof label === "string") {
			btn.innerText = label;
		} else {
			btn.appendChild(label);
		}
		btn.onclick = (ev) => onClick(ev);
		return btn;
	};

	public startModal = () => {
		const content = document.createElement("div");
		content.className = "text-center";
		const modal = this.fullModal("Start Game", content);
		const startBtn = this.createButton("START", () => {
			modal.remove();
			this.config.onStart();
		});
		const information = document.createElement("p");
		information.className = "text-white mb-4";
		information.innerText =
			"You can use your keyboard arrow (↑,↓,→,←) to control the snake, or use control button on screen. To pause the game, press SPACE.";
		content.appendChild(information);
		content.appendChild(startBtn);
	};

	public gameOverModal = () => {
		const content = document.createElement("div");
		content.className = "text-center";
		const modal = this.fullModal("Game Over!", content);
		const startBtn = this.createButton("RESTART", () => {
			modal.remove();
			this.config.onStart();
		});
		const score = document.createElement("span");
		score.className = "font-mono font-bold text-4xl text-teal-200";
		score.innerText = this.holder.score.innerText;
		content.append(score);
		const information = document.createElement("p");
		information.className = "text-white mb-4";
		information.innerText = "Click button below to restart the game.";
		content.appendChild(information);
		content.appendChild(startBtn);
	};

	public pausedModal = () => {
		const content = document.createElement("div");
		content.className = "text-center";
		const modal = this.fullModal("Game Paused!", content);
		const startBtn = this.createButton("RESUME", () => {
			modal.remove();
			this.config.onPauseResume();
		});
		const information = document.createElement("p");
		information.className = "text-white mb-4";
		information.innerText = "Click button below to resume the game.";
		content.appendChild(information);
		content.appendChild(startBtn);
	};

	private fullModal = (title: string, children: HTMLElement) => {
		const container = document.createElement("div");
		container.className = "bg-teal-950/80 fixed inset-0 z-50 flex items-center justify-center";

		const modal = document.createElement("div");
		modal.className = "w-full max-w-2xl";

		const header = document.createElement("h2");
		header.innerText = title;
		header.className = "text-teal-200 font-bold text-center text-3xl bg-teal-600 p-4 rounded-t-2xl";
		modal.appendChild(header);

		const content = document.createElement("div");
		content.className = "bg-teal-800 p-4 rounded-b-2xl";
		content.appendChild(children);
		modal.appendChild(content);

		container.appendChild(modal);
		this.root.appendChild(container);
		return container;
	};
}
