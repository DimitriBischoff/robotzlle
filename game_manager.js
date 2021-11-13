import { Map } from './map.js'
import { Executor } from './executor.js'


class GameManager {
	constructor(screen, ui) {
		this.screen = screen;
		this.ui = ui;
		this.states = {
			zoom: 30,
			level: 0,
			executors: []
		}
		this.maps = [];
	}

	addLevels(levels) {
		this.maps = this.maps.concat(levels.trim().split('\n\n').map(lvl => Map.fromString(lvl)));
	}

	initLevel() {
		if (!this.maps[this.states.level]) {
			this.maps[this.states.level] = Map.randomGenerate();
		}

		let lvl = this.states.level;
		let map = this.maps[lvl];
		let levelState = {
			pointers: [],
			points: [],
		};

		for (let j = 0; j < map.height; j++) {
			for (let i = 0; i < map.width; i++) {
				[
					null,
					levelState.pointers,
					levelState.points,
				][
					map.get(i, j, Map.masks.elem)
				]?.push({x:i, y:j, d:0});
			}
		}
		console.log(levelState)
		console.log(Map.toStr(map));
		this.states.executors[lvl] = new Executor(levelState, map);
	}

	setLevel(i) {
		this.states.level = i;

		if (!this.states.executors[this.states.level]) {
			this.initLevel();
		}
		this.ui.executor = this.current();
	}

	nextLevel() {
		this.setLevel(this.states.level + 1);
	}

	current() {
		return this.states.executors[this.states.level];
	}

	async start() {
		let fps = 1000 / 3;

		this.setLevel(0);

		let loop = () => {
			this.run();
			setTimeout(() => { loop(); }, fps);
		};

		await this.ui.ready;
		loop();
	}

	run() {
		let scale = this.states.zoom;
		let map = this.maps[this.states.level];
		let executor = this.current();

		if (executor.running) {
			if (executor.win) {
				console.log('gagner');
				ui.nextLevel(() => {
					this.nextLevel();
				})
				executor.stop();
			}
			else if (executor.out) {
				console.log('out');
				executor.stop();
			}
			else {
				for (let pointer of executor.pointers) {
					this.ui.selected(pointer.state.function, pointer.state.selected);
				}
				executor.exec();
			}
		}

		// Draw
		this.screen.resize(map.width * scale, map.height * scale);
		this.screen.drawMap(map);
		this.screen.drawGrid(map);
		for (let start of executor.pointers)
			this.screen.drawCurs(map, start);
		for (let point of executor.points)
			this.screen.drawPoint(map, point);
	}
}

export { GameManager };
