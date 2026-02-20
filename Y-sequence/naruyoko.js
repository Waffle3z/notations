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
			let p = 0;
			if (mountain.length == 1) {
				p = row[i].position + 1;
			} else {
				p = mountain.at(-2).findIndex(x => x.position > row[i].position);
			}
			while (p >= 0) {
				let j = 0;
				if (mountain.length == 1) {
					p--;
					j = p - 1;
				} else {
					p = mountain.at(-2)[p].parentIndex;
					if (p < 0) break;
					j = row.findIndex(x => x.position >= mountain.at(-2)[p].position - 1);
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
					position: row[i].position - 1,
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
			let k = mountain[j].findIndex(x => x.position + j >= i);
			if (k == -1 || mountain[j][k].position + j != i) continue;
			let height = j;
			let lastIndex = k;
			let last = mountain[height][lastIndex];
			while (true) {
				if (height == 0) {
					lastIndex = last.parentIndex;
				} else {
					let l = mountain[height-1].findIndex(x => x.position == last.position + 1); // find right-down
					l = mountain[height-1][l].parentIndex; // go to its parent=left-down
					let m = mountain[height].findIndex(x => x.position >= mountain[height-1][l].position - 1); // find up-left of that=left
					if (mountain[height][m].position == mountain[height-1][l].position - 1) { // left exists
						lastIndex = m;
					} else {
						height--;
						lastIndex = l;
					}
				}
				last = mountain[height][lastIndex];
				if (!last || last.parentIndex == -1) {
					diagonal.push(mountain[j][k].value);
					diagonalTree.push((last ? last.position : -1) + height);
					break;
				}
			}
			break;	
		}
	}
	return diagonal.map((v, i) => {
		let pw = diagonal.findLastIndex((x, j) => j < i && x < v);
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
	const i = mountain.findLastIndex((v, i) => v.at(-1).position + i == mountain[0].length-1);
	return mountain[i-1][mountain[i-1].at(-1).parentIndex].position + i-1;
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
	} else {
		let cutHeight = mountain.findLastIndex((v, i) => v.at(-1).position + i == mountain[0].length - 1);
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
				const x = v.find(x => x.position + i >= badRootSeam);
				return x && x.position + i == badRootSeam;
			});
		}
		const tailLength = cutHeight - badRootHeight;

		// Create Mt.Fuji shell
		for (let i = 1; i <= n; i++) { // iteration
			for (let j = badRootSeam; j < cutLength; j++) { // seam
				let isAscending = false;
				let p = mountain[badRootHeight].find(x => x.position + badRootHeight >= j);
				if (p.position + badRootHeight == j) {
					while (p && p.position + badRootHeight > badRootSeam) {
						p = mountain[badRootHeight][p.parentIndex];
					}
					isAscending = p && p.position + badRootHeight == badRootSeam;
				}

				const seamHeight = 1 + result.findLastIndex((v, i) => {
					const x = v.find(x => x.position + i >= j);
					return x && x.position + i == j;
				});
				const isReplacingCut = j == badRootSeam;
				const klimit = isAscending ? seamHeight + tailLength * i : seamHeight;
				for (let k = 0; k < klimit; k++) {
					if (!result[k]) result.push([]);
					let sy = k; // Bb
					let sx = 0;
					if (isAscending && k >= badRootHeight) {
						if (k <= badRootHeight + tailLength*(i-isReplacingCut)) { // Br replace
							sy = badRootHeight;
						} else if (isReplacingCut && k <= badRootHeight + tailLength * i) { // Br extend
							sy = k - tailLength * (i-1);
						} else { // Be
							sy = k - tailLength * i;
						}
						if (!yamakazi && isReplacingCut) {
							sx = mountain[sy].length - 1;
						} else {
							sx = mountain[sy].findIndex(x => x.position + sy >= j);
						}
					} else {
						if (isReplacingCut) {
							sx = mountain[sy].length - 1;
						} else {
							sx = mountain[sy].findIndex(x => x.position + sy >= j);
						}
					}
					const sourceParent = mountain[sy][mountain[sy][sx].parentIndex];
					const parentShifts = i - isReplacingCut;
					let parentPosition = -1;
					if (sourceParent) {
						const pos = sourceParent.position + sy;
						if (pos >= badRootSeam) {
							parentPosition = pos + parentShifts*(cutLength-badRootSeam) - k;
						} else {
							parentPosition = pos - k;
						}
					}
					const parentIndex = result[k].findIndex(x => x.position == parentPosition);
					result[k].push({
						value: parentIndex == -1 ? newDiagonal[j+(cutLength-badRootSeam)*i].value : NaN,
						position: j + (cutLength-badRootSeam)*i - k,
						parentIndex: parentIndex,
					});
				}
			}
		}
	}

	// Build number from ltr, ttb
	for (let i = result.length-1; i >= 0; i--) {
		if (!result[i].length) {
			result.pop();
			continue;
		}
		for (let j = 0; j < result[i].length; j++) {
			if (!isNaN(result[i][j].value)) continue;
			const k = result[i+1].findIndex(x => x.position >= result[i][j].position - 1); // find left-up
			result[i][j].value = result[i][result[i][j].parentIndex].value + result[i+1][k].value;
		}
	}
	return result;
}