function arrayFromString(s) {
	return s.slice(1, -1).split(")(").map(x => x.split(",").filter(Boolean).map(Number));
}

function arrayToString(m) {
	return "(" + m.map(x => x.join()).join(")(") + ")";
}

function blockListToMatrix(a) {
	return a.map((v, i) => {
		let length = Math.max(0, ...a[i]);
		return [...Array(length + 1)].map((_, n) => v.includes(n) ? null : length - n).filter(n => n != null);
	});
}

function matrixToBlockList(m, shortRows) {
	return m.map((v, i) => {
		if (v.length == 0) return i == 0 ? [0] : [0, 1];
		let length = shortRows ? Math.max(0, ...v) + 1 : i
		return [...Array(length + 1)].map((_, n) => v.includes(length - n) ? null : n).filter(n => n != null);
	});
}

function isBlockList(a) {
	return a.length > 0 && a[0].length > 0;
}

function shortNumber(n) {
	return n < 10 ? n : n-10 < 26 ? String.fromCharCode(65 + n - 10) : '?';
}

function drawArray(a, showNumbers, shortRows) {
	let rows = [];
	let blockList = isBlockList(a) ? a : matrixToBlockList(a, shortRows);
	for (let i = 0; i < blockList.length; i++) {
		let size = Math.max(0, ...blockList[i]) + 1;
		rows.push(size == 0 ? "" : [...Array(size)].map((_, n) => {
			if (blockList[i].includes(n)) return "█";
			if (!showNumbers) return " ";
			return shortNumber(size - n - 1);
		}).join(""));
	}
	return rows.join("\n");
}