function arrayFromString(s) {
	return s.slice(1, -1).split(")(").map(x => x.split(",").filter(Boolean).map(Number));
}

function arrayToString(m) {
	return "(" + m.map(x => x.join()).join(")(") + ")";
}

function blockListToMatrix(a) {
	return a.map((v, i) => {
		const length = Math.max(0, ...v);
		return [...Array(length + 1)].map((_, n) => v.includes(n) ? null : length - n).filter(n => n != null);
	});
}

function matrixToBlockList(m, shortRows) {
	return m.map((v, i) => {
		if (v.length == 0 && i == 0) return [0];
		const length = shortRows ? Math.max(0, ...v) + 1 : i;
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
	const rows = [];
	const blockList = isBlockList(a) ? a : matrixToBlockList(a, shortRows);
	for (let i = 0; i < blockList.length; i++) {
		const size = Math.max(0, ...blockList[i]) + 1;
		rows.push(size == 0 ? "" : [...Array(size)].map((_, n) => {
			if (blockList[i].includes(n)) return "█";
			if (!showNumbers) return " ";
			return shortNumber(size - n - 1);
		}).join(""));
	}
	return rows.join("\n");
}

function getShadedRegion(blockList, shortRows) {
	const matrix = blockListToMatrix(blockList);
	const grid = blockList.map(row => {
		const length = Math.max(0, ...row);
		return [...Array(length + 1)].map((_, n) => row.includes(n) ? 0 : length - n);
	});
	const seen = grid.map(row => row.map(_ => false));
	const y = grid.length - 1;
	const x = grid[y].findLastIndex(x => x > 0);
	if (x == -1) return [seen, []];
	const v = grid[y][x];
	const queue = [[y, x]];
	const ancestorRows = [y];
	while (true) {
		const a = ancestorRows.at(-1);
		const i = matrix.findLastIndex((v, i) => v[0] < matrix[a][0] && i < a);
		if (i < 0) break;
		ancestorRows.push(i);
	}
	const getPreviousRow = (r) => {
		let i = ancestorRows.indexOf(r);
		if (i == ancestorRows.length - 1) return null;
		return ancestorRows[i + 1];
	}
	while (queue.length > 0) {
		const [r, c] = queue.pop();
		if (seen[r][c]) continue;
		seen[r][c] = true;
		const r2 = getPreviousRow(r);
		if (r2) {
			const dc = shortRows ? 0 : r2 - r + 1;
			for (let c2 = c - 1 + dc; c2 <= c + 1 + dc; c2++) {
				if (grid[r2][c2] >= v) queue.push([r2, c2]);
			}
		}
		for (let c2 = c-1; c2 <= c+1; c2 += 2) {
			if (grid[r][c2] >= v) queue.push([r, c2]);
		}
	}
	const r = seen.findIndex(r => r.includes(true));
	const c = seen[r].indexOf(true);
	const ancestor = matrix.findLastIndex((v, i) => (!v[0] || v[0] < matrix[r][0]) && i < r);
	const root = [ancestor, shortRows ? c - 1 : c - (r - ancestor)];
	return [seen, root];
}