class notation {
	static title = "Strong HPrSS";
	
	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		return [0,n+1];
	}

	static expand(a, n) {
		let getParent = i => a.findLastIndex((v, j) => j < i && v < a[i]);
		let differences = a.map((v, i) => v - a[getParent(i)]);
		let parentDifference = differences[a.length-1];
		let root = getParent(a.length-1);
		if (parentDifference > 1) {
			root = a.length-1;
			let ancestor = root;
			while (true) {
				ancestor = getParent(ancestor);
				if (differences[ancestor] < differences[root]) {
					root = ancestor;
				}
				if (getParent(ancestor) == -1) {
					if (root == a.length-1) root = ancestor;
					break;
				}
			}
		}

		let out = [...a];
		let cutNode = out.pop();
		let increment = cutNode - a[root] - 1;
		let badPart = out.slice(root);
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