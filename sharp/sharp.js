function drawGraph(sets, labeled = true) {
	sets = sets.map(x => x.toSorted((a, b) => b - a));
	const n = sets.length;
	const levels = [];
	for (let i = 0; i < n; i++) {
		levels[i] = sets[i].length == 0 ? 0 : Math.max(...sets[i].map(x => levels[x])) + 1;
	}
	let matrix = sets.map(x => x.length == 0 ? [0] : x.map(y => levels[y]+1));
	let sequence = [];
	for (let i = 0; i < matrix.length; i++) {
		let j = matrix.findLastIndex((x, j) => j < i && x[0] < matrix[i][0]);
		if (j == -1) {
			sequence[i] = 1;
		} else {
			sequence[i] = sequence[j] + 1;
			for (let j = 1; j < matrix[i].length; j++) sequence[i] += matrix[i][j];
		}
	}
	const matrixString = "(" + matrix.map(x => x.join(",")).join(")(") + ")";

	const maxLevel = Math.max(...levels);

	// Adjust spacing to accommodate multi-digit node labels.
	const maxIndexDigits = !labeled ? 1 : String(n - 1).length || 1;
	const horizontalSpacing = Math.max(2, maxIndexDigits) + 1;

	const width = n === 0 ? 0 : (n - 1) * horizontalSpacing + maxIndexDigits;
	const height = maxLevel + 1;
	const canvas = Array.from({ length: height }, () => Array(width).fill(' '));

	for (let i = 0; i < n; i++) {
		const topY = height - levels[i];
		const x = i * horizontalSpacing;

		// Write node index, supporting multi-digit labels.
		if (labeled) {
			const label = String(i);
			for (let k = 0; k < label.length; k++) {
				let x2 = x + k - label.length + 1;
				if (x2 < width) {
					canvas[topY - 1][x2] = label[k];
				}
			}
		} else {
			canvas[topY-1][x] = '╷';
		}

		for (const p of sets[i]) {
			const y2 = height - 1 - levels[p];
			const x2 = p * horizontalSpacing;

			canvas[y2][x] = '┘';

			for (let y = Math.min(topY, y2); y < Math.max(topY, y2); y++) {
				const cur = canvas[y][x];
				if (cur === '┘' || cur === '┤') canvas[y][x] = '┤';
				else canvas[y][x] = '│';
			}

			for (let xx = Math.min(x, x2); xx < Math.max(x, x2); xx++) {
				if (canvas[y2][xx] === '┤') canvas[y2][xx] = '┼';
				else if (canvas[y2][xx] === '│') canvas[y2][xx] = '╫'; // bridge
				else if (canvas[y2][xx] === '┘') canvas[y2][xx] = '┴';
				else if (canvas[y2][xx] === '╷') canvas[y2][xx] = '┌';
				else if (canvas[y2][xx] === ' ') canvas[y2][xx] = '─';
			}

		}
	}

	return [canvas.map(r => r.join('')).join('\n'), sequence.join(","), matrixString];
}

function matrixToSets(matrix) {
	let sets = [];
	for (let i = 0; i < matrix.length; i++) {
		let s = [];
		let j = i;
		for (let k = 0; k < matrix[i].length; k++) {
			j = matrix.findLastIndex((v, z) => z < j && v[0] < matrix[i][k]);
			if (j == -1) break;
			s.push(j);
		}
		sets.push(s);
	}
	return sets;
}