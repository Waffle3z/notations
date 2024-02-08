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
		let getParent = i => a.findLastIndex((v, j) => j < i && v < a[i]);
		let childDifferences = [];
		for (let i = 0; i < a.length; i++) {
			childDifferences[i] = 0;
			let parent = getParent(i);
			if (parent != -1) {
				childDifferences[parent] = Math.max(childDifferences[parent], a[i] - a[parent]);
			}
		}
		let rootIndex = getParent(a.length-1);
		if (rootIndex == -1) return a;
		let parentDifference = a[a.length-1] - a[rootIndex];
		if (parentDifference == 1) {
			while (childDifferences[rootIndex] > 1) {
				let parent = getParent(rootIndex);
				if (parent == -1) break;
				rootIndex = parent;
			}
		} else {
			while (childDifferences[rootIndex] >= parentDifference) {
				let parent = getParent(rootIndex);
				if (parent == -1) break;
				rootIndex = parent;
			}
		}
		
		let out = [...a];
		let cutNode = out.pop();
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