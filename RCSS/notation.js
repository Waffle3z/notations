class notation {
	static title = "RCSS";
	static header = "Restricted Child Sequence System";
	static footer = "<a href='viewer.html'>Row Viewer</a>";

	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		let a = [0,1,n+2];
		return a;
	}

	static expand(a, n) {
		let out = [...a];
		let cutNode = out.pop();
		function getParent(i) {
			return a.findLastIndex((v, j) => v < a[i] && j < i);
		}
		let maxDifferences = [];
		for (let i = 0; i < a.length; i++) {
			maxDifferences[i] = 0;
			let parent = getParent(i);
			if (parent != -1) {
				maxDifferences[parent] = Math.max(maxDifferences[parent], a[i] - a[parent]);
			}
		}
		let parent = a.findLastIndex(v => v < cutNode);
		if (parent == -1) return a;
		let diff = cutNode - a[parent];
		let rootIndex = parent;
		while (a[rootIndex] != 0) {
			if (maxDifferences[rootIndex] <= diff) break;
			rootIndex = getParent(rootIndex);
		}
		let increment = cutNode - a[rootIndex] - 1;
		let badPart = out.slice(rootIndex);
		for (let i = 1; i <= n; i++) {
			out.push(...badPart.map(v => v + increment * i));
		}
		return out;
	}

	static isSuccessor(array) {
		return array.length == 0 || array.at(-1) == 0;
	}

	static toString(array) {
		return JSON.stringify(array).slice(1,-1);
	}

	static fromString(s) {
		return JSON.parse("["+s+"]");
	}
};