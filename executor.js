import { Map } from './map.js'


const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

class Rules {
	static commands = [
		null,
		Rules.forward,
		Rules.turnLeft,
		Rules.turnRight,
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
		this.iterator = 0;
		this.running = false;

		this.init();
	}

	get pointers() {
		return this.currentStates.pointers;
	}

	get points() {
		return this.currentStates.points;
	}

	get command() {
		if (!this.commands.length)
			return null;
		return this.commands[this.iterator];
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
	}

	next() {
		if (this.commands.length)
			this.iterator = (this.iterator + 1) % this.commands.length;
	}

	play() {
		this.running = true;
	}

	stop() {
		this.running = false;
	}

	exec() {
		if (!this.running || this.finish || !this.commands.length || this.commands.every(c => !(c & 0x0f)))
			return
		
		let currentCommand = this.command;
		while (!currentCommand) {
			this.next();
			currentCommand = this.command;
		}

		this.pointers.forEach(pointer => {
			Rules.exec(currentCommand, pointer, this.map);
			this.currentStates.points = this.points.filter(point => !(point.x == pointer.x && point.y == pointer.y));
		});
		this.next();
	}
}

export { Executor }
