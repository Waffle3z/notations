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

function getMatrixAncestorRows(matrix) {
	const ancestorRows = [matrix.length - 1];
	while (true) {
		const a = ancestorRows.at(-1);
		const row = matrix[a];
		const i = matrix.findLastIndex((parent, i) => {
			if (i >= a) return false;
			for (let j = 0; j < row.length; j++) {
				if (parent[j] >= row[j]) return false;
			}
			return true;
		});
		if (i < 0) break;
		ancestorRows.push(i);
	}
	return ancestorRows;
}

function getShadedRegion(blockList, shortRows) {
	const matrix = blockListToMatrix(blockList);
	blockList = matrixToBlockList(matrix, false); // root finding is without short rows
	const grid = blockListToGrid(blockList);
	const seen = grid.map(row => row.map(_ => false));
	const y = grid.length - 1;
	const x = grid[y].findLastIndex(x => x > 0);
	if (x == -1) return [seen, []];
	const v = grid[y][x];
	const queue = [[y, x]];
	const ancestorRows = getMatrixAncestorRows(matrix);
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
			const c2 = c+r2 - r + 1; // corresponding column in the parent row
			if (grid[r2][c2-1] >= v) queue.push([r2, c2-1]); // diagonal search
			if (grid[r2][c2] >= v) queue.push([r2, c2]); // vertical search
			if (grid[r2][c2] > 0 && grid[r2][c2+1] > 0) queue.push([r2, c2]); // vertical search >=()()(1)(2,1)(3,2)(4,3)
		}
		if (grid[r][c-1] >= v) queue.push([r, c-1]); // horizontal search
	}
	const r = seen.findIndex(r => r.includes(true));
	const c = seen[r].indexOf(true);
	const ancestor = ancestorRows.find(i => i < r);
	const root = [ancestor, c - (r - ancestor)];
	if (shortRows) {
		for (let r = 0; r < grid.length; r++) {
			seen[r] = seen[r].slice(grid[r].length - 2 - matrix[r].find(x => x > 0));
		}
		if (matrix[root[0]].find(x => x > 0)) root[1] -= grid[root[0]].length - 2 - matrix[root[0]].find(x => x > 0);
	}
	return [seen, root];
}

function isSuccessor(matrix) { // zero or successor
	return matrix.length == 0 || matrix.at(-1).length == 0;
}

function expand(blockList, shortRows, n) {
	if (blockList.length == 0) return blockList;
	const matrix = blockListToMatrix(blockList);
	blockList = matrixToBlockList(matrix, true); // expand using short rows
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
	const firstColumnAncestors = [matrix.length - 1];
	while (true) {
		const a = firstColumnAncestors.at(-1);
		const i = matrix.findLastIndex((v, i) => v[0] < matrix[a][0] && i < a);
		if (i < 0) break;
		firstColumnAncestors.push(i);
	}
	const noAscend = []; // only rows with more columns than the root row ascend
	for (let r = rootIndex; r < rootIndex + badPartHeight; r++) {
		if (firstColumnAncestors.includes(r)) continue; // direct/indirect ancestors still should ascend
		let columns = 0;
		for (let c = 0; c < grid[r].length; c++) {
			if (grid[r][c] != 0) columns++;
		}
		if (columns <= rootRowColumns) noAscend.push(r);
	}
	for (let c = rootColumn; c < grid[rootIndex].length; c++) { // copy root ending to cut row
		grid.at(-1)[cutNodeIndex + c - rootColumn] = grid[rootIndex][c];
	}
	const rightPadding = (grid.at(-1).length - cutNodeIndex) - (grid[rootIndex].length - rootColumn);
	const unascendRows = []; // rows to remove extra columns that shouldn't have ascended
	for (let i = 1; i < n; i++) {
		const y = grid.length - 1;
		const x = cutNodeIndex + badPartWidth * (i - 1); // column where the next copy starts
		for (let dy = 0; dy < badPartHeight; dy++) {
			const r = rootIndex + dy; // row to copy from
			const r2 = y + dy; // row to copy to
			if (r2 == grid.length) {
				grid.push([]);
				for (let c = 0; c < x; c++) { // fill in the left side of the copy based on the previous row
					grid[r2][c] = grid[r2-1][c] != 0 ? grid[r2-1][c] + 1 : 0;
				}
				if (noAscend.includes(r)) unascendRows.push([r2, r]);
			}
			for (let c = rootColumn; c < grid[r].length; c++) { // columns to copy from
				const dx = c - rootColumn;
				const c2 = x + dx; // column to copy to
				grid[r2][c2] = grid[r][c]; // fill in the copy
			}
			for (let c = 0; c < rightPadding * i; c++) { // fill row ends to the correct block length
				if (x + grid[r].length + c >= grid[r2].length) grid[r2].push(0);
			}
		}
	}
	for (let [r, originalRow] of unascendRows) {
		const nonzeros = [];
		let originalNonzeros = 0;
		for (let c = 0; c < grid[originalRow].length; c++) {
			if (grid[originalRow][c] != 0) originalNonzeros++;
		}
		for (let c = 0; c < grid[r].length; c++) {
			if (grid[r][c] != 0) nonzeros.push(c);
		}
		while (nonzeros.length > originalNonzeros) {
			const c = nonzeros.pop(); // only first rootRowColumn columns ascend
			grid[r][c] = 0;
		}
	}
	grid.pop(); // remove last copy of the cut node in case it's a successor
	const newBlockList = [];
	for (let i = 0; i < grid.length; i++) {
		const row = [];
		for (let j = 0; j < grid[i].length; j++) {
			if (grid[i][j] == 0) row.push(j);
		}
		newBlockList.push(row);
	}
	return matrixToBlockList(blockListToMatrix(newBlockList, true), shortRows);
}