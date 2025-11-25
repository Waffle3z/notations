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

function toMatrix(a) {
	let matrix = [];
	for (let i = 0; i < a.length; i++) {
		matrix[i] = [];
		for (let j = 0; j < a[i].length; j++) {
			matrix[i][j] = a.delta == 0 ? 0 : (matrix[i-a[i][j].distance][j] || 0) + a[i][j].delta;
		}
	}
	return matrix;
}

function deepcopy(pm) {
	return pm.map(v => {
		let a = v.map(x => {
			return {distance: x.distance, delta: x.delta};
		});
		if (v.ascending) a.ascending = true;
		return a;
	});
}

class notation {
	static title = "LDMS";
	static header = "Large Descending Matrix System";

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
		let lastColumnIndex = cutNode.length - 1;
		let lastColumn = cutNode[lastColumnIndex];
		let lastColumnDistance = lastColumn.distance;
		let ascend = (lastColumnIndex >= out[rootIndex].length || out[rootIndex][lastColumnIndex].distance == 0) ? lastColumn.delta - 1 : 0;
		if (ascend == 0) {
			cutNode.pop();
			let root = out[rootIndex];
			for (let i = lastColumnIndex; i < root.length; i++) {
				cutNode[i] = {distance: root[i].distance + lastColumnDistance, delta: root[i].delta};
			}
		} else {
			lastColumn.delta--;
			out[rootIndex].ascending = true;
			cutNode.ascending = true;
			// descendants of an ascended term that have an extra column also ascend
			for (let i = rootIndex; i < out.length; i++) {
				let parentIndex = i - out[i].at(-1).distance;
				let isLonger = out[parentIndex].length < out[i].length || out[parentIndex][out[i].length-1].distance == 0;

				if (isLonger && out[parentIndex].ascending) out[i].ascending = true;
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
				if (copy[j].ascending) {
					for (let k = 0; k < i; k++) {
						copy[j].unshift({distance: copy[j].at(-1).distance, delta: 1});
					}
				}
				for (let v of copy[j]) {
					if (v.distance > j+1) v.distance += lastColumnDistance * i;
				}
			}
			out.push(...copy);
		}
		out.pop(); // remove last copy of the cut node in case it's a successor
		return toMatrix(out);
	}

	static isSuccessor(matrix) {
		return matrix.length == 0 || matrix.at(-1).length == 0;
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
};