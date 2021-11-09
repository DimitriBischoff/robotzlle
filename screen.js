import { Map } from './map.js'

class Screen {
	constructor() {
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.colors = ['#808080', '#0000FF', '#00FF00', '#FF0000'];
	}

	resize(width, height) {
		this.canvas.width = width;
		this.canvas.height = height;
	}

	drawMap(map) {
		let scaleX = this.canvas.width / map.width |0;
		let scaleY = this.canvas.height / map.height |0;

		for (var j = 0; j < map.height; j++) {
			for (var i = 0; i < map.width; i++) {
				let color = map.get(i, j, Map.masks.color);

				if (color) {
					this.ctx.fillStyle = this.colors[color];
					this.ctx.fillRect(i * scaleX, j * scaleY, scaleX, scaleY);
				}
			}
		}
	}

	drawCurs(map, position) {
		let scaleX = this.canvas.width / map.width |0;
		let scaleY = this.canvas.height / map.height |0;
		let scalePointer = 0.6;
		let width = scaleX * scalePointer;
		let height = scaleY * scalePointer;

		this.ctx.save();
		this.ctx.translate(
			position.x * scaleX + scaleX * .5,
			position.y * scaleY + scaleY * .5);
		this.ctx.scale(scaleX * scalePointer, scaleY * scalePointer);
		this.ctx.rotate(position.d * 90 * Math.PI / 180);
		this.ctx.fillStyle = '#FFFF00';
		this.ctx.beginPath();
		this.ctx.moveTo(-.5, -.5);
		this.ctx.lineTo(-.5, .5);
		this.ctx.lineTo(.5, 0);
		this.ctx.fill();
		this.ctx.restore();
	}

	drawPoint(map, position) {
		let scaleX = this.canvas.width / map.width |0;
		let scaleY = this.canvas.height / map.height |0;
		let scalePoint = 0.3;

		this.ctx.fillStyle = '#FFFF00';
		this.ctx.fillRect(
			position.x * scaleX + scaleX * .5 - scaleX * scalePoint * .5,
			position.y * scaleY + scaleY * .5 - scaleY * scalePoint * .5,
			scaleX * scalePoint,
			scaleY * scalePoint);
	}

	drawGrid(map) {
		let scaleX = this.canvas.width / map.width |0;
		let scaleY = this.canvas.height / map.height |0;

		this.ctx.strokeStyle = 'black';
		this.ctx.lineWidth = 2;
		for (var j = 0; j <= map.height; j++) {
			this.ctx.beginPath();
			this.ctx.moveTo(0, j * scaleY);
			this.ctx.lineTo(this.canvas.width, j * scaleY);
			this.ctx.stroke();
		}

		for (var i = 0; i <= map.width; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(i * scaleX, 0);
			this.ctx.lineTo(i * scaleX, this.canvas.height);
			this.ctx.stroke();
		}
	}

	parent(elem) {
		elem.appendChild(this.canvas);
	}
}

export { Screen };
