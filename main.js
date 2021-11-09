import { Screen } from './screen.js'
import { Map } from './map.js'
import { GameManager } from './game_manager.js'
import { LEVELS } from './levels.js'
import { Ui } from './ui.js'


window.onload = function() {
	let ui = new Ui();
	let screen = new Screen();
	screen.parent(document.body);

	let gm = new GameManager(screen, ui);

	gm.addLevels(LEVELS);

	gm.start();

	window.gm = gm;
}
