class notation {
	static title = "Eulerian Sequence";
	static header = "Eulerian Sequence (WIP)";
	static footer = "<a href='mountain.html'>Mountain Viewer</a>";

	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		return Array(n+1).fill(0).map((v, i) => (2<<i)-i-2);
	}

	static expand(a, n) {
		let mountain = expand(calcMountain(arrayToRow(a)), n);
		return mountain[0].map(v => v.value);
	}

	static isSuccessor(array) {
		return array.length == 0 || array.at(-1) == 0;
	}

	static toString(array) {
		return array.join(",");
	}

	static fromString(s) {
		return JSON.parse("["+s+"]");
	}
};

function arrayToRow(array, mode) {
	function parent(i) {
		return array.findLastIndex((x, j) => j < i && x < array[i]);
	}
	return array.map((v, i) => {
		let p = parent(i);
		if (p == -1) {
			return {
				value: v,
				position: i,
				parentIndex: -1,
				delta: 0
			};
		}
		let ancestors = [p];
		while (true) {
			let ancestor = parent(ancestors.at(-1));
			if (ancestor == -1) break;
			ancestors.push(ancestor);
		}
		let diff = v - array[ancestors[0]];
		let delta = diff - ancestors.length;
		let parentIndex = ancestors[0];
		return {
			value: v,
			position: i,
			parentIndex: parentIndex,
			delta: delta
		};
	});
}

function clampedValue(term) {
	return Math.max(0, term.value);
}

function calcMountain(row) {
	let mountain = [row];
	while (true) {
		let newRow = [];
		for (let i = 0; i < row.length; i++) {
			if (row[i].parentIndex != -1) {
				let ancestry = [i];
				while (row[ancestry.at(-1)].parentIndex != -1) {
					ancestry.push(row[ancestry.at(-1)].parentIndex);
				}
				newRow.push({
					value: row[i].delta,
					position: row[i].position,
					parentIndex: -1,
					delta: 0
				});
			}
		}
		for (let i = 0; i < newRow.length; i++) {
			let p = row.findIndex(x => x.position >= newRow[i].position);
			while (p >= 0) {
				p = row[p].parentIndex;
				if (p < 0) break;
				let j = newRow.findIndex(x => x.position >= row[p].position);
				if (j < 0 || (j < newRow.length-1 && newRow[j].position + 1 != newRow[j+1].position)) break;
				if (clampedValue(newRow[j]) < clampedValue(newRow[i])) {
					newRow[i].parentIndex = j;
					let ancestors = [j];
					while (true) {
						let ancestor = newRow[ancestors.at(-1)].parentIndex;
						if (ancestor == -1) break;
						ancestors.push(ancestor);
					}
					let diff = clampedValue(newRow[i]) - clampedValue(newRow[j]);
					let delta = diff - ancestors.length;
					newRow[i].parentIndex = ancestors[0];
					newRow[i].delta = delta;
					break;
				}
			}
		}
		if (newRow.length == 0) break;
		mountain.push(newRow);
		let hasNextRow = false;
		for (let i = 0; i < row.length; i++) {
			if (row[i].delta > 0) {
				hasNextRow = true;
				break;
			}
		}
		if (!hasNextRow) break;
		row = newRow;
	}
	return mountain;
}

function cloneMountain(mountain) {
	return mountain.map(layer => layer.map(element => {
		return {
			value: element.value,
			position: element.position,
			parentIndex: element.parentIndex,
			delta: element.delta
		};
	}));
}

