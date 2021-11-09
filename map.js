class Mask {
	constructor(value) {
		this.value = value;
		this.shift = Mask._shift(value);
	}

	static _shift(mask) {
		let shift = 0;
		while (mask && !(mask & 1)) {
			mask >>= 1;
			shift++;
		}
		return shift;
	}
}

class Map {
	static masks = {
		elem : new Mask(0b00110000),
		color: new Mask(0b00000011),
	}

	constructor(width, height, array=null) {
		this.array = (!array) ? new Uint8Array(width * height) : Uint8Array.from(array);
		this.height = height;
		this.width = width;

		console.log(`new map ${width}:${height}`);
	}

	get(x, y, mask=null) {
		if (this.is_in(x, y)) {
			if (mask)
				return (this.array[y * this.width + x] & mask.value) >> mask.shift;
			return this.array[y * this.width + x];
		}
		return null;
	}

	set(x, y, value, mask=null) {
		if (this.is_in(x, y)) {
			if (mask)
				this.array[y * this.width + x] = (this.array[y * this.width + x] & ~mask.value) | (value << mask.shift & mask.value);
			else
				this.array[y * this.width + x] = value;
		}
	}

	is_in(x, y) {
		return (x >= 0 && x < this.width && y >= 0 && y < this.height);
	}

	static toStr(map) {
		let array = [];
		for (let y = 0; y < map.height; y++) {
			let line = [];
			for (let x= 0; x < map.width; x++) {
				line.push(('0'+(map.get(x, y)).toString(16)).slice(-2))
			}
			array.push(line.join(' '));
		}
		return array.join('\n');
	}

	static randomGenerate() {
		let width = Math.random() * (10 - 5) + 5 |0;
		let height = Math.random() * (10 - 5) + 5 |0;

		let map = new Map(width, height);

		for (let j = 0; j < height; j++) {
			for (let i = 0; i < width; i++) {
				let color = Math.random() * 4 |0;
				map.set(i, j, color, Map.masks.color);
			}
		}

		let setStart = 1;
		while (setStart > 0) {
			let x = Math.random() * width |0;
			let y = Math.random() * height |0;

			if (map.get(x, y, Map.masks.color)) {
				map.set(x, y, 1, Map.masks.elem);
				setStart--;
			}
		}

		let setPoints = 1;
		while (setPoints > 0) {
			let x = Math.random() * width |0;
			let y = Math.random() * height |0;

			if (map.get(x, y, Map.masks.color)) {
				map.set(x, y, 2, Map.masks.elem);
				setPoints--;
			}
		}
		return map;
	}

	static fromArray(array, width) {
		let height = array.length / width |0;
		if (width * height != array.length)
			return null;
		return new Map(width, height, array);
	}

	static fromString(string) {
		let width = -1;
		let array = [];
		for (let line of string.trim().split('\n')) {
			let cells = line.split(' ');

			if (width == -1)
				width = cells.length;
			array = array.concat(cells.map(c => parseInt(c, 16)));
		}
		return Map.fromArray(array, width);
	}
}

export { Map, Mask };
