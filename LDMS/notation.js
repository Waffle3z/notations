class notation {
	static title = "LDMS";
	static header = "Large Descending Matrix System";

	static lessOrEqual(a, b) {
		if (a.length == 0) return b.length > 0;
		if (b.length == 0) return false;
		if (a[0].length != b[0].length) return a[0].length < b[0].length;
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			for (let j = 0; j < Math.max(a[i].length, b[i].length); j++) {
				if (a[i][j] != b[i][j]) return (a[i][j] || 0) < (b[i][j] || 0);
			}
		}
		return b.length >= a.length;
	}

	static expandLimit(n) {
		let s = "()(" + (n+1) + ")";
		return this.fromString(s);
	}

	static expand(matrix, n) {
		const lastEntry = matrix.at(-1);
		if (!lastEntry) return [];
		const newMatrix = matrix.map(row => [...row]);
		const cutNode = newMatrix.pop();
		if (n == 0 || cutNode.length == 0) {
			return newMatrix;
		}
		const rootIndex = newMatrix.findLastIndex((row, i) => {
			if (!(row < cutNode)) return false;
			if (newMatrix.find((row2, j) => j > i && row2 < row)) return false;
			return cutNode.at(-1) > (row[cutNode.length-1] || 0);
		});
		let rootNode = newMatrix[rootIndex];
		const badPart = newMatrix.slice(rootIndex);
		const delta = cutNode.at(-1) - (rootNode.at(cutNode.length-1) || 0);
		for (let i = 1; i < n; i++) {
			newMatrix.push(...badPart.map(row => {
				let newRow = row.map((v, j) => {
					let increment = Math.max(0, (cutNode[j] || 0) - (rootNode[j] || 0) - (j == cutNode.length-1 ? 1 : 0));
					if (delta > 1 && cutNode.length < row.length) increment = delta-1;
					return v + increment * i;
				});
				let offset = cutNode.at(-1) - (rootNode.at(cutNode.length-1) || 0);
				if ((cutNode.length > rootNode.length && cutNode.at(-1) > 1) || (cutNode.at(-1) - (row.at(cutNode.length-1) || 0) > 1)) {
					if (offset > 1) {
						for (let b = 0; b < i; b++) {
							newRow.push((offset - 1) * (i - b));
						}
					}
				}
				return newRow;
			}));
		}
		return newMatrix;
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