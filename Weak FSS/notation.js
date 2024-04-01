class notation {
	static title = "Weak FSS";
	static header = "Weak Fundamental Sequence System";

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
		s = s.replaceAll(/\[0[0-9,]*\]/g, function(x) {
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
		s = s.replaceAll("[0,1,ω]", "ε₀");
		s = s.replaceAll("[0,1,ω,ω]", "ε₁");
		s = s.replaceAll("[0,1,ω,ω,ω]", "ε₂");
		s = s.replaceAll("[0,1,ω,ω+1]", "ε_ω");
		s = s.replaceAll("[0,1,ω,ω2]", "ε_ε₀");
		s = s.replaceAll("[0,1,ω,ω2,ω3]", "ε_ε_ε₀");
		s = s.replaceAll("[0,1,ω,ω^2]", "ζ₀");
		s = s.replaceAll("[0,1,ω,ω^2,ω^3]", "η₀");
		s = s.replaceAll("[0,1,ω,ω^ω]", "φ(ω,0)");
		s = s.replaceAll("[1]", "Ω");
		s = s.replaceAll("[2]", "Ω₂");
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

	if (notation.lessOrEqual([[[]]], cutNode)) { // Ω
		if (!notation.isSuccessor(cutNode[0])) {
			out.push([notation.expand(cutNode[0], n)])
			return out;
		}
		let previous = [cutNode[0].slice(0, -1)];
		if (cutNode[0].length == 1) previous = [];
		let b = [[]];
		if (previous.length != 0) b.push(previous);
		for (let i = 0; i < n; i++) {
			b.push([...b]);
		}
		out.push(...b.slice(1));
		return out;
	}
	if (str === "0,1") return Array(n).fill([]);
	if (n == 0) {
		for (let i = a.length - 2; i >= 0; i--) { // cut the last nondecreasing sequence
			if (notation.lessThan(a[i+1], a[i])) {
				return a.slice(0, i + 1);
			}
		}
		return a.slice(0, -1); // cut the last element if the whole sequence is nondecreasing
	}

	let rootIndex = out.findLastIndex(v => notation.lessThan(v, cutNode));
	let root = out[rootIndex];

	if (!notation.isSuccessor(cutNode)) { // sequence ends in a limit
		let index = 0;
		while (notation.lessOrEqual(expand(cutNode, index), root)) {
			index++;
		}
		for (let i = index; i < index + n; i++) {
			out.push(expand(cutNode, i));
		}
		return out;
	}
	
	let badPart = [...out.slice(rootIndex)];
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
	return [[], [limit(n-1)]];
}

function standardizePrSS(s) {
	if (s.length == 0 || s[0] != 0) return s;
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