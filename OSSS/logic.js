function arrayFromString(s) {
	return s.slice(1, -1).split(")(").map(x => x.split(",").filter(Boolean).map(Number));
}

function arrayToString(m) {
	return "(" + m.map(x => x.join()).join(")(") + ")";
}

function blockListToMatrix(a) {
	return a.map((v, i) => [...Array(i)].map((_, n) => v.includes(n) ? null : i - n).filter(n => n));
}

function matrixToBlockList(m) {
	return m.map((v, i) => [...Array(i + 1)].map((_, n) => v.includes(i - n) ? null : n).filter(n => n != null));
}

function isBlockList(a) {
	return a.length > 0 && a[0].length > 0;
}

function matrixFromString(s) {
	let a = arrayFromString(s);
	return isBlockList(a) ? blockListToMatrix(a) : a;
}

function blockListFromString(s) {
	let a = arrayFromString(s);
	return isBlockList(a) ? a : matrixToBlockList(a);
}

function drawArray(a, showNumbers = true) {
	let rows = [];
	let blockList = isBlockList(a) ? a : matrixToBlockList(a);
	for (let i = 0; i < blockList.length; i++) {
		rows.push([...Array(i+1)].map((_, n) => {
			if (blockList[i].includes(n)) return "█";
			if (!showNumbers) return " ";
			let number = i - n;
			return number < 10 ? number : number-10 < 26 ? String.fromCharCode(65 + number - 10) : '?';
		}).join(""));
	}
	return rows.join("\n");
}