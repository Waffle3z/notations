class notation {
	static title = "BrSS";
	static header = "Bracket Sequence System";
	static footer = "<a href='https://discord.com/channels/206932820206157824/209051725741424641/1218367946498506753'>Definition</a> by tb148 / 貓娘 “Catgirl” (v1.2.1)";

	static lessOrEqual(a, b) {
		return notation.toString(a).replaceAll(/./g, c => c == "[" ? 1 : 0) <= notation.toString(b).replaceAll(/./g, c => c == "[" ? 1 : 0);
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
		if (settings.notation == "Numeric") return numeric(notation.fromString(value));
		if (settings.notation == "Brackets") return value;
		if (settings.notation == "Hydra") {
			let list = [];
			let balance = 0;
			for (let i = 0; i < value.length; i++) {
				if (value[i] == "[") {
					list.push(balance);
					balance++;
				} else {
					balance--;
				}
			}
			return "(" + list.join(")(") + ")";
		}
		let s = value.replaceAll(/\]\[/g,"],[").replaceAll(/\[\]/g,"0");
		while (true) {
			let next = s.replaceAll(/\[([0,]+)\]/g,(_, n) => `${(n.length+1)/2}`);
			if (next == s) break;
			s = next;
		}
		s = s.replaceAll(/\[[0-9,]+\]/g, function(x) {
			return PrSStoCNF(JSON.parse(x));
		});
		s = s.replaceAll("[0,1,ω]", "ε₀");
		s = s.replaceAll("[0,1,ω,0]", "ε₀+1");
		s = s.replaceAll("[0,1,ω,1]", "ε₀·ω");
		s = s.replaceAll("[0,1,ω,2]", "ε₀^ω");
		s = s.replaceAll("[0,1,ω,ω]", "ε₁");
		s = s.replaceAll("[0,1,ω,ω,ω]", "ε₂");
		s = s.replaceAll("[0,1,ω,ω+1]", "ε_ω");
		s = s.replaceAll("[0,1,ω,ω^2]", "ζ₀");
		s = s.replaceAll("[0,1,ω,ω^ω]", "ψ₀(Ω₂)");
		s = s.replaceAll("[0,1,ω,ε₀]", "ψ₀(Ω_ω)");
		s = s.replaceAll("[0,1,ω,ε₀,ε₀]", "ψ₀(Ω_ω·2)");
		return s;
	}
};

// y begins with all of the same elements as x
function isPrefix(x, y) {
	return x.length < y.length && notation.toString(y.slice(0, x.length)) === notation.toString(x);
}

function replaceable(x, y) {
	if (x.length === 0 || y[y.length - 1].length === 0) return true;
	for (let i = x.length; i < y.length; i++) {
		if (!isPrefix(x[x.length - 1], y[i])) return false;
	}
	return replaceable(x[x.length - 1], y[y.length - 1]);
}

function replacePrefix(a, x, y) {
	if (x.length !== 0 && !isPrefix(x, a)) return a;
	let b = y;
	let flag = true;
	for (let i = x.length; i < a.length; i++) {
		let c = a[i];
		if (x.length === 0) {
			c = replacePrefix(c, x, y);
		} else if (flag && isPrefix(x[x.length - 1], c)) {
			c = replacePrefix(c, x[x.length - 1], y[y.length - 1]);
		} else {
			flag = false;
		}
		b = b.concat([c]);
	}	
	return b;
}

// remove the rightmost []
function decrement(a) {
	if (a.length === 0) return [];
	if (a[a.length - 1].length === 0) return a.slice(0, -1);
	return a.slice(0, -1).concat([decrement(a[a.length - 1])]);
}

function expand(a, n) {
	if (a.length === 0) return [];
	let k = a.findLastIndex((_, i) => replaceable(a.slice(0, i), a));
	const x = k == -1 ? [] : a.slice(0, k);
	const y = decrement(a);
	let b = y;
	for (let i = 0; i < n; i++) {
		b = replacePrefix(b, x, y);
	}
	if (notation.isSuccessor(b)) b.pop();
	return b;
}

function limit(n) {
	if (n === 0) return [];
	return [[], new Array(n).fill([])];
}

function count(a) {
	return a.reduce((acc, x) => acc + count(x), 1);
}

function numeric(a) {
	return a.map(x => count(x)).join(',');
}

function PrSStoCNF(s) {
	let out = "";
	let lastterm = "";
	let coefficient = 1;
	let root = 0;

	for (let i = s.length-2; i > 0; i--) {
		if (s[i] == s[i-1] && s[i+1] > s[i]) {
			s.splice(i, 1);
		}
	}

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
	settings.notation = "Simplified";
	document.querySelectorAll('input[name="notation"]').forEach(function(radioInput) {
		radioInput.addEventListener('change', function() {
			setNotation(radioInput.value);
		});
	});
});