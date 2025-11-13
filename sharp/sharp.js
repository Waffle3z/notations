function drawGraph(sets) {
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
	const maxIndexDigits = String(n - 1).length || 1;
	const horizontalSpacing = Math.max(3, maxIndexDigits);

	const width = n === 0 ? 0 : (n - 1) * horizontalSpacing + maxIndexDigits;
	const height = maxLevel + 1;
	const canvas = Array.from({ length: height }, () => Array(width).fill(' '));

	for (let i = 0; i < n; i++) {
		const topY = height - levels[i];
		const x = i * horizontalSpacing;

		// Write node index, supporting multi-digit labels.
		const label = String(i);
		for (let k = 0; k < label.length; k++) {
			if (x + k < width) {
				canvas[topY - 1][x + k] = label[k];
			}
		}

		for (const p of sets[i]) {
			const y2 = height - 1 - levels[p];
			const x2 = p * horizontalSpacing;

			// Starting column for the vertical/connector under the (possibly multi-digit) label.
			const vx = Math.min(x + (String(i).length - 1), width - 1);

			canvas[y2][vx] = '┘';

			for (let y = Math.min(topY, y2); y < Math.max(topY, y2); y++) {
				const cur = canvas[y][vx];
				if (cur === '┘' || cur === '┤') canvas[y][vx] = '┤';
				else canvas[y][vx] = '│';
			}

			for (let xx = Math.min(vx, x2) + 1; xx < Math.max(vx, x2); xx++) {
				if (canvas[y2][xx] === '┤') canvas[y2][xx] = '┼';
				else if (canvas[y2][xx] === '│') canvas[y2][xx] = '╫'; // bridge
				else if (canvas[y2][xx] === '┘') canvas[y2][xx] = '┴';
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