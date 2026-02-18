// remove rows that are all zero
function matrixReduce(matrix) {
	if (matrix.length == 0 || matrix[0].length <= 1) return matrix;
	let index = matrix[0].length-1;
	for (let i = 0; i < matrix.length; i++) {
		if (matrix[i][index] != 0) {
			return matrix;
		}
	}
	for (let i = 0; i < matrix.length; i++) {
		matrix[i].pop();
	}
	return matrixReduce(matrix);
}

// remove trailing zeros
function matrixSimplify(matrix) {
	return matrix.map(row => {
		let index = row.length - 1;
		while (index > 0 && row[index] === 0) {
			index--;
		}
		return row.slice(0, index + 1);
	});
}

function matrixLessThan(a, b) {
	if (a.length == 0 || b.length == 0) return a.length < b.length;
	if (a[0].length != b[0].length) return a[0].length < b[0].length;
	for (let i = 0; i < a.length; i++) {
		if (i >= b.length) return false;
		for (let j = 0; j < a[i].length; j++) {
			if (a[i][j] != b[i][j]) return a[i][j] < b[i][j];
		}
	}
	return a.length < b.length;
}

class notation {
	static title = "BMS Explorer";
	static notation = "BMS";
	static simplify = false;
	static compress = false;
	static aliases = true;
	
	static parameters = [
		{legend: "Notation:", inputs: [
			{type: "radio", id: "notation", value: "BMS", label: "BMS"},
			{type: "radio", id: "notation", value: "PMS", label: "PMS"},
			{type: "radio", id: "notation", value: "AMS", label: "AMS"},
			{type: "radio", id: "notation", value: "0Y", label: "0-Y"},
			{type: "radio", id: "notation", value: "VZ", label: "Vulcaniz"},
		]},
		{type: "checkbox", id: "simplify", label: "Simplify trailing zeros"},
		{type: "checkbox", id: "aliases", label: "Show ordinal names"},
		{type: "checkbox", id: "compress", label: "Compressed", visibleIf: () => ["BMS", "AMS", "PMS"].includes(notation.notation)},
	]
	
	static toString(m) {
		let s = "";
		for (let i = 0; i < m.length; i++) {
			s += `(${m[i].join(",")})`;
		}
		return s;
	}

	static fromString(s) {
		const matrix = [];
		const columns = s.match(/\([^)]+\)/g) || [];
		for (const v of columns) {
			const column = v.match(/\d+/g).map(Number);
			matrix.push(column);
		}
		return matrix;
	}

	static isSuccessor(matrix) {
		const lastColumn = matrix.at(-1);
		return lastColumn ? !lastColumn.find(x => x != 0) : true;
	}

	static lessOrEqual(a, b) {
		if (a.length == 0 || b.length == 0) return a.length <= b.length;
		if (a[0].length != b[0].length) return a[0].length < b[0].length;
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			for (let j = 0; j < a[i].length; j++) {
				if (a[i][j] != b[i][j]) return a[i][j] < b[i][j];
			}
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		let s = "(" + Array(n+1).fill(0).join(",") + ")(" + Array(n+1).fill(1).join(",") + ")";
		return this.fromString(s);
	}

	static expand(matrix, n) {
		const lastColumn = matrix.at(-1);
		if (!lastColumn) return [];
		const Li = lastColumn.findLastIndex(L => L != 0);
		const newMatrix = matrix.map(row => [...row]);
		if (Li == -1 || n == 1) {
			newMatrix.pop();
			return matrixReduce(newMatrix);
		}
		const L = lastColumn[Li];
		if (n == 0) return matrixReduce(newMatrix.slice(0, -L-1));
		for (let i = Li; i < lastColumn.length; i++) {
			const parent = newMatrix.at(-L-1)[i];
			newMatrix.at(-1)[i] = parent == 0 ? 0 : parent + L;
		}
		const badPart = newMatrix.slice(-L);
		for (let i = 1; i < n; i++) {
			for (let j = 0; j < badPart.length; j++) {
				newMatrix.push(badPart[j].map(v => v > j+1 ? v + L*i : v));
			}
		}
		newMatrix.pop(); // drop the last copy of the cut node
		return matrixReduce(newMatrix);
	}

	static convertToNotation(value) {
		let matrix = notation.fromString(value);
		if (matrix.length == 0) return "∅";
		if (notation.notation == "AMS") {
			matrix = PMStoAMS(matrix);
		} else if (notation.notation == "BMS") {
			matrix = PMStoBMS(matrix);
		}
		
		let str;
		if (notation.notation == "0Y") {
			matrix = PMSto0Y(matrix);
			str = matrix.join(",");
		} else if (notation.notation == "VZ") {
			matrix = matrixSimplify(PMStoBMS(matrix));
			let sequence = [];

			for (let term of matrix) {
				let v = term[0] + 1;
				sequence.push(v);
				for (let i = 1; i < term.length; i++) {
					sequence.push(v + term[i] + 1);
				}
			}

			str = sequence.join(",");
		} else {
			str = notation.toString(notation.simplify ? matrixSimplify(matrix) : matrix);
			if (notation.compress) {
				str = str.replaceAll(")(", " ").replace("(", "").replace(")", "").replaceAll(",", "");
			}
		}
		
		if (notation.aliases) {
			let alias = findAlias(value);
			if (alias) {
				str += " = " + alias;
			}
		}
		
		return str;
	}
};

function PMStoAMS(matrix) {
	return matrix.map((row, i) => row.map(v => v == 0 ? 0 : i + 1 - v));
}

function PMStoBMS(matrix) {
	let newMatrix = [];
	for (let i = 0; i < matrix.length; i++) {
		let newRow = [];
		for (let j = 0; j < matrix[i].length; j++) {
			let height = -1;
			let index = i + 1;
			while (index > 0) {
				height++;
				index -= (matrix[index-1][j] || index);
			}
			newRow[j] = height;
		}
		newMatrix[i] = newRow;
	}
	return newMatrix;
}

function AMSto0Y(matrix) {
	let a = Array(matrix.length).fill(1);
	for (let y = matrix[0].length - 1; y >= 0; y--) {
		for (let x = 0; x < matrix.length; x++) {
			a[x] = matrix[x][y] === 0 ? 1 : a[x] + a[matrix[x][y] - 1];
		}
	}
	return a;
}

function PMSto0Y(matrix) {
	return AMSto0Y(PMStoAMS(matrix));
}