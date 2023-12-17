function PMStomatrix(s) {
	const matrix = [];
	const columns = s.match(/\([^)]+\)/g) || [];
	for (const v of columns) {
		const column = v.match(/\d+/g).map(Number);
		matrix.push(column);
	}
	return matrix;
}

function PMStostring(m) {
	let s = "";
	for (let i = 0; i < m.length; i++) {
		s += `(${m[i].join(",")})`;
	}
	return s;
}

// remove rows that are all zero
function PMSsimplify(matrix) {
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
	return PMSsimplify(matrix);
}

function PMSexpand(matrix, n) {
	const lastColumn = matrix[matrix.length - 1];
	if (!lastColumn) return [];
	let L, Li;
	for (let i = lastColumn.length - 1; i >= 0; i--) {
		if (lastColumn[i] !== 0) {
			L = lastColumn[i];
			Li = i;
			break;
		}
	}
	const newMatrix = [];
	for (let i = 0; i < matrix.length; i++) {
		newMatrix[i] = [...matrix[i]];
	}
	if (!L || n == 0) {
		newMatrix.pop();
		return PMSsimplify(newMatrix);
	}
	for (let i = Li; i < lastColumn.length; i++) {
		if (newMatrix[newMatrix.length - L - 1][i] !== 0) {
			newMatrix[newMatrix.length - 1][i] = newMatrix[newMatrix.length - L - 1][i] + L;
		} else {
			newMatrix[newMatrix.length - 1][i] = 0;
		}
	}
	const badPart = newMatrix.slice(-L);
	for (let i = 1; i < n; i++) {
		for (let j = 0; j < badPart.length; j++) {
			const column = [...badPart[j]];
			for (let k = 0; k < column.length; k++) {
				if (column[k] > j + 1) {
					column[k] += L * i;
				}
			}
			newMatrix.push(column);
		}
	}
	return PMSsimplify(newMatrix);
}

// convert between PMS and AMS
function PMSflipterms(matrix) {
	let newMatrix = [];
	for (let i = 0; i < matrix.length; i++) {
		let newRow = [];
		for (let j = 0; j < matrix[i].length; j++) {
			newRow[j] = matrix[i][j] == 0 ? 0 : i+1 - matrix[i][j];
		}
		newMatrix[i] = newRow;
	}
	return newMatrix;
}

function PMSisSuccessor(matrix) {
	const lastColumn = matrix[matrix.length - 1];
	if (lastColumn) {
		for (let i = 0; i < lastColumn.length; i++) {
			if (lastColumn[i] !== 0) {
				return false;
			}
		}
		return true;
	}
}