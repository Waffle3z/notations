class notation {
	static title = "Shifted LPrSS";
	
	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		return [0,0,n+1];
	}

	static expand(s, n) {
		let out = [...s];
		let cutNode = out.pop();

		let j = out.findLastIndex(x => x < cutNode);
		let i = out.findLastIndex((x, i) => x < cutNode && i < j);
		let increment = cutNode - s[i] - 1;

		let badPart = out.slice((s[j] == s[i] && i == j - 1) ? j : i);
		for (let x = 1; x <= n; x++) {
			out.push(...badPart.map(v => v + increment * x));
		}

		if (out.at(-1) === 0) out.pop(); // fix limits of limits expanding into successors
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