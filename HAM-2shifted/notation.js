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

function expandArray(s, n) {
	s = [...s];
	const last = s[s.length - 1];
	if (last === 0) {
		s.pop();
		return s;
	} else if (arrayToString(s.slice(-3)) == "[0,0,1]") { // special case so 0,0,1 expands to 0 instead of 0,0,0
		s.splice(-3, 3, ...Array(n).fill(0));
		return s
	} else {
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
							for (let l = 0; l < badPart.length; l++) {
								if (badPart[l] < last) {
									badPart[l] = last - 1;
								}
							}
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

function arrayIsSuccessor(array) {
	return array.at(-1) == 0;
}

function arrayToString(array) {
	return JSON.stringify(array);
}

function stringToArray(s) {
	return JSON.parse(s);
}