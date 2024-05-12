class notation {
	static title = "BrSS";
	static header = "Bracket Sequence System";
	static footer = "<a href='https://discord.com/channels/206932820206157824/209051725741424641/1238812305727164487'>Definition</a> by ghoqyew / 九尾狐 “Nine-Tailed Fox” (v2.0.0b1)";

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
		return s;
	}
};

// y begins with all of the same elements as x
function isPrefix(x, y) {
	return x.length < y.length && notation.toString(y.slice(0, x.length)) === notation.toString(x);
}

function replaceable(x, y) {
	if (y[y.length - 1].length === 0) return [true, y.length - x.length - 1];
	if (x.length === 0) return [false, 0];
	for (let i = x.length; i < y.length; i++) {
		if (!isPrefix(x[x.length - 1], y[i])) return [false, 0];
	}
	return replaceable(x[x.length - 1], y[y.length - 1]);
}

function insertPrefix(a, x) {
	return x.concat(a.map(b => insertPrefix(b, x)));
}

function replacePrefix(a, x, y, z) {
	let b = y;
	let flag = true;
	for (let i = x.length; i < a.length; i++) {
		let c = a[i];
		if (x.length === 0) {
			c = insertPrefix(c, z);
		} else if (flag && isPrefix(x[x.length - 1], c)) {
			c = replacePrefix(c, x[x.length - 1], y[y.length - 1], z);
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
	let l = 0;
	let k = a.findLastIndex((_, i) => {
		let res = replaceable(a.slice(0, i), a);
		if (res[0]) {
			l = res[1];
			return true;
		}
	});
	if (k == -1) {
		return a.slice(0, -1).concat([expand(a.at(-1), n)]);
	}
	const x = a.slice(0, k);
	const y = decrement(a);
	const z = Array(l).fill([]);
	let b = y;
	for (let i = 0; i < n; i++) {
		b = replacePrefix(b, x, y, z);
	}
	if (notation.isSuccessor(b)) b.pop();
	return b;
}

function limit(n) {
	if (n === 0) return [];
	return [[], Array(n).fill([])];
}

function numeric(a, n=0) {
	return [n].concat(...a.map(x => numeric(x, n + 1)));
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