class notation {
	static title = "Mountain";
	static footer = "<a href='mountain.html'>Viewer</a>";

	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		return [1, n+2];
	}

	static expand(a, n) {
		let mountain = expand(calcMountain(arrayToRow(a)), n);
		return mountain[0].map(v => v.value);
	}

	static isSuccessor(array) {
		return array.length == 0 || array.at(-1) == 1;
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
		return {
			value: v,
			position: i,
			parentIndex: p,
			delta: v - array[p]
		};
	});
}

function calcMountain(row) {
	let mountain = [row];
	while (true) {
		let newRow = [];
		for (let i = 0; i < row.length; i++) {
			if (row[i].parentIndex != -1) {
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
				if (newRow[j].value < newRow[i].value) {
					newRow[i].parentIndex = j;
					newRow[i].delta = newRow[i].value - newRow[j].value;
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
			parentIndex: element.parentIndex
		};
	}));
}

function expand(mountain, n) {
	let result = cloneMountain(mountain);
	if (mountain[0].at(-1).parentIndex == -1 || n == 0) {
		result[0].pop();
	} else {
		let cutHeight = mountain.findLastIndex(row => row.at(-1).position == mountain[0].length - 1);
		for (let i = 0; i <= cutHeight; i++) result[i].pop();

		let badRootRow = mountain[cutHeight];

		let cutNode = badRootRow.at(-1).value;
		let parentIndex = badRootRow.at(-1).parentIndex;
		while (parentIndex != -1 && badRootRow[parentIndex].value >= cutNode - 1) {
			parentIndex = badRootRow[parentIndex].parentIndex;
		}
		let row = result[cutHeight];
		for (let i = 1; i <= n; i++) {
			row.push({
				value: (cutNode - 1) * (1 << (i - 1)),
				position: badRootRow.at(-1).position + i - 1,
				parentIndex: parentIndex + i - 1
			});
		}
		for (let k = cutHeight - 1; k >= 0; k--) {
			let parent = mountain[k].at(-1).parentIndex;
			for (let p = result[k].at(-1).position + 1; p <= result[k+1].at(-1).position; p++) {
				let difference = result[k+1].find(x => x.position == p).value;
				result[k].push({
					value: result[k][parent].value + difference,
					position: result[k].at(-1).position + 1,
					parentIndex: parent
				});
				parent = result[k].length - 1;
			}
		}
		return calcMountain(arrayToRow(result[0].map(v => v.value)));
	}
	while (result.length > 0 && result.at(-1).length == 0) result.pop();

	return result;
}