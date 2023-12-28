class notation {
	static lessOrEqual(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length) return false;
			if (a[i] != b[i]) return a[i] < b[i];
		}
		return a.length <= b.length;
	}

	static expandLimit(n) {
		return [n+1];
	}

	static expand(s, n) {
		s = [...s];
		s.push(...Array(n).fill(s.pop()-1));
		return s;
	}

	static isSuccessor(array) {
		return array.length == 0 || array.at(-1) == 0;
	}

	static toString(array) {
		return "("+JSON.stringify(array).slice(1,-1)+")";
	}

	static fromString(s) {
		return JSON.parse("["+s.slice(1,-1)+"]");
	}
};