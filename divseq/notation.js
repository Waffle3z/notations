class notation {
	static title = "divseq";

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
			return a.findLastIndex((v, i) => (i < ind) && ((v <= Math.min(...a)) || (v < a[ind])));
		}
		let end = a.length - 1;
		let root = parent(end);
		let runn = root;
		while ((a[runn] > Math.min(...a)) && ((a.at(-1)-a[parent(runn)])*(a.length-root) >= (a.at(-1)-a[root])*(a.length-parent(runn)))) runn = parent(runn);
		let delta = a.pop()-a[runn]-1;
		for (let i = 1; i <= n; i++) {
			for (let j = runn; j < end; j++) {
				a.push(a[j]+delta*i);
			}
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