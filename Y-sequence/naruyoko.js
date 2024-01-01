// Based on the original program from https://github.com/Naruyoko/YNySequence/blob/master/script.js

function calcMountain(row) {
	let mountain = [row]; // rows
	while (true) {
		let hasNextRow = false;
		for (let i = 0; i < row.length; i++) {
			let p = 0;
			if (mountain.length == 1) {
				p = row[i].position + 1;
			} else {
				p = mountain[mountain.length-2].findIndex(x => x.position > row[i].position);
			}
			while (p >= 0) {
				let j = 0;
				if (mountain.length == 1) {
					p--;
					j = p - 1;
				} else {
					p = mountain[mountain.length-2][p].parentIndex;
					if (p < 0) break;
					j = row.findIndex(x => x.position >= mountain[mountain.length-2][p].position - 1);
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
		let newRow = [];
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
	let diagonal = [];
	for (let i = 0; i < mountain[0].length; i++){ // only one diagonal exists for each left-side-up diagonal line
		for (let j = mountain.length-1; j >= 0; j--){ // prioritize the top
			let k = mountain[j].findIndex(x => x.position + j >= i);
			if (k == -1 || mountain[j][k].position + j != i) continue;
			let height = j;
			let lastIndex = k;
			while (true) {
				if (height == 0) {
					lastIndex = mountain[height][lastIndex].parentIndex;
				} else {
					let l = mountain[height-1].findIndex(x => x.position == mountain[height][lastIndex].position + 1); // find right-down
					l = mountain[height-1][l].parentIndex; // go to its parent=left-down
					let m = mountain[height].findIndex(x => x.position >= mountain[height-1][l].position - 1); // find up-left of that=left
					if (mountain[height][m].position == mountain[height-1][l].position - 1) { // left exists
						lastIndex = m;
					} else {
						height--;
						lastIndex = l;
					}
				}
				if (!mountain[height][lastIndex] || mountain[height][lastIndex].parentIndex == -1) {
					diagonal.push(mountain[j][k].value);
					break;
				}
			}
			break;
		}
	}
	return diagonal;
}

function cloneMountain(mountain) {
	return mountain.map(layer => layer.map(element => {
		return {
			value: element.value,
			position: element.position,
			parentIndex: element.parentIndex,
		};
	}));
}

function getBadRoot(mountain) {
	let diagonal = calcDiagonal(mountain);
	if (diagonal.at(-1) != 1) return getBadRoot(mountainFromArray(diagonal));
	for (let i = mountain.length - 1; i > 0; i--) {
		if (mountain[i].at(-1).position + i == mountain[0].length-1) {
			return mountain[i-1][mountain[i-1].at(-1).parentIndex].position + i - 1;
		}
	}
}

function mountainFromArray(a) {
	return calcMountain(a.map((v, i) => {
		return {
			value: Number(v),
			position: i,
			parentIndex: -1
		};
	}))
}

function mountainToArray(mountain) {
	if (!mountain[0]) return [];
	return mountain[0].map(element => element.value);
}

function expand(mountain, n) {
	let result = cloneMountain(mountain);
	if (mountain[0].at(-1).parentIndex == -1) {
		result[0].pop();
	} else {
		let cutHeight = mountain.findLastIndex((v, i) => v.at(-1).position + i == mountain[0].length - 1);
		let actualCutHeight = cutHeight;
		let badRootSeam = getBadRoot(mountain);
		let badRootHeight;
		let diagonal = calcDiagonal(mountain);
		let newDiagonal;

		let yamakazi = diagonal.at(-1) == 1; // Yamakazi-Funka dualilty
		if (yamakazi) { // copy bad part n times
			newDiagonal = diagonal.slice(0, -1);
			let badPart = newDiagonal.slice(badRootSeam);
			for (let i = 0; i < n; i++) newDiagonal = newDiagonal.concat(badPart);
			cutHeight--;
			badRootHeight = cutHeight;
		} else {
			newDiagonal = expand(mountainFromArray(diagonal), n);
			badRootHeight = mountain.findLastIndex((v, i) => {
				let x = v.find(x => x.position + i >= badRootSeam);
				return x && x.position + i == badRootSeam;
			});
		}
		for (let i = 0; i <= actualCutHeight; i++) result[i].pop(); // cut child
		if (!result.at(-1).length) result.pop();
		let afterCutLength = result[0].length;

		// Create Mt.Fuji shell
		for (let i = 1; i <= n; i++) { // iteration
			for (let j = badRootSeam; j < afterCutLength; j++) { // seam
				let isAscending = false;
				let p = mountain[badRootHeight].findIndex(x => x.position + badRootHeight >= j);
				if (mountain[badRootHeight][p].position + badRootHeight == j) {
					while (true) {
						if (!mountain[badRootHeight][p] || mountain[badRootHeight][p].position + badRootHeight < badRootSeam) {
							isAscending = false;
							break;
						}
						if (mountain[badRootHeight][p].position + badRootHeight == badRootSeam) {
							isAscending = true;
							break;
						}
						p = mountain[badRootHeight][p].parentIndex;
					}
				}

				let seamHeight = 1 + result.findLastIndex((v, i) => {
					let x = v.find(x => x.position + i >= j);
					return x && x.position + i == j;
				});
				let isReplacingCut = j == badRootSeam;
				let klimit = seamHeight;
				if (isAscending) {
					klimit = seamHeight + (cutHeight-badRootHeight)*i;
				}
				for (let k = 0; k < klimit; k++) {
					if (!result[k]) result.push([]);
					let sy = k; // Bb
					let sx = 0;
					if (isAscending && k >= badRootHeight) {
						if (k <= badRootHeight + (cutHeight-badRootHeight)*(i-isReplacingCut)) { // Br replace
							sy = badRootHeight;
						} else if (isReplacingCut && k <= badRootHeight+(cutHeight-badRootHeight)*i) { // Br extend
							sy = k - (cutHeight-badRootHeight)*(i-1);
						} else { // Be
							sy = k - (cutHeight-badRootHeight)*i;
						}
						if (!yamakazi && isReplacingCut) {
							sx = mountain[sy].length-1;
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
					let sourceParentIndex = mountain[sy][sx].parentIndex;
					let parentShifts = i - isReplacingCut;
					let parentPosition = -1;
					if (mountain[sy][sourceParentIndex]) {
						let pos = mountain[sy][sourceParentIndex].position + sy;
						if (pos >= badRootSeam) {
							parentPosition = pos + parentShifts*(afterCutLength-badRootSeam) - k;
						} else {
							parentPosition = pos - k;
						}
					}
					let parentIndex = result[k].findIndex(x => x.position == parentPosition);
					result[k].push({
						value: parentIndex == -1 ? newDiagonal[j+(afterCutLength-badRootSeam)*i] : NaN,
						position: j + (afterCutLength-badRootSeam)*i - k,
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
			let k = result[i+1].findIndex(x => x.position >= result[i][j].position - 1); // find left-up
			result[i][j].value = result[i][result[i][j].parentIndex].value + result[i+1][k].value;
		}
	}
	return mountainToArray(result);
}