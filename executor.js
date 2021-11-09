import { Map } from './map.js'


const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

class Rules {
	static commands = [
		null,
		Rules.forward,
		Rules.turnLeft,
		Rules.turnRight,
		Rules.call,
	];

	static forward(pointer, map) {
		[
			() => { pointer.x++ },
			() => { pointer.y++ },
			() => { pointer.x-- },
			() => { pointer.y-- },
		][pointer.d]?.();
		console.log(pointer)
	}

	static turnLeft(pointer, map) {
		pointer.d = (4 + pointer.d - 1) % 4;
	}

	static turnRight(pointer, map) {
		pointer.d = (pointer.d + 1) % 4;
	}

	static exec(command, pointer, map) {
		let color = (0xf0 & command) >> 4;
		let run = (0x0f & command);
		let colorPosition = map.get(pointer.x, pointer.y, Map.masks.color);

		if (!color || color == colorPosition) {
			Rules.commands[run]?.(pointer, map);
		}
	}
}


class Executor {
	constructor(states, map) {
		this.initStates = states;
		this.currentStates = null;
		this.map = map;
		this.commands = [];
		this.function = 0;
		this.iterator = 0;
		this.selected = 0;
		this.running = false;
		this.end = false;
		this.count = 0;

		this.init();
	}

	get pointers() {
		return this.currentStates.pointers;
	}

	get points() {
		return this.currentStates.points;
	}

	get command() {
		if (!this.commands[this.function]?.length) {
			this.end = true;
			return null;
		}
		return this.commands[this.function][this.iterator];
	}

	get finish() {
		return this.points.length == 0 || this.pointers.some(p => !this.map.get(p.x, p.y));
	}

	setCommands(commands) {
		this.init();
		this.commands = commands;
	}

	init() {
		this.currentStates = deepCopy(this.initStates);
		this.running = false;
		this.iterator = 0;
		this.function = 0;
		this.selected = 0;
		this.end = false;
		this.count = 0;
	}

	next() {
		if (this.commands[this.function]?.length && this.iterator < this.commands[this.function]?.length - 1) {
			this.iterator++;
			this.selected++;
		}
		else
			this.end = true;
	}

	changeFunction(i) {
		this.function = i;
		this.iterator = 0;
		this.selected = 0;
	}

	play() {
		this.running = true;
	}

	stop() {
		this.running = false;
	}

	exec() {
		if (!this.running || this.finish || this.end || !this.commands[this.function]?.length || this.commands[this.function]?.every(c => !(c & 0x0f))) {
			this.stop();
			return
		}
		
		let currentCommand = this.command;
		while (!currentCommand) {
			this.next();
			currentCommand = this.command;
			if (this.end)
				return;
		}

		if (currentCommand == 0x0f) {
			this.next();
			if (!this.end) {
				this.selected--;
				this.changeFunction(this.command);
			}
		}
		else {
			this.pointers.forEach(pointer => {
				Rules.exec(currentCommand, pointer, this.map);
				this.currentStates.points = this.points.filter(point => !(point.x == pointer.x && point.y == pointer.y));
			});
			this.next();
		}
	}
}

export { Executor }
