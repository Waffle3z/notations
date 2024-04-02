class notation {
	static title = "Shifted Weak FSS";
	static header = "Shifted Weak Fundamental Sequence System";

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
		return limit(n+1);
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
		s = s.replaceAll("[0,0,1]", "ω");
		s = s.replaceAll("[0,0,1,0]", "ω+1");
		s = s.replaceAll("[0,0,1,0,0]", "ω+2");
		s = s.replaceAll("[0,0,1,0,0,0]", "ω+3");
		s = s.replaceAll("[0,0,1,0,0,1]", "ω2");
		s = s.replaceAll("[0,0,1,0,0,1,0,0,1]", "ω3");
		s = s.replaceAll("[0,0,1,0,1]", "ω^2");
		s = s.replaceAll("[0,0,1,0,1,0,1]", "ω^3");
		s = s.replaceAll("[0,0,1,0,1,0,1,0,1]", "ω^4");
		s = s.replaceAll("[0,0,1,1]", "ω^ω");
		s = s.replaceAll("[0,0,1,1,1]", "ω^ω^ω");
		s = s.replaceAll("[0,0,1,1,1,1]", "ω^ω^ω^ω");
		s = s.replaceAll("[0,0,1,1,2]", "ε₀");
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

function expand(a, n) {
	if (a.length === 0) return [];
	let str = toString(a);
	let out = [...a];
	let cutNode = out.pop();
	let isLimit = !notation.isSuccessor(cutNode);

	if (str === "0,0,1") return Array(n).fill([]);
	if (n == 0) {
		for (let i = a.length - 2; i >= 0; i--) { // cut the last nondecreasing sequence
			if (notation.lessThan(a[i+1], a[i])) {
				return a.slice(0, i + 1);
			}
		}
		out = a.slice(0, -1);
		if (notation.isSuccessor(out)) out.pop();
		return out; // cut the last element if the whole sequence is nondecreasing
	}

	let j = out.findLastIndex(v => notation.lessThan(v, cutNode));
	let i = out.findLastIndex((v, i) => notation.lessThan(v, cutNode) && i < j);
	let rootIndex = (notation.equal(a[j], a[i]) && i == j - 1) ? j : i;
	let root = out[rootIndex];
	let badPart = [...out.slice(rootIndex)];

	if (isLimit) { // sequence ends in a limit
		let index = 0;
		while (notation.lessOrEqual(expand(cutNode, index), root)) {
			index++;
		}
		for (let i = index; i < index + n; i++) {
			let term = expand(cutNode, i);
			out.push(term, term);
		}
		if (notation.isSuccessor(out)) out.pop();
		return out;
	}
	
	let zeroth = [...out];
	if (notation.isSuccessor(zeroth)) zeroth.pop();
	let begin = notation.equal(zeroth, expand(a, 0)) ? 0 : 1;
	for (let i = begin; i < n; i++) {
		out.push(...badPart);
	}
	if (notation.isSuccessor(out)) out.pop();
	return out;
}

function limit(n) {
	if (n === 0) return [];
	if (n === 1) return [[]];
	let out = [];
	for (let i = 0; i < n; i++) {
		let term = limit(i);
		out.push(term, term);
	}
	return out;
}