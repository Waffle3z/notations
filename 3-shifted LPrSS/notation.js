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
		let a = [];
		let last = s[s.length - 1];
		
		for (let i = 0; i < s.length - 1; i++) {
			a.push(s[i]);
		}

		for (let k = s.length - 2; k >= 0; k--) {
			if (s[k] < last) {
				for (let j = k - 1; j >= 0; j--) {
					if (s[j] < last) {
						for (let i = j - 1; i >= 0; i--) {
							if (s[i] < last) {
								let increment = last - s[i] - 1;
								let start = i;
								if (s[j] == s[i] && i == j-1) start = j;
								if (s[k] == s[i] && i == k-2) start = k;

								for (let x = 1; x <= n; x++) {
									for (let l = start; l < s.length - 1; l++) {
										a.push(s[l] + increment * x);
									}
								}
								break;
							}
						}
						break;
					}
				}
				break;
			}
		}

		if (a.at(-1) === 0) a.pop(); // fixes limits of limits expanding into successors
		if (a.at(-1) === 0) a.pop();
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