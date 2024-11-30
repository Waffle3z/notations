class notation {
	static title = "SFSS";
	static header = "Strong Fundamental Sequence System";

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

	static convertToNotation(value, useDefault = false) {
		if (value == "") return "∅";
		if (settings.notation == "Brackets" && !useDefault) return value;

		const substitute = (s) => {
			if (!settings.showOrdinals) return s;
			s = s.replaceAll(/\[\]/g,"0").replaceAll(/\[0[0-9,]*\]/g, (x) => {
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
			for (let x of aliases) s = s.replaceAll(x[0], x[1]);
			return settings.showCommas ? s : s.replaceAll(",", " ");
		}

		const defaultConvert = (v) => {
			let s = v.replaceAll(/\]\[/g,"],[").replaceAll(/\[\]/g,"0");
			while (true) {
				let next = s.replaceAll(/\[([0,]+)\]/g,(_, n) => `${(n.length+1)/2}`);
				if (next == s) break;
				s = next;
			}
			return substitute(s);
		}
		const convertSequence = (sequence) => substitute("["+defaultConvert(notation.toString(sequence))+"]");

		if (settings.notation == "Paths" && !useDefault) {
			const sequence = notation.fromString(value);
			const cutNode = sequence.at(-1);
			if (notation.lessThan([], cutNode)) {
				const ancestor = getAncestor(cutNode);
				const fromPath = (path) => convertSequence(ancestor)+"["+path.join("][")+"]";
				const zeroth = expand(ancestor, 0);
				const strings = sequence.map(x => {
					if (notation.lessThan(x, ancestor) && notation.lessOrEqual(zeroth, x)) return fromPath(getPath(ancestor, x));
					return convertSequence(x)
				});
				return strings.join(settings.showCommas ? "," : " ");
			}
		}

		return defaultConvert(value);
	}
};

// debug utils
const toString = (x) => notation.convertToNotation(notation.toString(x));
const toStrings = (a) => a.map(x => toString(x));

function compareTerms(a, b) {
	for (let i = 0; i < a.length; i++) {
		if (i >= b.length) return 1; // a > b
		let c = compareTerms(a[i], b[i]);
		if (c != 0) return c;
	}
	return b.length > a.length ? -1 : 0;
}

const cache = new Map();
function expand(a, n) {
	if (a.length == 0) return [];
	if (n == 1) return a.slice(0, -1); // n == 0 requires finding the tail
	const hash = notation.toString(a)+"|"+n;
	if (cache.has(hash)) return cache.get(hash);

	const cutNode = a.at(-1);
	const parentIndex = a.findLastIndex(v => notation.lessThan(v, cutNode));
	if (notation.isSuccessor(cutNode)) {
		const out = a.slice(0, parentIndex);
		const tail = a.slice(parentIndex, -1);
		for (let i = 0; i < n; i++) out.push(...tail);
		cache.set(hash, out);
		return out;
	}

	// find an ordinal where cutNode is in its fundamental sequence
	const ancestor = getAncestor(cutNode);

	// rootIndex is the first recursive parent of the cut node that is not an element of the ancestor's fundamental sequence
	let rootIndex = parentIndex;
	while (getPath(ancestor, a[rootIndex]).length == 1) {
		rootIndex = a.findLastIndex((x, j) => j < rootIndex && notation.lessThan(x, a[rootIndex]));
	}

	if (n == 0) { // cut from the root node
		const out = a.slice(0, rootIndex);
		cache.set(hash, out);
		return out;
	}

	const parentPath = getPath(ancestor, a[parentIndex]);
	if (parentIndex == rootIndex) { // ascend the second index instead of the first
		const out = a.slice(0, -1);
		for (let i = 1; i < n; i++) {
			out.push(expand(cutNode, parentPath[1] + i), ...a.slice(parentIndex + 1, -1));
		}
		cache.set(hash, out);
		return out;
	}
	
	// expand the ancestor while ascending the first path index of each term in the tail less than the ancestor
	const tail = a.slice(rootIndex + 1, -1); // tail begins one index after rootIndex because the cut node is copied instead of the root
	const paths = tail.map(x => notation.lessThan(x, ancestor) ? getPath(ancestor, x) : []);
	const firstAscendingPath = paths.find(x => x.length > 0);
	const increment = parentPath[0] + 1 - firstAscendingPath[0];
	const out = a.slice(0, -1);
	for (let i = 1; i < n; i++) {
		const ascendedCutNode = expand(ancestor, parentPath[0] + 1 + increment * (i - 1));
		const ascendedParent = applyPath(ancestor, [parentPath[0] + increment * (i - 1), ...parentPath.slice(1)]);
		// expand into the first term greater than the parent node
		for (let expandIndex = 0; ; expandIndex++) {
			const expanded = expand(ascendedCutNode, expandIndex);
			if (notation.lessThan(ascendedParent, expanded)) {
				out.push(expanded);
				break;
			}
		}
		out.push(...tail.map((v, j) => {
			if (paths[j].length == 0) return v;
			return applyPath(ancestor, [paths[j][0] + increment * i, ...paths[j].slice(1)]);
		}));
	}
	cache.set(hash, out);
	return out;
}

function getAncestor(cutNode) {
	// create a sequence greater than the cut node and less than the sequence being expanded
	let ancestor = [];
	for (let i = 2; ; i++) { // start from 0,1
		const term = limit(i);
		if (notation.lessThan(cutNode, term)) {
			ancestor = term;
			break;
		}
		// try again with the last value repeated twice
		// this solves 0,1,ω,ε₀ getting stuck when the first limit(i) greater than the cut node is the same sequence
		term.push(term.at(-1));
		if (notation.lessThan(cutNode, term)) {
			ancestor = term;
			break;
		}
	}
	
	return applyPath(ancestor, getPath(ancestor, cutNode).slice(0, -1));
}

function applyPath(term, path) {
	for (let i of path) term = expand(term, i);
	return term;
}

function getPath(ancestor, target) {
	for (let i = 0; ; i++) {
		const term = expand(ancestor, i);
		if (notation.equal(target, term)) {
			return [i];
		} else if (notation.lessThan(target, term)) {
			return [i, ...getPath(term, target)];
		}
	}
}

function limit(n) {
	if (n == 0) return [];
	const out = [];
	for (let i = 0; i < n; i++) out.push(limit(i));
	return out;
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

function setNotation(newNotation) {
	settings.notation = newNotation;
	refreshTerms();
}

document.addEventListener("DOMContentLoaded", () => {
	settings.notation = "Ordinals";
	settings.showOrdinals = true;
	settings.showCommas = true;

	document.querySelectorAll('input[name="notation"]').forEach(function(radioInput) {
		radioInput.addEventListener('change', function() {
			setNotation(radioInput.value);
		});
	});

	const ordinalsCheckbox = document.getElementById("showOrdinals");
	ordinalsCheckbox.addEventListener('change', function() {
		settings.showOrdinals = ordinalsCheckbox.checked;
		refreshTerms();
	});

	const commasCheckbox = document.getElementById("showCommas");
	commasCheckbox.addEventListener('change', function() {
		settings.showCommas = commasCheckbox.checked;
		refreshTerms();
	});
});

const aliases = [
	["[0,1,ω]", "ε₀"],
	["[0,1,ω,ω]", "ε₁"],
	["[0,1,ω,ω,ω]", "ε₂"],
	["[0,1,ω,ω+1]", "ε_ω"],
	["[0,1,ω,ω+1,ω2]", "ε_ε₀"],
	["[0,1,ω,ω+1,ω2,ω2+1,ω3]", "ε_ε_ε₀"],
	["[0,1,ω,ω2]", "ζ₀"],
	["[0,1,ω,ω2,ω,ω2]", "ζ₁"],
	["[0,1,ω,ω2,ω,ω2,ω,ω2]", "ζ₂"],
	["[0,1,ω,ω2,ω+1]", "ζ_ω"],
	["[0,1,ω,ω2,ω2]", "η₀"],
	["[0,1,ω,ω2,ω2+1]", "φ(ω,0)"],
	["[0,1,ω,ω2,ω3]", "Γ₀"],
	["[0,1,ω,ω2,ω3,ω4]", "LVO"],
	["[0,1,ω,ω2,ω^2]", "ψ₀(Ω₂)"],
];