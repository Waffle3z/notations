class notation {
	static title = "3-shifted LPrSS";
	
	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		return [0,0,0,n+1];
	}

	static expand(s, n) {
		let out = [...s];
		let cutNode = out.pop();

		let k = out.findLastIndex(x => x < cutNode);
		let j = out.findLastIndex((x, j) => x < cutNode && j < k);
		let i = out.findLastIndex((x, i) => x < cutNode && i < j);
		let increment = cutNode - s[i] - 1;

		let rootIndex = i;
		if (s[j] == s[i] && i == j-1) rootIndex = j;
		if (s[k] == s[i] && i == k-2) rootIndex = k;

		let badPart = out.slice(rootIndex);
		for (let x = 1; x <= n; x++) {
			out.push(...badPart.map(v => v + increment * x));
		}

		if (out.at(-1) === 0) out.pop(); // fix limits of limits expanding into successors
		if (out.at(-1) === 0) out.pop();
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