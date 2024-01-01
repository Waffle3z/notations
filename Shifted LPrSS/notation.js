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
		let a = [];
		let last = s[s.length - 1];
		
		for (let i = 0; i < s.length - 1; i++) {
			a.push(s[i]);
		}

		for (let j = s.length - 2; j >= 0; j--) {
			if (s[j] < last) {
				for (let i = j - 1; i >= 0; i--) {
					if (s[i] < last) {
						let increment = last - s[i] - 1;
						let start = (s[j] == s[i] && i == j - 1) ? j : i;

						for (let x = 1; x <= n; x++) {
							for (let k = start; k < s.length - 1; k++) {
								a.push(s[k] + increment * x);
							}
						}
						break;
					}
				}
				break;
			}
		}

		if (a.at(-1) === 0) a.pop(); // fixes limits of limits expanding into successors
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