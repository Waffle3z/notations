// Based on the original program from https://github.com/Naruyoko/YNySequence/blob/master/script.js

function calcMountain(row) {
	const mountain = [row]; // rows
	while (true) {
		let hasNextRow = false;
		for (let i = 0; i < row.length; i++) {
			if (row[i].forcedParent && row[i].parentIndex != -1) {
				hasNextRow = true;
				continue;
			}
			let p = row[i].position + 1;
			if (mountain.length > 1) {
				p = mountain.at(-2).findIndex(x => x.position >= row[i].position);
			}
			while (p >= 0) {
				let j = 0;
				if (mountain.length == 1) {
					p--;
					j = p - 1;
				} else {
					p = mountain.at(-2)[p].parentIndex;
					if (p < 0) break;
					j = row.findIndex(x => x.position >= mountain.at(-2)[p].position);
				}
				if (j < 0 || (j < row.length-1 && row[j].position + 1 != row[j+1].position)) break;
				if (row[j].value < row[i].value) {
					row[i].parentIndex = j;
					hasNextRow = true;
					break;
				}
			}
		}
		if (!hasNextRow) break;
		const newRow = [];
		mountain.push(newRow);
		for (let i = 0; i < row.length; i++) {
			if (row[i].parentIndex != -1) {
				newRow.push({
					value: row[i].value - row[row[i].parentIndex].value,
					position: row[i].position,
					parentIndex: -1
				});
			}
		}
		row = newRow;
	}
	return mountain;
}

function calcDiagonal(mountain) {
	const diagonal = [];
	const diagonalTree = [];
	for (let i = 0; i < mountain[0].length; i++) { // only one diagonal exists for each left-side-up diagonal line
		for (let j = mountain.length-1; j >= 0; j--) { // prioritize the top
			const k = mountain[j].findIndex(x => x.position >= i);
			if (k == -1 || mountain[j][k].position != i) continue;
			let height = j;
			let last = mountain[j][k];
			while (true) {
				const row = mountain[height];
				const parentRow = mountain[height-1];
				if (height == 0) {
					last = row[last.parentIndex];
				} else {
					const l = parentRow[parentRow.find(x => x.position == last.position).parentIndex]; // find right-down, go to its parent=left-down
					const m = row.find(x => x.position >= l.position); // find up-left of that=left
					if (m.position == l.position) { // left exists
						last = m;
					} else {
						height--;
						last = l;
					}
				}
				if (!last || last.parentIndex == -1) {
					diagonal.push(mountain[j][k].value);
					diagonalTree.push(last ? last.position : height - 1);
					break;
				}
			}
			break;	
		}
	}
	return diagonal.map((v, i) => {
		const pw = diagonal.findLastIndex((x, j) => j < i && x < v);
		let p = diagonalTree[i];
		while (p > 0 && diagonal[p] >= diagonal[i]) p = diagonalTree[p];
		return {
		  value: v,
		  position: i,
		  parentIndex: p == pw ? -1 : p,
		  forcedParent: p != pw
		};
	});
}

function cloneMountain(mountain) {
	return mountain.map(layer => layer.map(e => ({...e})));
}

function getBadRoot(mountain) {
	const diagonal = calcMountain(calcDiagonal(mountain));
	if (diagonal[0].at(-1).value != 1) return getBadRoot(diagonal);
	const i = mountain.findLastIndex((v, i) => v.at(-1).position == mountain[0].length-1);
	return mountain[i-1][mountain[i-1].at(-1).parentIndex].position;
}

function mountainFromArray(a) {
	return calcMountain(a.map((v, i) => ({
		value: Number(v),
		position: i,
		parentIndex: -1
	})));
}

function mountainToArray(mountain) {
	return mountain.length == 0 ? [] : mountain[0].map(element => element.value);
}

function expand(mountain, n) {
	const result = cloneMountain(mountain);
	if (mountain[0].at(-1).parentIndex == -1) {
		result[0].pop();
		return result;
	}

	let cutHeight = mountain.findLastIndex((v, i) => v.at(-1).position == mountain[0].length - 1);
	for (let i = 0; i <= cutHeight; i++) result[i].pop(); // cut child
	if (!result.at(-1).length) result.pop();
	const cutLength = result[0].length;

	const badRootSeam = getBadRoot(mountain);
	let badRootHeight = cutHeight - 1;
	const diagonal = calcDiagonal(mountain);
	let newDiagonal;

	const yamakazi = diagonal.at(-1).value == 1; // Yamakazi-Funka dualilty
	if (yamakazi) { // copy bad part n times
		newDiagonal = diagonal.slice(0, -1);
		const badPart = newDiagonal.slice(badRootSeam);
		for (let i = 0; i < n; i++) newDiagonal.push(...badPart);
		cutHeight--;
	} else {
		newDiagonal = expand(calcMountain(diagonal), n)[0];
		badRootHeight = mountain.findLastIndex((v, i) => {
			const x = v.find(x => x.position >= badRootSeam);
			return x && x.position == badRootSeam;
		});
	}
	const tailHeight = cutHeight - badRootHeight;
	const tailLength = cutLength - badRootSeam;

	// Create Mt.Fuji shell
	for (let i = 1; i <= n; i++) { // iteration
		for (let j = badRootSeam; j < cutLength; j++) { // seam
			let p = mountain[badRootHeight].find(x => x.position == j);
			while (p && p.position > badRootSeam) {
				p = mountain[badRootHeight][p.parentIndex];
			}
			const isAscending = p && p.position == badRootSeam;

			const seamHeight = 1 + result.findLastIndex((v, i) => {
				const x = v.find(x => x.position >= j);
				return x && x.position == j;
			});
			const isReplacingCut = j == badRootSeam;
			const klimit = isAscending ? seamHeight + tailHeight * i : seamHeight;
			for (let k = klimit - 1; k >= 0; k--) {
				if (!result[k]) result[k] = [];
				let sy = k; // Bb
				let sx = 0;

				if (isAscending && k >= badRootHeight) {
					if (k <= badRootHeight + tailHeight*(i-isReplacingCut)) { // Br replace
						sy = badRootHeight;
					} else if (isReplacingCut && k <= badRootHeight + tailHeight * i) { // Br extend
						sy = k - tailHeight * (i-1);
					} else { // Be
						sy = k - tailHeight * i;
					}
					if (!yamakazi && isReplacingCut) {
						sx = mountain[sy].length - 1;
					} else {
						sx = mountain[sy].findIndex(x => x.position >= j);
					}
				} else {
					if (isReplacingCut) {
						sx = mountain[sy].length - 1;
					} else {
						sx = mountain[sy].findIndex(x => x.position >= j);
					}
				}
				const sourceParent = mountain[sy][mountain[sy][sx].parentIndex];
				const parentShifts = i - isReplacingCut;
				let parentPosition = sourceParent ? sourceParent.position : -1;
				if (parentPosition >= badRootSeam) parentPosition += parentShifts * tailLength;
				const parentIndex = result[k].findIndex(x => x.position == parentPosition);
				let value;
				if (parentIndex == -1) {
					value = newDiagonal[j + tailLength * i].value;
				} else {
					const leftUp = result[k+1].find(x => x.position >= j + tailLength * i);
					value = result[k][parentIndex].value + leftUp.value;
				}
				result[k].push({
					value: value,
					position: j + tailLength * i,
					parentIndex: parentIndex,
				});
			}
		}
	}

	return result;
}