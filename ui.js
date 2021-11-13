class Template {
	constructor(url) {
		this.url = url;
		this.html = null;
		this.loaded = new Promise(res => {
			this.load(res);
		})
	}

	async load(callback) {
		this.html = new DOMParser().parseFromString(await (await fetch(this.url, {cache: "no-store"})).text(), "text/html");
		callback();
	}

	insert() {
		for (let node of this.html?.head.children)
			document.head.appendChild(node);
		for (let node of this.html?.body.children)
			document.body.appendChild(node);
	}
}

class Ui {

	constructor() {
		this.templates = {};
		this.executor = null;
		this.lastSelected = null;
		this.ready = new Promise(res => this.init(res));
	}

	async loadTemplate(url) {
		let html = new DOMParser().parseFromString(await (await fetch(url)).text(), "text/html");
		return {head: html?.head.children, body: html?.body.children};
	}

	async init(callback) {
		window.ui = this;
		let commandsTpl = new Template('templates/commands.html');
		await commandsTpl.loaded;
		commandsTpl.insert();
		this.templates.commands = document.body.querySelector('[commands] [list]');
		this.templates.algorithme = document.body.querySelector('[commands] [list] [algorithme]');
		this.templates.functions = document.body.querySelector('[commands] [list] [functions]');

		this.templates.cellCommand = document.body.querySelector('[commands] [list] [algorithme] [line] [cell]').cloneNode();
		this.templates.lineAlgorithme = document.body.querySelector('[commands] [list] [algorithme] [line]').cloneNode();
		this.templates.cellFunction = document.body.querySelector('[commands] [list] [functions] [cell]').cloneNode();

		this.clear();
		this.addFunction();
		callback();
	}

	nextLevel(callback) {
		let button = document.body.querySelector('#nextLevel[hidden]');

		if (button) {
			button.removeAttribute('hidden');
			document.body.querySelector('button[play]').innerHTML = 'Play';
			button.onclick = () => {
				callback();
				button.setAttribute('hidden', '');
				button.onclick = null;

				this.clear();
				this.addFunction();
			}
		}
	}

	addFunction() {
		let func = this.templates.cellFunction.cloneNode();
		let line = this.templates.lineAlgorithme.cloneNode();

		func.setAttribute('value', this.templates.functions.children.length);
		line.appendChild(this.templates.cellCommand.cloneNode());

		this.templates.functions.appendChild(func);
		this.templates.algorithme.appendChild(line);
	}

	removeFunction(i) {
		let func = this.templates.functions.children[i];
		let line = this.templates.algorithme.children[i];
		
		func.parentNode.removeChild(func);
		line.parentNode.removeChild(line);
	}

	clear() {
		let length = this.templates.functions.children.length;
		for (let i = 0; i < length; i++) {
			this.removeFunction(0);
		}
	}

	getCommands() {
		let commands = [];

		for (let line of this.templates.algorithme.children) {
			let lineCommands = [];

			for (let cell of line.children) {
				let command = cell.getAttribute('command');
				let condition = cell.getAttribute('condition');

				if (command == null) break;

				lineCommands.push(condition << 4 | command);
				if (command == 0x0f)
					lineCommands.push(cell.getAttribute('value') |0);
			}
			commands.push(lineCommands);
		}
		return commands;
	}

	selected(f, i) {
		if (this.lastSelected) {
			this.lastSelected.removeAttribute('selected');
		}
		if (f < this.templates.algorithme.children.length
			&& i < this.templates.algorithme.children[f].children.length) {
			this.lastSelected = this.templates.algorithme.children[f].children[i];
			this.lastSelected.setAttribute('selected', '');
		}
	}

	play(e) {
		if (this.executor.running) {
			this.executor.stop();
			e.innerHTML = 'Play';
		}
		else {
			this.executor.setCommands(this.getCommands());
			this.executor.play();
			if (this.executor.running)
				e.innerHTML = 'Pause';
		}
	}

	reset() {
		this.executor.init();
		document.body.querySelector('button[play]').innerHTML = 'Play';
		if (this.lastSelected) {
			this.lastSelected.removeAttribute('selected');
			this.lastSelected = null;
		}
	}

	dragStart(ev) {
		ev.dataTransfer.setData("text/plain", JSON.stringify({
			condition: ev.target.getAttribute("condition"),
			command: ev.target.getAttribute("command"),
			value: ev.target.getAttribute("value"),
		}));
		ev.dataTransfer.dropEffect = "copy";
	}

	dragOver(ev) {
		ev.preventDefault();
 		ev.dataTransfer.dropEffect = "move";
	}

	drop(ev) {
		ev.preventDefault();
		var data = JSON.parse(ev.dataTransfer.getData("text/plain"));
		let target = ev.target;
		let length = target.parentNode.children.length;
		let lengthFunction = target.parentNode.parentNode.children.length;
		let index = Array.from(target.parentNode.children).indexOf(target);
		let indexFunction = Array.from(target.parentNode.parentNode.children).indexOf(target.parentNode);

		if (index == length - 1)
			target.parentNode.appendChild(this.templates.cellCommand.cloneNode());
		if (indexFunction == lengthFunction - 1)
			this.addFunction();

		for (let attr in data)
			if (data[attr])
				ev.target.setAttribute(attr, data[attr]);
	}
}

export { Ui }
