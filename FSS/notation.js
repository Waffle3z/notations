let version = "1";
document.addEventListener("DOMContentLoaded", () => {
	setTimeout(function() { // optional version parameter
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const requestedVersion = urlParams.get("version");
		if (requestedVersion) {
			version = requestedVersion;
		}
	}, 1);
});

class notation {
	static title = "FSS";
	static header = "Fundamental Sequence System";

	static lessOrEqual(a, b) {
		return compareTerms(a, b) <= 0;
	}

	static lessThan(a, b) {
		return compareTerms(a, b) === -1;
	}

	static equal(a, b) {
		return compareTerms(a, b) === 0;
	}

	static expandLimit(n) {
		return bigLimit(n+1);
	}

	static expand(a, n) {
		return expand(a, n);
	}

	static isSuccessor(array) {
		let s = notation.toString(array);
		return s.length == 0 || s.endsWith("[]");
	}

	static toString(array) {
		return JSON.stringify(array).slice(1,-1).replaceAll(/,/g, "");
	}

	static fromString(s) {
		return JSON.parse("["+s.replaceAll(/\]\[/g,"],[")+"]");
	}

	static convertToNotation(value) {
		if (value === "") return "∅";
		let s = value.replaceAll(/\]\[/g,"],[").replaceAll(/\[\]/g,"0");
		while (true) {
			let next = s.replaceAll(/\[([0,]+)\]/g,(_, n) => `${(n.length+1)/2}`);
			if (next == s) break;
			s = next;
		}
		s = s.replaceAll(/\[[0-9,]+\]/g, function(x) {
			let a = JSON.parse(x);

			for (let i = a.length-2; i > 0; i--) { // standardize
				if (a[i] == a[i-1] && a[i+1] > a[i]) {
					a.splice(i, 1);
				}
			}
			
			for (let i = 1; i < a.length; i++) {
				if (a[i] - a[i-1] > 1) return JSON.stringify(a);
			}
			return PrSStoCNF(standardizePrSS(a));
		});
		s = s.replaceAll("[0,1,3]", "ε₀");
		s = s.replaceAll("[0,1,4]", "ζ₀");
		s = s.replaceAll("[0,1,5]", "η₀");
		s = s.replaceAll("[0,1,ω]", "φ(ω,0)");
		return s;
	}
};

function compareTerms(a, b) {
	for (let i = 0; i < a.length; i++) {
		if (i >= b.length) return 1; // a > b
		let c = compareTerms(a[i], b[i]);
		if (c != 0) return c;
	}
	return b.length > a.length ? -1 : 0;
}

function toString(a) {
	if (a == null) return "null";
	return notation.convertToNotation(notation.toString(a));
}

// remove the rightmost []
function decrement(a) {
	if (a.length === 0) return [];
	if (a[a.length - 1].length === 0) return a.slice(0, -1);
	return a.slice(0, -1).concat([decrement(a[a.length - 1])]);
}

function searchForParent(root, target) {
	// find limits where x[0] <= root < target < x
	let candidates = [];
	let current = [[[]]];
	let iter = 0;
	while (true) {
		iter++;
		let rootIndex = findPrefixInExpansion(root, current)[1];
		let [next, nextIndex] = findPrefixInExpansion(target, current);
		if (nextIndex > rootIndex && rootIndex != -1) {
			candidates.push(current);
		}
		current = expand(current, nextIndex + 1);
		if (notation.isSuccessor(current)) break;
	}

	// find the candidate whose expansion contains the largest prefix of the root
	let parent, prefix;
	for (let i = 0; i < candidates.length; i++) {
		let index = findPrefixInExpansion(root, candidates[i])[1];
		let previous = expand(candidates[i], index);
		if (prefix == null || notation.lessThan(prefix, previous)) {
			parent = candidates[i];
			prefix = previous;
		}
	}

	return parent;
}

// find the largest term in the expansion of parent less than or equal to the target
function findPrefixInExpansion(term, parent) {
	if (notation.lessThan(parent, term)) return [null, -1]; // parent should be greater than or equal to term
	let index = 0;
	let element = expand(parent, 0);
	if (notation.lessThan(term, element)) return [null, -1]; // term should be at least parent[0]
	while (true) {
		let next = expand(parent, index + 1);
		if (notation.lessThan(term, next)) return [element, index];
		element = next;
		index++;
	}
}

let expandCache = new Map();
function cacheResult(hash, out) {
	expandCache.set(hash, deepcopy(out));
	return out;
}

function deepcopy(term) {
	return [...term.map(x => deepcopy(x))];
}

