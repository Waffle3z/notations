class notation {
	static title = "Parent LPrSS";

	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		return [0, n+1];
	}

	static expand(a, n) {
		function parent(ind) {
			return a.findLastIndex((v, i) => v == 0 || (i < ind && v < a[ind]));
		}
		let root = parent(a.length - 1);
		let cutNode = a.pop();
		let diff = cutNode - a[root];
		for (let i = 1; i < diff; i++) {
			root = parent(root);
			if (root == 0) break;
		}
		let delta = cutNode - a[root] - 1;
		let badPart = a.slice(root);
		for (let i = 1; i <= n; i++) {
			a = a.concat(badPart.map(v => v + delta*i));
		}
		return a;
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