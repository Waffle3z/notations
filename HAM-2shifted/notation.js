function replaceAllEntries(s, n) {
	for (let i = 0; i < s.length; i++) {
		if (s[i] < n) {
			s[i] = n - 1;
		}
	}
	return s;
}

function maxLexicographicArray(arrays) {
	return arrays.reduce((maxArray, currentArray) => {
		for (let i = 0; i < maxArray.length; i++) {
			if (currentArray[i] > maxArray[i]) {
				return currentArray;
			} else if (currentArray[i] < maxArray[i]) {
				break;
			}
		}
		return maxArray;
	}, arrays[0]);
}

class notation {
	static title = "HAM 2-shifted";
	static header = "H-A-M's 2-shifted sequence system";
	static footer = "Definition of <a href='https://github.com/H-A-M-G-E-R/large-number-programs/blob/main/2-shifted%20sequence%20system.py'>2-shifted sequence system</a> by H-A-M-G-E-R";
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
		s = [...s];
		const last = s[s.length - 1];
		if (last === 0) {
			s.pop();
			return s;
		} else {
			if (s.length >= 3) {
				if ((s.at(-1) == s.at(-2)+1) && (s.at(-2) == s.at(-3))) { // expand terms like 0,0,1 to 0 instead of 0,0,0 and 1,1,2 to 1 instead of 1,1,1
					s.splice(-3, 3, ...Array(n).fill(s.at(-2)));
					return s;
				}
			}
			for (let i = s.length - 2; i >= 0; i--) {
				if (s[i] < last) {
					const t = replaceAllEntries(s.slice(i), last);
					for (let j = i - 1; j >= 0; j--) {
						if (s[j] <= last - 1) {
							const u = replaceAllEntries(s.slice(j), last);
							if (u < t) {
								const possibleBadParts = [];
								for (let k = j + 1; k < s.length; k++) {
									if (s[k] < last) {
										possibleBadParts.push(replaceAllEntries(s.slice(k, s.length - 1), last));
									}
								}
								const badPart = maxLexicographicArray(possibleBadParts);
								while ((badPart.at(-1) < last) && (badPart.at(-1) > s.at(-2)) && badPart.length > 1)
									badPart.pop();
								s.pop();
								for (let l = 0; l < n; l++) {
									s = s.concat(badPart);
								}
								if (s.at(-1) === 0) s.pop(); // fixes limits of limits expanding into successors
								return s;
							}
						}
					}
				}
			}
		}
	}

	static isSuccessor(array) {
		return array.length == 0 || array.at(-1) == 0;
	}

	static toString(array) {
		return JSON.stringify(array);
	}

	static fromString(s) {
		return JSON.parse(s);
	}
};