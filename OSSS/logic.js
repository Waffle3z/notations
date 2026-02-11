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
			if (grid[r2][c2] > 0 && grid[r][c2+1] && grid[r2][c2+1] > 0) queue.push([r2, c2]); // vertical search >=()()(1)(2,1)(3,2)(4,3)
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

function matrixToPointerMatrix(a) {
	const pointerMatrix = [];
	for (let i = 0; i < a.length; i++) {
		pointerMatrix[i] = [];
		for (let j = 0; j < a[i].length; j++) {
			pointerMatrix[i][j] = {distance: 0, delta: 0}
		}
		let parentIndex = a.findLastIndex((v, j) => j < i && (v[0] || 0) < a[i][0]);
		if (parentIndex != -1) {
			pointerMatrix[i][0] = {distance: i - parentIndex, delta: a[i][0] - (a[parentIndex][0] || 0)}
		}
	}
	for (let i = 0; i < a.length; i++) {
		if (pointerMatrix[i].length == 0 || pointerMatrix[i][0].delta == 0) continue;
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

function pointerMatrixToMatrix(pm) {
	const matrix = [];
	for (let i = 0; i < pm.length; i++) {
		matrix[i] = [];
		for (let j = 0; j < pm[i].length; j++) {
			matrix[i][j] = pm[i][j].delta == 0 ? 0 : (matrix[i-pm[i][j].distance][j] || 0) + pm[i][j].delta;
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

	const pm = matrixToPointerMatrix(matrix);
	const out = deepcopy(pm);
	let tail = out.slice(rootIndex + 1);
	
	let cutNode = tail.at(-1);
	const rootNode = out[rootIndex];
	const lastColumnIndex = cutNode.length - 1;
	const lastColumnDistance = cutNode[lastColumnIndex].distance;
	const parentNode = out[out.length - 1 - lastColumnDistance];
	if (cutNode.length > parentNode.length) {
		cutNode.pop();
		if (rootNode != parentNode && rootNode.length > 0) cutNode.push(rootNode.at(-1));
	} else {
		for (let i = lastColumnIndex; i < parentNode.length; i++) {
			const v = {distance: parentNode[i].distance + lastColumnDistance, delta: parentNode[i].delta};
			if (i < cutNode.length) {
				cutNode[i] = v
			} else {
				cutNode.push(v);
			}
		}
	}
	if (rootNode != parentNode) {
		rootNode.ascending = true;
		cutNode.ascending = true;
		// descendants of an ascended term with more matrix columns than the root also ascend
		for (let i = rootIndex + 1; i < out.length; i++) {
			const parentIndex = i - out[i].at(-1).distance;
			const canAscend = out[i].length > rootNode.length;
			if (canAscend && out[parentIndex] && out[parentIndex].ascending) out[i].ascending = true;
		}
		const grid = blockListToGrid(blockList);
		const cutNodeIndex = grid.at(-1).findLastIndex(v => v > 0);
		const badPartHeight = grid.length - rootIndex;
		const badPartWidth = cutNodeIndex - rootColumn;
		let rootRowColumns = 0;
		for (let c = 0; c < grid[rootIndex].length; c++) {
			if (grid[rootIndex][c] != 0) rootRowColumns++;
		}
		const ancestorRows = getMatrixAncestorRows(matrix);
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
				const desiredLength = x + (grid[r].length - rootColumn) + rightPadding * i;
				for (let c = grid[r2].length; c < desiredLength; c++) {
					grid[r2].push(0); // fill row ends to the correct block length
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
	} else {
		tail = deepcopy(tail);
		cutNode = tail.at(-1);
		for (let i = 1; i < n; i++) {
			const copy = deepcopy(tail);
			for (let j = 0; j < copy.length; j++) {
				for (let v of copy[j]) { // shift distance in columns that point outside the tail
					if (v.distance > j+1) v.distance += lastColumnDistance;
				}
				out.push(copy[j]);
			}
			tail = copy;
		}
	}
	out.pop(); // remove last copy of the cut node in case it's a successor
	const newMatrix = pointerMatrixToMatrix(out);
	return matrixToBlockList(newMatrix, shortRows);
}