// Based on https://github.com/hypcos/notation-explorer/blob/master/TomegaMN.js

function lexicographic_compare(a, b, element_compare) {
	for (let i = 0; i <= b.length; i++) {
		if (i >= a.length) return i >= b.length ? 0 : -1;
		if (i >= b.length) return 1;
		const c = element_compare(a[i], b[i]);
		if (c) return c;
	}
}

function entry_compare(a, b) {
	if (a[0] == b[0]) return mountain_compare(a[1], b[1]);
	return a[0] > b[0] ? 1 : -1;
}
const column_compare = (a, b) => lexicographic_compare(a, b, entry_compare);
const mountain_compare = (a, b) => lexicographic_compare(a, b, column_compare);
const vertical_compare = (a, b) => lexicographic_compare(a, b, mountain_compare);

function mountain_is_limit(m) {
	return m.length > 0 && m.at(-1).length > 0;
}

function mountain_display(m) {
	return m.map(column => `(${column.map(([v, sep]) =>
		sep.every(c => !c.length) ? ','.repeat(sep.length) + v : mountain_display(sep) + v
	).join('')})`).join('');
}

function mountain_parent(A, i, j) {
	if (!A || i >= A.length || j >= A[i].length) return [-1, -1];
	
	const value = A[i][j][0];
	if (value <= 0) return [-1, -1]; // No parent
	
	const targetcolumn = value - 1;
	if (targetcolumn < 0 || targetcolumn >= A.length) return [-1, -1];
	
	const verticals = A.map(column_verticals);
	const targetRow = verticals[targetcolumn].findLastIndex(x => vertical_compare(x, verticals[i][j]) < 0) + 1;
	return [targetcolumn, targetRow];
}

// Height is 0 for entries with no parent, then 1, 2, 3... for each parent step
function calculate_height(A, i, j) {
	if (!A || A.length === 0) return 0;
	
	let height = 0;
	let current_i = i;
	let current_j = j;
	
	while (true) {
		const [parent_i, parent_j] = mountain_parent(A, current_i, current_j);
		if (parent_i < 0 || parent_j < 0) break;
		height++;
		current_i = parent_i;
		current_j = parent_j;
	}
	
	return height;
}

function addressToHeight(mountain) {
	if (!mountain || mountain.length === 0) return [];
	
	// For each column and entry, replace value with height
	const result = JSON.parse(JSON.stringify(mountain));
	for (let i = 0; i < result.length; i++) {
		for (let j = 0; j < result[i].length; j++) {
			result[i][j][0] = calculate_height(mountain, i, j);
		}
	}
	
	return result;
}

function vertical_increase(v, m) {
	const i = v.findLastIndex(x => mountain_compare(x, m) >= 0);
	return [...v.slice(0, i + 1), m];
}

function parent(A, verticalss, i, j) {
	const targetcolumn = A[i][j][0] - 1;
	const targeti = verticalss[targetcolumn].findLastIndex(x => vertical_compare(x, verticalss[i][j]) < 0) + 1;
	return [targetcolumn, targeti];
}

function column_verticals(column) {
	const v = [[]];
	for (let j = 0; j < column.length; j++) {
		v.push(vertical_increase(v[j], column[j][1]));
	}
	return v.slice(1);
}

function get_references(A, rtops) {
	const verticals = column_verticals(A[A.length - 1]);
	verticals.unshift([]);
	const ref = [];
	let i = 0, j = 0;
	while (i < verticals.length && j < rtops.length) {
		if (vertical_compare(verticals[i], rtops[j]) < 0) {
			ref[j] = i;
			i++;
		} else {
			j++;
		}
	}
	return ref;
}

function threshold(A, low, high) {
	let n = 0;
	while (true) {
		const res = expand(A, n);
		if (vertical_compare(vertical_increase(low, res), vertical_increase(high, res)) >= 0) {
			return n;
		}
		n++;
	}
}

function expand(A0, FSterm) {
	const rightmost = A0.length - 1;
	const topmost = A0[rightmost].length - 1;
	const A = JSON.parse(JSON.stringify(A0));
	const topright_entry = A[rightmost][topmost];
	const topright_separator = topright_entry[1];

	const V0 = A.map(column_verticals);
	const [BRi, BRj] = parent(A, V0, rightmost, topmost);
	const width = rightmost - BRi;

	if (mountain_is_limit(topright_separator)) {
		topright_entry[1] = expand(
			topright_separator,
			threshold(topright_separator, V0[BRi][BRj - 1] || [], V0[rightmost][topmost - 1] || []) + FSterm
		);
		return A;
	}

	const topverticals = V0[BRi].slice(0, BRj);
	topverticals.push(V0[rightmost][topmost]);

	if (topright_separator.length === 1 && topright_separator[0].length === 0) { // topright_separator is 1
		A[rightmost].pop();
	} else {
		const topright_separator_trimmed = topright_separator.slice(0, -1);
		const leftSide = V0[BRi][BRj - 1] || [];
		const rightSide = V0[rightmost][topmost - 1] || [];
		if (vertical_compare(vertical_increase(leftSide, topright_separator_trimmed), rightSide) <= 0) {
			A[rightmost].pop();
		} else {
			topright_entry[1] = topright_separator_trimmed;
		}
	}
	A[rightmost] = A[rightmost].concat(A[BRi].slice(BRj));

	const V = A.map(column_verticals);
	const magma_checkss = [];
	for (let i = BRi + 1; i <= rightmost; i++) {
		magma_checkss[i] = [];
		for (let j = 0; j < A[i].length; j++) {
			let working_i = i;
			let working_j = j;
			while (working_i > BRi) {
				if (A[working_i].length <= working_j) working_j--;
				[working_i, working_j] = parent(A, V, working_i, working_j);
			}
			magma_checkss[i][j] = (
				working_i === BRi && working_j <= BRj && 
				!vertical_compare(V[working_i][working_j - 1] || [], V[i][j - 1] || [])
			) ? working_j : -1;
		}
	}

	for (let n = 1; n <= FSterm; n++) {
		const refs = get_references(A, topverticals);
		refs[-1] = -1;
		for (let dx = 1; dx <= width; dx++) {
			const x = BRi + dx;
			const source_magmas = magma_checkss[x];
			const target_column = A[x + width * n] = [];
			A[x].forEach(([value, sep], y) => {
				if (source_magmas[y] != -1) {
					const BRindex = source_magmas[y];
					for (let k = refs[BRindex - 1] + 1; k <= refs[BRindex]; k++) {
						if (k === refs[BRindex]) {
							target_column.push([value + width * n, sep]);
						} else {
							target_column.push([value + width * n, A[BRi + width * n][k][1]]);
						}
					}
				} else {
					target_column.push([value + (value > BRi ? width * n : 0), sep]);
				}
			});
		}
	}

	A.pop();
	return A;
}