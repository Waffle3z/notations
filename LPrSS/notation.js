class notation {
	static title = "LPrSS";

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
		let out = [...a];
		let cutNode = out.pop();
		let root = out.length-1;
		while (out[root] >= cutNode && root > 0) root--;
		let increment = cutNode - out[root] - 1;
		let badPart = out.slice(root);
		for (let i = 1; i < n; i++) {
			out = out.concat(badPart.map(v => v + increment * i));
		}
		return out
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