function expand(a, n) {
	let str = toString(a);
	let hash = JSON.stringify([a, n]);
	if (expandCache.has(hash)) return deepcopy(expandCache.get(hash));
	if (str === "1") return cacheResult(hash, limit(n));
	if (str === "0,1") return cacheResult(hash, Array(n).fill([]));
	if (a.length === 0) return [];
	if (n == 0) {
		for (let i = a.length - 2; i >= 0; i--) { // cut the last nondecreasing sequence
			if (notation.lessThan(a[i+1], a[i])) {
				return cacheResult(hash, a.slice(0, i + 1));
			}
		}
		return cacheResult(hash, a.slice(0, -1)); // cut the last element if the whole sequence is nondecreasing
	}
	let out = [...a];
	let cutNode = out.pop();
	if (!notation.isSuccessor(cutNode)) {
		if (version == "1.1") {
			out.push(expand(cutNode, n-1));
		} else {
			out.push(expand(cutNode, toString(cutNode) === "0,1" ? n : n-1));
		}
		return cacheResult(hash, out);
	}

	let predecessor = decrement(cutNode);
	let rootIndex = out.findLastIndex(v => notation.lessThan(v, cutNode));
	let root = out[rootIndex];
	let badPart = [predecessor, ...out.slice(rootIndex + 1)];
	if (notation.equal(root, predecessor)) { // cut node == root + 1
		let zeroth = [...out];
		if (notation.isSuccessor(zeroth)) zeroth.pop();
		let begin = notation.equal(zeroth, expand(a, 0)) ? 0 : 1;
		for (let i = begin; i < n; i++) {
			out.push(...badPart);
		}
		if (notation.isSuccessor(out)) out.pop();
		return cacheResult(hash, out);
	}

	let parent = searchForParent(root, predecessor);
	let indexRoot = findPrefixInExpansion(root, parent)[1];
	let indexPredecessor = findPrefixInExpansion(predecessor, parent)[1];
	let increment = indexPredecessor - indexRoot;
	for (let i = 1; i <= n; i++) {
		// for each element in the bad part, if it's in the parent then move the index and copy the suffix
		let copy = [...badPart].map((x, j) => {
			if (notation.lessThan(x, parent)) {
				let [prefix, index] = findPrefixInExpansion(x, parent);
				let term = expand(parent, index + increment * (j == 0 ? i - 1 : i));
				let innerTerm = term;
				let innerPrefix = prefix;
				let innerX = x;
				while (innerX.length == innerPrefix.length && innerX.length > 0) {
					innerX = innerX[innerX.length - 1];
					innerPrefix = innerPrefix[innerPrefix.length - 1];
					innerTerm = innerTerm[innerTerm.length - 1];
				}
				innerTerm.push(...innerX.slice(innerPrefix.length)); // copy suffix
				return term;
			}
			return x;
		});
		out.push(...copy);
	}

	return cacheResult(hash, out);
}

function bigLimit(n) {
	if (n === 0) return [];
	return [[], bigLimit(n-1)];
}

function limit(n) {
	if (n === 0) return [];
	let a = [];
	for (let i = 0; i < n; i++) {
		a.push(limit(i));
	}
	return a;
}

function standardizePrSS(s) {
	let siblings = [];
	let current;
	for (let i = 0; i < s.length; i++) {
		if (s[i] == 0) {
			current = [];
			siblings.push(current);
		}
		current.push(s[i]);
	}
	for (let i = 0; i < siblings.length; i++) {
		if (siblings[i].includes(1)) {
			siblings[i] = [0, ...standardizePrSS(siblings[i].slice(1).map(x => x-1)).map(x => x+1)];
		}
	}
	for (let i = siblings.length - 2; i >= 0; i--) {
		if (siblings[i] < siblings[i+1]) {
			siblings.splice(i, 1);
		}
	}
	return siblings.flat();
}

function PrSStoCNF(s) {
	let out = "";
	let lastterm = "";
	let coefficient = 1;
	let root = 0;

	for (let i = 0; i <= s.length; i++) {
		if ((s[i + 1] === s[0]) || (i + 1 >= s.length)) {
			let branches = 0;
			for (let j = root+1; j <= i; j++) {
				branches += s[j] === s[root+1] ? 1 : 0;
			}

			let term = ["1", "ω"][i - root] || (branches === 1 ? "ω^x" : "ω^(x)").replace("x", PrSStoCNF(s.slice(root+1, i+1))).replace(/\((\d+)\)/g, "$1");
			if (term === lastterm && i !== s.length) {
				coefficient += 1;
			} else {
				if (lastterm) {
					out += "+" + (coefficient === 1 ? lastterm : lastterm === "1" ? coefficient : lastterm + (lastterm === "ω" ? "" : "·") + coefficient);
				}
				lastterm = term;
				coefficient = 1;
			}
			root = i + 1;
		}
	}

	return out.substring(1);
}