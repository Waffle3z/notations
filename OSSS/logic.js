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

function blockListToGrid(blockList) {
	return blockList.map(row => {
		const length = Math.max(0, ...row);
		return [...Array(length + 1)].map((_, n) => row.includes(n) ? 0 : length - n);
	});
}

function getShadedRegion(blockList, shortRows) {
	const matrix = blockListToMatrix(blockList);
	const grid = blockListToGrid(blockList);
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

function arrayCompare(a, b) { // -1 if a < b, 0 if a == b, 1 if a > b
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		if (a[i] != b[i]) return (a[i] || 0) < (b[i] || 0) ? -1 : 1;
	}
	return a.length < b.length ? -1 : a.length == b.length ? 0 : 1
}

function toPointerMatrix(a) {
	let pointerMatrix = [];
	for (let i = 0; i < a.length; i++) {
		pointerMatrix[i] = [];
		for (let j = 0; j < a[i].length; j++) {
			pointerMatrix[i][j] = {distance: 0, delta: 0}
		}
		let parentIndex = a.findLastIndex((v, j) => j < i && v[0] < a[i][0]);
		if (parentIndex != -1) {
			pointerMatrix[i][0] = {distance: i - parentIndex, delta: a[i][0] - a[parentIndex][0]}
		}
	}
	for (let i = 0; i < a.length; i++) {
		if (pointerMatrix[i][0].delta == 0) continue;
		for (let j = 1; j < a[i].length; j++) {
			let parentIndex = i;
			while (true) {
				if ((a[parentIndex][j] || 0) < a[i][j]) {
					break;
				} else {
					parentIndex -= pointerMatrix[parentIndex][j-1].distance;
				}
			}
			pointerMatrix[i][j].distance = i - parentIndex;
			pointerMatrix[i][j].delta = a[i][j] - (a[parentIndex][j] || 0);
		}
	}
	return pointerMatrix;
}

function toMatrix(pm) {
	let matrix = [];
	for (let i = 0; i < pm.length; i++) {
		matrix[i] = [];
		for (let j = 0; j < pm[i].length; j++) {
			matrix[i][j] = pm.delta == 0 ? 0 : (matrix[i-pm[i][j].distance][j] || 0) + pm[i][j].delta;
		}
	}
	return matrix;
}

function deepcopy(pm) {
	return pm.map(v => {
		let a = v.map(x => {
			return {distance: x.distance, delta: x.delta};
		});
		if (v.ascending) a.ascending = v.ascending;
		return a;
	});
}

function isSuccessor(matrix) { // zero or successor
	return matrix.length == 0 || matrix.at(-1).length == 0;
}

function expand(blockList, shortRows, n) {
	if (blockList.length == 0) return blockList;
	const matrix = blockListToMatrix(blockList);
	blockList = matrixToBlockList(matrix, true);
	const [rootIndex, rootColumn] = getShadedRegion(blockList, true)[1];
	if (matrix.at(-1).length == 0) {
		blockList.pop();
		return blockList;
	}
	if (n == 0) return matrixToBlockList(matrix.slice(0, rootIndex), shortRows);
	let grid = blockListToGrid(blockList);
	const cutNodeIndex = grid.at(-1).findLastIndex(v => v > 0);
	const badPartHeight = grid.length - rootIndex;
	const badPartWidth = cutNodeIndex - rootColumn;
	let rootRowColumns = 0;
	for (let c = 0; c < grid[rootIndex].length; c++) {
		if (grid[rootIndex][c] != 0) rootRowColumns++;
	}
	const ancestorRows = [grid.length - 1];
	while (true) {
		const a = ancestorRows.at(-1);
		const i = matrix.findLastIndex((v, i) => v[0] < matrix[a][0] && i < a);
		if (i < 0) break;
		ancestorRows.push(i);
	}
	const noAscend = []; // only rows with more columns than the root row ascend
	for (let r = rootIndex; r < rootIndex + badPartHeight; r++) {
		if (ancestorRows.includes(r)) continue; // direct ancestors still should ascend
		let columns = 0;
		for (let c = 0; c < grid[r].length; c++) {
			if (grid[r][c] != 0) columns++;
		}
		if (columns <= rootRowColumns) noAscend.push(r);
	}
	for (let c = rootColumn; c < grid[rootIndex].length; c++) { // copy root ending to cut row
		grid.at(-1)[cutNodeIndex + c - rootColumn] = grid[rootIndex][c];
	}
	const unascendRows = []; // rows to remove extra columns that shouldn't have ascended
	for (let i = 1; i < n; i++) {
		const y = grid.length - 1;
		const x = cutNodeIndex + badPartWidth * (i - 1);
		for (let r = rootIndex; r < rootIndex + badPartHeight; r++) {
			let r2 = y + (r - rootIndex);
			if (r2 == grid.length) {
				grid.push([]);
				for (let c = 0; c < rootColumn + x; c++) {
					grid[r2][c] = grid[r2-1][c] != 0 ? grid[r2-1][c] + 1 : 0;
				}
				if (noAscend.includes(r)) unascendRows.push(r2);
			}
			for (let c = rootColumn; c < grid[r].length; c++) {
				grid[r2][x + c - rootColumn] = grid[r][c];
			}
		}
	}
	for (let r of unascendRows) {
		let nonzeros = [];
		for (let c = 0; c < grid[r].length; c++) {
			if (grid[r][c] != 0) nonzeros.push(c);
		}
		while (nonzeros.length > rootRowColumns) {
			const c = nonzeros.pop(); // only first rootRowColumn columns ascend
			grid[r][c] = 0;
		}
	}
	grid.pop(); // remove last copy of the cut node in case it's a successor
	let newBlockList = [];
	for (let i = 0; i < grid.length; i++) {
		let row = [];
		for (let j = 0; j < grid[i].length; j++) {
			if (grid[i][j] == 0) row.push(j);
		}
		newBlockList.push(row);
	}
	return matrixToBlockList(blockListToMatrix(newBlockList, true), shortRows);
}