function expand(mountain, n) {
	let result = cloneMountain(mountain);
	if (mountain[0].at(-1).parentIndex == -1) {
		result[0].pop();
	} else {
		let cutHeight = mountain.findLastIndex(row => row.at(-1).position == mountain[0].length - 1);
		for (let i = 0; i <= cutHeight; i++) result[i].pop();
		if (!result.at(-1).length) result.pop();
		let cutLength = result[0].length;

		let badRootHeight = cutHeight - 1;
		let badRootRow = mountain[badRootHeight];
		let badRootSeam = badRootRow[badRootRow.at(-1).parentIndex].position;

		let worm = false;
		if (mountain[cutHeight].at(-1).value == 0 && badRootRow.at(-1).value > 1) {
			worm = true
		} else if (mountain[cutHeight].at(-1).value < 0) {
			let nextRow = mountain[cutHeight-1];
			if (nextRow.at(-1).value != nextRow[nextRow.at(-1).parentIndex].value + 1) {
				worm = true;
			}
		}
		if (worm) {
			let cutNode = badRootRow.at(-1).value;
			let parentIndex = badRootRow.at(-1).parentIndex;
			while (parentIndex != -1 && badRootRow[parentIndex].value >= cutNode - 1) {
				parentIndex = badRootRow[parentIndex].parentIndex;
			}
			for (let i = 1; i <= n; i++) {
				result[badRootHeight].push({
					value: cutNode - 1,
					position: badRootRow.at(-1).position + i - 1,
					parentIndex: parentIndex
				});
			}
			for (let k = badRootHeight - 1; k >= 0; k--) {
				let parent = mountain[k].at(-1).parentIndex;
				for (let i = result[k].length; i <= result[k+1].length; i++) {
					let numAncestors = 1;
					let current = parent;
					while (result[k][current].parentIndex != -1) {
						current = result[k][current].parentIndex;
						numAncestors++;
					}
					let value = result[k][parent].value + result[k+1][i-1].value + numAncestors;
					result[k].push({
						value: value,
						position: result[k][i-1].position + 1,
						parentIndex: parent
					});
					parent = i;
				}
			}
			return calcMountain(arrayToRow(result[0].map(v => v.value)));
		}

		for (let i = 1; i <= n; i++) {
			for (let j = badRootSeam; j < cutLength; j++) {
				let isAscending = false;
				let p = badRootRow.findIndex(x => x.position >= j);
				if (badRootRow[p].position == j) {
					while (true) {
						if (!badRootRow[p] || badRootRow[p].position < badRootSeam) {
							isAscending = false;
							break;
						}
						if (badRootRow[p].position == badRootSeam) {
							isAscending = true;
							break;
						}
						p = badRootRow[p].parentIndex;
					}
				}

				let seamHeight = 1 + result.findLastIndex(v => {
					let x = v.find(x => x.position >= j);
					return x && x.position == j;
				});
				let isReplacingCut = j == badRootSeam;
				for (let k = 0; k < seamHeight; k++) {
					if (!result[k]) result.push([]);
					let sx = mountain[k].length - 1;
					if (!isReplacingCut || (isAscending && k >= badRootHeight)) {
						sx = mountain[k].findIndex(x => x.position >= j);
					}
					let sourceParentIndex = mountain[k][sx].parentIndex;
					let parentShifts = i - isReplacingCut;
					let parentPosition = -1;
					if (mountain[k][sourceParentIndex]) {
						let pos = mountain[k][sourceParentIndex].position;
						if (pos >= badRootSeam) {
							parentPosition = pos + parentShifts*(cutLength-badRootSeam);
						} else {
							parentPosition = pos;
						}
					}
					let parentIndex = result[k].findIndex(x => x.position == parentPosition);
					let base = mountain[k].find(x => x.position == j);
					let value = parentIndex == -1 ? base ? base.value : 0 : NaN;
					result[k].push({
						value: value,
						position: j + (cutLength-badRootSeam)*i,
						parentIndex: parentIndex
					});
				}
			}
		}
	}
	
	for (let i = result.length-1; i >= 0; i--) {
		if (!result[i].length) {
			result.pop();
			continue;
		}
		for (let j = 0; j < result[i].length; j++) {
			if (!isNaN(result[i][j].value)) continue;
			let k = result[i+1].findIndex(x => x.position >= result[i][j].position);
			let numAncestors = 0;
			let current = j;
			while (result[i][current].parentIndex != -1) {
				current = result[i][current].parentIndex;
				numAncestors++;
			}
			result[i][j].value = result[i][result[i][j].parentIndex].value + result[i+1][k].value + numAncestors;
		}
	}
	return result;
}