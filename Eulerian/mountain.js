function drawMountain(canvas, config, mountain) {
	let ctx = canvas.getContext("2d");
	let PADDING = config.PADDING;
	let rowWidth = config.rowWidth;
	let rowHeight = config.rowHeight;
	let textHeight = config.textHeight;
	let lineSpace = config.lineSpace;

	function clear() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.font = `${textHeight}px Consolas`;
	}
	clear();

	if (mountain.length == 0) {
		canvas.style.display = "none";
		return;
	} else {
		canvas.style.removeProperty("display");
	}

	function drawLine(x0, y0, x1, y1) {
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.strokeStyle = "#222";
		ctx.lineWidth = 5;
		ctx.stroke();
		ctx.strokeStyle = "#aaa";
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	let width0 = ctx.measureText(mountain[0][0].value).width;
	let width1 = ctx.measureText(mountain[0].at(-1).value).width;

	let maxWidth = ctx.measureText("-1").width;
	let maxHeight = 0;
	for (let i = 0; i < mountain.length; i++) {
		for (let j = 0; j < mountain[i].length; j++) {
			let measure = ctx.measureText(mountain[i][j].value);
			maxWidth = Math.max(maxWidth, measure.width);
			maxHeight = Math.max(maxHeight, measure.actualBoundingBoxAscent);
		}
	}
	rowWidth += maxWidth;
	rowHeight += maxHeight + lineSpace*2;

	canvas.setAttribute("width", (mountain[0].length - 1)*rowWidth + width0/2 + width1/2 + PADDING*2);
	canvas.setAttribute("height", (mountain.length - 1)*rowHeight + maxHeight + PADDING*2);
	clear();

	function getPosition(i, j) {
		return [(mountain[i][j].position)*rowWidth + width0/2 + PADDING, (mountain.length-i-1)*rowHeight + maxHeight + PADDING];
	}

	for (let i = 1; i < mountain.length; i++) {
		for (let j = 0; j < mountain[i].length; j++) {
			let [x, y] = getPosition(i, j);
			drawLine(x, y + lineSpace, x, y + rowHeight - maxHeight - lineSpace);
		}
	}
	for (let i = 0; i < mountain.length; i++) {
		for (let j = 0; j < mountain[i].length; j++) {
			let parentIndex = mountain[i][j].parentIndex;
			if (parentIndex != -1) {
				let [x, y] = getPosition(i, j);
				let upperMeasure = ctx.measureText(mountain[i+1].find(v => v.position == mountain[i][j].position).value);
				let parentMeasure = ctx.measureText(mountain[i][parentIndex].value);
				let y0 = y - rowHeight - upperMeasure.actualBoundingBoxAscent / 2, y1 = y - parentMeasure.actualBoundingBoxAscent / 2;
				let x0 = x, x1 = x - (j - parentIndex) * rowWidth;
				let dy = (y1 - y0), dx = (x1 - x0);
				let magnitude = Math.sqrt(dy*dy + dx*dx);
				let uy = dy/magnitude, ux = dx/magnitude;
				let space0 = lineSpace + upperMeasure.width / 2;
				let space1 = lineSpace + parentMeasure.width / 2;
				drawLine(x0 + ux*space0, y0 + uy*space0, x1 - ux*space1, y1 - uy*space1);
			}
		}
	}
	for (let i = 0; i < mountain.length; i++) {
		for (let j = 0; j < mountain[i].length; j++) {
			let value = mountain[i][j].value;
			let text = value.toString();
			let [x, y] = getPosition(i, j);
			let measure = ctx.measureText(text);
			ctx.strokeStyle = "#222";
			ctx.fillStyle = "white";
			ctx.lineWidth = 3;
			ctx.strokeText(text, x - measure.width / 2, y);
			ctx.fillText(text, x - measure.width / 2, y);
		}
	}
}