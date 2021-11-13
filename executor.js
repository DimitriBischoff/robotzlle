import { Map } from './map.js'


const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

class Rules {
	static commands = [
		null,
		Rules.forward,
		Rules.turnLeft,
		Rules.turnRight,
		null, null, null, null, null, null, null, null, null, null, null,
		Rules.call
	];

	static forward(commands, pointer, map) {
		[
			() => { pointer.x++ },
			() => { pointer.y++ },
			() => { pointer.x-- },
			() => { pointer.y-- },
		][pointer.d]?.();
	}

	static turnLeft(commands, pointer, map) {
		pointer.d = (4 + pointer.d - 1) % 4;
	}

	static turnRight(commands, pointer, map) {
		pointer.d = (pointer.d + 1) % 4;
	}

	static call(commands, pointer, map) {
		pointer.stack.push({
			function: pointer.state.function,
			iterator: pointer.state.iterator + 1,
			selected: pointer.state.selected
		});
		pointer.state = {
			function: commands[pointer.state.function][pointer.state.iterator + 1],
			iterator: -1,
			selected: -1
		}
	}

	static exec(commands, pointer, map) {
		if (pointer.end) return;

		if (pointer.state.iterator >= commands[pointer.state.function]?.length) {
			if (pointer.stack.length) {
				pointer.state = pointer.stack.pop();
			}
			else {
				pointer.end = true;
				return;
			}
		}
		else {
			let command = commands[pointer.state.function][pointer.state.iterator];
			let color = (0xf0 & command) >> 4;
			let run = (0x0f & command);
			let colorPosition = map.get(pointer.x, pointer.y, Map.masks.color);

			if (!color || color == colorPosition) {
				Rules.commands[run]?.(commands, pointer, map);
			}
			else if (run == 0x0f) {
				pointer.state.iterator++;
			}
		}

		pointer.state.iterator++;
		pointer.state.selected++;
	}
}


class Executor {
	constructor(states, map) {
		this.initStates = states;
		this.currentStates = null;
		this.map = map;
		this.commands = [];
		this.running = false;
		this.count = 0;

		this.init();
	}

	get pointers() {
		return this.currentStates.pointers;
	}

	get points() {
		return this.currentStates.points;
	}

	get win() {
		return this.points.length == 0;
	}

	get out() {
		return this.pointers.some(p => !this.map.get(p.x, p.y));
	}

	setCommands(commands) {
		this.init();
		this.commands = commands;
	}

	init() {
		this.currentStates = deepCopy(this.initStates);
		for (let pointer of this.pointers) {
			pointer.state = {
				function: 0,
				iterator: 0,
				selected: 0
			};
			pointer.stack = [];
			pointer.end = false;
		}
		this.running = false;
		this.count = 0;
	}

	play() {
		if (this.commands.length && this.commands[0].length)
			this.running = true;
	}

	stop() {
		this.running = false;
	}

	exec() {
		this.pointers.forEach(pointer => {
			Rules.exec(this.commands, pointer, this.map);
			this.currentStates.points = this.points.filter(point => !(point.x == pointer.x && point.y == pointer.y));
		});
	}
}

export { Executor }
