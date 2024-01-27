let viewerConfig = {
	PADDING: 10
};

function drawMountain(canvas, mountain) {
	let ctx = canvas.getContext("2d");
	let PADDING = viewerConfig.PADDING;
	let rowWidth = viewerConfig.rowWidth;
	let rowHeight = viewerConfig.rowHeight;
	let textHeight = viewerConfig.textHeight;
	let lineSpace = viewerConfig.lineSpace;

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

	function getText(term) {
		return term.textOverride != null ? term.textOverride : term.value.toString();
	}

	let width0 = ctx.measureText(getText(mountain[0][0])).width;
	let width1 = ctx.measureText(getText(mountain[0].at(-1))).width;

	let maxWidth = ctx.measureText("-1").width;
	let maxHeight = 0;
	mountain.forEach(row => {
		row.forEach(term => {
			let measure = ctx.measureText(getText(term));
			maxWidth = Math.max(maxWidth, measure.width);
			maxHeight = Math.max(maxHeight, measure.actualBoundingBoxAscent);
		});
	});
	rowWidth += maxWidth;
	rowHeight += maxHeight + lineSpace*2;

	canvas.setAttribute("width", (mountain[0].length - 1)*rowWidth + width0/2 + width1/2 + PADDING*2);
	canvas.setAttribute("height", (mountain.length - 1)*rowHeight + maxHeight + PADDING*2);
	clear();

	function getPosition(i, j) {
		return [(mountain[i][j].position)*rowWidth + width0/2 + PADDING, (mountain.length-i-1)*rowHeight + maxHeight + PADDING];
	}

	if (!viewerConfig.hideVertical) {
		for (let i = 1; i < mountain.length; i++) {
			mountain[i].forEach((_, j) => {
				let [x, y] = getPosition(i, j);
				drawLine(x, y + lineSpace, x, y + rowHeight - maxHeight - lineSpace);
			});
		}
	}
	mountain.forEach((row, i) => {
		row.forEach((term, j) => {
			let parentIndex = term.parentOverride != null ? term.parentOverride : term.parentIndex;
			if (parentIndex != -1) {
				let [x, y] = getPosition(i, j);
				let upperMeasure = ctx.measureText(getText(mountain[i+1].find(v => v.position == term.position)));
				let parentMeasure = ctx.measureText(getText(row[parentIndex]));
				let y0 = y - rowHeight - upperMeasure.actualBoundingBoxAscent / 2, y1 = y - parentMeasure.actualBoundingBoxAscent / 2;
				let x0 = x, x1 = x - (j - parentIndex) * rowWidth;
				let dy = (y1 - y0), dx = (x1 - x0);
				let magnitude = Math.sqrt(dy*dy + dx*dx);
				let uy = dy/magnitude, ux = dx/magnitude;
				let space0 = lineSpace + upperMeasure.width / 2;
				let space1 = lineSpace + parentMeasure.width / 2;
				drawLine(x0 + ux*space0, y0 + uy*space0, x1 - ux*space1, y1 - uy*space1);
			}
		});
	});
	mountain.forEach((row, i) => {
		row.forEach((term, j) => {
			let text = getText(term);
			let [x, y] = getPosition(i, j);
			let measure = ctx.measureText(text);
			ctx.strokeStyle = "#222";
			ctx.fillStyle = term.colorOverride != null ? term.colorOverride : "white";
			ctx.lineWidth = 3;
			ctx.strokeText(text, x - measure.width / 2, y);
			ctx.fillText(text, x - measure.width / 2, y);
		});
	});
}

function sequenceToRow(sequence) {
	let row = sequence.map((v, i) => {
		return {value: v, position: i, parentIndex: sequence.findLastIndex((x, j) => x < v && j < i)};
	});
	row.forEach((term, i) => {
		let numAncestors = 0;
		let current = i;
		while (true) {
			current = row[current].parentIndex;
			if (current == -1) break;
			numAncestors++;
		}
		term.numAncestors = numAncestors;
		if (term.parentIndex == -1) {
			term.rootIndex = -1;
		} else {
			let root = i;
			let diff = term.value - row[term.parentIndex].value;
			for (let j = 0; j < diff; j++) {
				root = row[root].parentIndex;
				if (row[root].value == 0) break;
			}
			term.rootIndex = root;
		}
	});
	return row;
}
	
let canvas = document.getElementById("canvas");
let canvas2 = document.getElementById("canvas2");

let textInput = document.getElementById("sequenceInput");
let rowWidthInput = document.getElementById("rowWidth");
let rowHeightInput = document.getElementById("rowHeight");
let textHeightInput = document.getElementById("textHeight");
let lineSpacingInput = document.getElementById("lineSpacing");
let expandInput = document.getElementById("expandInput");

function viewerInitialize(config) {
	if (config != null) {
		for (let key in config) {
			viewerConfig[key] = config[key];
		}
	}

	expandInput.addEventListener("keyup", ({key}) => {
		if (key == "Enter") {
			viewerConfig.onViewerExpand();
		}
	});
}

function viewerUpdateConfig() {
	viewerConfig.rowWidth = parseInt(rowWidthInput.value);
	viewerConfig.rowHeight = parseInt(rowHeightInput.value);
	viewerConfig.textHeight = parseInt(textHeightInput.value);
	viewerConfig.lineSpace = parseInt(lineSpacingInput.value);
	rowWidthInput.previousElementSibling.innerText = `Row Width: ${viewerConfig.rowWidth}`;
	rowHeightInput.previousElementSibling.innerText = `Row Height: ${viewerConfig.rowHeight}`;
	textHeightInput.previousElementSibling.innerText = `Text Height: ${viewerConfig.textHeight}`;
	lineSpacingInput.previousElementSibling.innerText = `Line Spacing: ${viewerConfig.lineSpace}`;
}