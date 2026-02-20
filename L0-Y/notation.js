function arrayCompare(a, b) { // -1 if a < b, 0 if a == b, 1 if a > b
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		if (a[i] != b[i]) return (a[i] || 0) < (b[i] || 0) ? -1 : 1;
	}
	return a.length < b.length ? -1 : a.length == b.length ? 0 : 1
}

function toPointerMatrix(a) {
	const pointerMatrix = [];
	for (let i = 0; i < a.length; i++) {
		pointerMatrix[i] = [];
		for (let j = 0; j < a[i].length; j++) {
			pointerMatrix[i][j] = 0;
		}
		let parentIndex = a.findLastIndex((v, j) => j < i && v[0] < a[i][0]);
		if (parentIndex != -1) {
			pointerMatrix[i][0] = i - parentIndex;
		}
	}
	for (let i = 0; i < a.length; i++) {
		if (pointerMatrix[i][0] == 0) continue;
		for (let j = 1; j < a[i].length; j++) {
			let parentIndex = i;
			while (true) {
				if ((a[parentIndex][j] || 0) < a[i][j]) {
					break;
				} else {
					parentIndex -= pointerMatrix[parentIndex][j-1];
				}
			}
			pointerMatrix[i][j] = i - parentIndex;
		}
	}
	return pointerMatrix;
}

function toMatrix(pm) {
	const matrix = [];
	for (let i = 0; i < pm.length; i++) {
		matrix[i] = [];
		for (let j = 0; j < pm[i].length; j++) {
			matrix[i][j] = pm[i][j] == 0 ? 0 : (matrix[i-pm[i][j]][j] || 0) + 1;
		}
	}
	return matrix;
}

class notation {
	static title = "Large 0-Y";
	static header = "Large 0-Y Matrix";

	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			const compare = arrayCompare(a[i], b[i]);
			if (compare != 0) return compare < 0;
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		return [[0], Array(n).fill(1)];
	}

	static expand(matrix, n) {
		const pm = toPointerMatrix(matrix);
		const rootIndex = pm.length - 1 - pm.at(-1).at(-1);
		if (n == 0) return rootIndex == 0 ? [] : matrix.slice(0, rootIndex);
		const out = pm.map(x => [...x]);
		const tail = out.slice(rootIndex + 1);
		
		const cutNode = tail.at(-1);
		const rootNode = out[rootIndex];
		const lastColumnIndex = cutNode.length - 1;
		const lastColumn = cutNode.at(-1);
		const getTermLength = (x) => x.length - (x.at(-1) == 0 ? 1 : 0); // (0) has length 0
		const ascendingMap = new Map();
		if (cutNode.length - getTermLength(rootNode) <= 1) {
			cutNode.pop();
			for (let i = cutNode.length; i < rootNode.length; i++) {
				cutNode[i] = rootNode[i] == 0 ? 0 : rootNode[i] + lastColumn;
			}
		} else {
			if (cutNode.length > 1) cutNode.pop();
			const extra = getTermLength(cutNode) - getTermLength(rootNode); // number of extra columns to ascend
			ascendingMap.set(rootIndex, extra);
			ascendingMap.set(tail.length-1, extra);
			// descendants of an ascended term that have an extra column also ascend
			for (let i = rootIndex; i < out.length; i++) {
				const parentIndex = i - out[i].at(-1);
				const canAscend = getTermLength(out[i]) > getTermLength(rootNode);
				if (canAscend && ascendingMap.has(parentIndex)) ascendingMap.set(i, extra);
			}
		}
		for (let i = 1; i < n; i++) {
			for (let j = 0; j < tail.length; j++) {
				const term = [...tail[j]];
				if (ascendingMap.has(j + rootIndex)) {
					const parent = out[rootIndex + 1 + j - term.at(-1)];
					const lengthDelta = getTermLength(term) - getTermLength(parent);
					const ascendCount = i * ascendingMap.get(j + rootIndex);
					term.splice(-lengthDelta, 0, ...Array(ascendCount).fill(term[0]));
				}
				for (let k = 0; k < term.length; k++) {
					if (term[k] > j+1) term[k] += lastColumn * i;
				}
				out.push(term);
			}
		}
		out.pop(); // remove last copy of the cut node in case it's a successor
		return toMatrix(out);
	}

	static isSuccessor(matrix) {
		return matrix.length == 0 || matrix.at(-1).length == 0 || matrix.at(-1).at(-1) == 0;
	}
	
	static toString(m) {
		if (m.length == 0) return "∅";
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
		{type: "checkbox", label: "Compressed", id: "compress"},
	]

	static convertToNotation(value) {
		const matrix = notation.fromString(value);
		let str = notation.toString(matrix);
		if (notation.compress) {
			str = str.replaceAll(")(", " ").replace("(", "").replace(")", "").replaceAll(",", "");
		}
		return str;
	}
};