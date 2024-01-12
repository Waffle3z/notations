class notation {
	static title = "Eulerian Sequence";

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

function arrayToRow(array) {
	return array.map((v, i) => {
		let parentIndex = array.findLastIndex((x, j) => j < i && x < v);
		let diff = parentIndex == -1 ? 0 : v - array[parentIndex];
		let ancestry = [i];
		while (true) {
			let lastIndex = ancestry.at(-1);
			let ancestor = array.findLastIndex((x, j) => j < lastIndex && x < array[lastIndex]);
			if (ancestor == -1) break;
			ancestry.push(ancestor);
		}
		return {
			value: v,
			position: i,
			parentIndex: parentIndex,
			delta: Math.max(0, diff - (ancestry.length-1))
		};
	});
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
					position: row[i].position - 1,
					parentIndex: -1,
					delta: 0
				});
			}
		}
		for (let i = 0; i < newRow.length; i++) {
			let p = row.findIndex(x => x.position > newRow[i].position);
			while (p >= 0) {
				p = row[p].parentIndex;
				if (p < 0) break;
				let j = newRow.findIndex(x => x.position >= row[p].position - 1);
				if (j < 0 || (j < newRow.length-1 && newRow[j].position + 1 != newRow[j+1].position)) break;
				if (newRow[j].value < newRow[i].value) {
					newRow[i].parentIndex = j;
        		    let ancestry = [i];
        		    while (newRow[ancestry.at(-1)].parentIndex != -1) {
        		        ancestry.push(newRow[ancestry.at(-1)].parentIndex);
        		    }
        		    let diff = newRow[i].value - newRow[j].value;
        		    newRow[i].delta = Math.max(0, diff - (ancestry.length-1));
					break;
				}
			}
		}
		mountain.push(newRow);
    	let hasNextRow = false;
    	for (let i = 0; i < row.length; i++) {
    	    if (row[i].delta != 0) {
    	        hasNextRow = true;
    	        break;
    	    }
    	}
    	if (!hasNextRow) return mountain;
		row = newRow;
	}
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

function getBadRoot(mountain) {
	let i = mountain.findLastIndex((v, i) => v.at(-1).position + i == mountain[0].length-1);
	return mountain[i-1][mountain[i-1].at(-1).parentIndex].position + i-1;
}

function TrSSexpand(a, n) {
	function parent(ind) {
		return a.findLastIndex((v, i) => (i < ind || i == 0) && (v == 0 || v < a[ind]));
	}
	let cutNode = a.at(-1);
	let root = a.length - 1;
	let diff = cutNode - a[parent(a.length - 1)];
	let delta = 0;
	for (let i = 0; i < diff; i++) {
		if (a[root] == 0) {
			delta++;
		} else {
			root = parent(root);
		}
	}
	let badPart = a.slice(root, -1);
	let increment = cutNode - a[root] - 1;
	a.pop();
	if (delta == 0) {
		for (let i = 1; i <= n; i++) {
			a.push(...badPart.map(v => v + increment*i));
		}
	} else {
		let badPartHeight = 1;
		let bottom = badPart.length - 1;
		while (bottom > 0) {
			bottom = badPart.findLastIndex((v, i) => i < bottom && v < badPart[bottom]);
			badPartHeight++;
		}

		for (let i = 1; i <= n; i++) {
			a.push(...badPart.map(v => v + increment));
			increment += badPart.at(-1) + badPartHeight * i + delta;
		}
	}
	return a;
}

function expand(mountain, n) {
	let result = cloneMountain(mountain);
	if (mountain[0].at(-1).parentIndex == -1) {
		result[0].pop();
	} else {
		if (mountain.length == 1 || mountain[1].at(-1).value == 0) {
			let array = mountain[0].map(v => v.value);
			return calcMountain(arrayToRow(TrSSexpand(array, n)));
		}

		let cutHeight = mountain.findLastIndex((v, i) => v.at(-1).position + i == mountain[0].length - 1);
		for (let i = 0; i <= cutHeight; i++) result[i].pop();
		if (!result.at(-1).length) result.pop();
		let cutLength = result[0].length;

		cutHeight--;
		let badRootSeam = getBadRoot(mountain);
		let badRootHeight = cutHeight;

		for (let i = 1; i <= n; i++) {
			for (let j = badRootSeam; j < cutLength; j++) {
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
					let sy = k;
					let sx = 0;
					if (isAscending && k >= badRootHeight) {
						if (k <= badRootHeight + (cutHeight-badRootHeight)*(i-isReplacingCut)) {
							sy = badRootHeight;
						} else if (isReplacingCut && k <= badRootHeight+(cutHeight-badRootHeight)*i) {
							sy = k - (cutHeight-badRootHeight)*(i-1);
						} else {
							sy = k - (cutHeight-badRootHeight)*i;
						}
						sx = mountain[sy].findIndex(x => x.position + sy >= j);
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
							parentPosition = pos + parentShifts*(cutLength-badRootSeam) - k;
						} else {
							parentPosition = pos - k;
						}
					}
					let parentIndex = result[k].findIndex(x => x.position == parentPosition);
					result[k].push({
						value: parentIndex == -1 ? 0 : NaN,
						position: j + (cutLength-badRootSeam)*i - k,
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
			let k = result[i+1].findIndex(x => x.position >= result[i][j].position - 1);
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