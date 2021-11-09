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
		this.init();
		this.executor = null;
		this.commandsDom = null;
	}

	async loadTemplate(url) {
		let html = new DOMParser().parseFromString(await (await fetch(url)).text(), "text/html");
		return {head: html?.head.children, body: html?.body.children};
	}

	async init() {
		window.ui = this;
		let commandsTpl = new Template('templates/commands.html');
		await commandsTpl.loaded;
		commandsTpl.insert();
		this.commandsDom = document.body.querySelector('[commands] [list]');
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
				Array.from(this.commandsDom.childNodes).forEach(f => { if (this.commandsDom.childNodes.length > 1) f.parentNode.removeChild(f) });
			}
		}
	}

	getCommands() {
		let commands = Array.from(this.commandsDom.children).map(e => {
			return e.getAttribute('condition') << 4 | e.getAttribute('command');
		});
		return commands;
	}

	play(e) {
		if (this.executor.running) {
			e.innerHTML = 'Play';
			this.executor.stop();
		}
		else {
			this.executor.setCommands(this.getCommands());
			e.innerHTML = 'Pause';
			this.executor.play();
		}
	}

	reset() {
		this.executor.init();
		document.body.querySelector('button[play]').innerHTML = 'Play';
	}

	dragStart(ev) {
		ev.dataTransfer.setData("text/plain", JSON.stringify({
			condition: ev.target.getAttribute("condition"),
			command: ev.target.getAttribute("command"),
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
		let index = Array.from(target.parentNode.children).indexOf(target);

		if (index == length -1) {
			let node = target.cloneNode();
			node.value = 0;
			target.parentNode.appendChild(node);
			Array.from(target.parentNode.childNodes).forEach(f => { if (f.nodeType == 3) f.parentNode.removeChild(f) });
		}

		if (data.condition)
			ev.target.setAttribute("condition", data.condition);
		if (data.command)
			ev.target.setAttribute("command", data.command);
	}
}

export { Ui }
