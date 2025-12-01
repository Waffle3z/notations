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

class notation {
	static title = "DDMS";
	static header = "Diagonal Descending Matrix System";
	static weaklyAscending = false;

	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			const compare = arrayCompare(a[i], b[i]);
			if (compare != 0) return compare < 0;
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		return [[0], [n + 1]];
	}

	static expand(matrix, n) {
		let pm = toPointerMatrix(matrix);
		let rootIndex = pm.length - 1 - pm.at(-1).at(-1).distance;
		if (n == 0) return toMatrix(pm.slice(0, rootIndex - 1));
		let out = deepcopy(pm);
		let tail = out.slice(rootIndex + 1);
		
		let cutNode = tail.at(-1);
		let rootNode = out[rootIndex];
		let lastColumnIndex = cutNode.length - 1;
		let lastColumn = cutNode[lastColumnIndex];
		let lastColumnDistance = lastColumn.distance;
		let getTermLength = (x) => x.length - (x.at(-1).delta == 0 ? 1 : 0); // (0) has length 0
		let ascend = lastColumnIndex >= getTermLength(rootNode) ? lastColumn.delta - 1 : 0;
		if (ascend == 0 && cutNode.length - getTermLength(rootNode) <= 1) {
			cutNode.pop();
			let root = rootNode;
			for (let i = lastColumnIndex; i < root.length; i++) {
				cutNode[i] = {distance: root[i].distance + lastColumnDistance, delta: root[i].delta};
			}
		} else {
			if (lastColumn.delta > 1) {
				lastColumn.delta--;
				for (let i = 1; i < n; i++) {
					cutNode.push(lastColumn);
				}
				return toMatrix(out);
			}
			lastColumn.delta--;
			// find how many extra columns the term ends in
			let ascend = getTermLength(cutNode) - getTermLength(rootNode); // number of extra columns to ascend
			rootNode.ascending = ascend;
			cutNode.ascending = ascend;
			// descendants of an ascended term that have an extra column also ascend
			for (let i = rootIndex; i < out.length; i++) {
				let parentIndex = i - out[i].at(-1).distance;
				let canAscend = getTermLength(out[i]) > getTermLength(notation.weaklyAscending ? out[parentIndex] : rootNode);
				if (canAscend && out[parentIndex].ascending) out[i].ascending = ascend;
			}
		}
		let parentColumn = pm[rootIndex][lastColumnIndex];
		if (parentColumn && lastColumn.delta == parentColumn.delta) lastColumn.distance = parentColumn.distance;
		if (cutNode.length > 1 && lastColumn.delta == 0) cutNode.pop();
		tail = deepcopy(tail);
		cutNode = tail.at(-1);
		for (let i = 1; i < n; i++) {
			let copy = deepcopy(tail);
			for (let j = 0; j < copy.length; j++) {
				let term = copy[j];
				if (term.ascending) {
					let parent = out[rootIndex + 1 + j - term.at(-1).distance];
					let lengthDelta = term.length - parent.length + (parent[0].distance == 0 ? 1 : 0);
					let distance = term.at(-1).distance;
					let back = [];
					for (let k = 0; k < lengthDelta; k++) {
						back.unshift(term.pop());
					}
					for (let k = 0; k < i * term.ascending; k++) {
						term.push({distance: distance, delta: 1});
					}
					term.push(...back);
				}
				for (let v of term) {
					if (v.distance > j+1) v.distance += lastColumnDistance * i;
				}
			}
			out.push(...copy);
		}
		out.pop(); // remove last copy of the cut node in case it's a successor
		return toMatrix(out);
	}

	static isSuccessor(matrix) {
		return matrix.length == 0 || matrix.at(-1).length == 0 || matrix.at(-1).at(-1) == 0;
	}
	
	static toString(m) {
		let s = "";
		for (let i = 0; i < m.length; i++) {
			s += `(${m[i].join(",")})`;
		}
		return s;
	}

	static fromString(s) {
		const matrix = [];
		const columns = s.match(/\([^)]*\)/g) || [];
		for (const v of columns) {
			const column = (v.match(/\d+/g) || []).map(Number);
			matrix.push(column);
		}
		return matrix;
	}

	static parameters = [
		{type: "checkbox", label: "Weakly ascending", id: "weaklyAscending"},
	]
};